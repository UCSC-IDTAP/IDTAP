import * as d3CMap from 'd3-scale-chromatic';
import { CMap } from '@shared/types';
import { rgb, RGBColor } from 'd3-color';
import ndarray, { NdArray } from 'ndarray';
import ops from 'ndarray-ops';
import pako from  'pako';
import { ProcessMessage, WorkerMessage } from '@shared/types';

let extData: Uint8Array | undefined = undefined;
let extDataShape: [number, number] | undefined = undefined;
let initData: NdArray | undefined = undefined;
let croppedData: NdArray | undefined = undefined;
let verbose = false;
let scaledShape: [number, number] | undefined = undefined;
let scaledData: NdArray | undefined = undefined;
let intensifiedData: NdArray | undefined = undefined;
let imgData: ImageData | undefined = undefined;
let dispatcher: Dispatcher | undefined = undefined;
let intensityLUT: Uint8Array | undefined = undefined;
let cmapLUT: RGBColor[] | undefined = undefined;

let initLogMin = Math.log2(75);
let initLogMax = Math.log2(2400);
let maxVal = 255;
const maxCanvasWidth = 1000; // this needs to align with maxCanvasWidth in
let power = 1;
let cmap: CMap = CMap.Viridis;

enum TaskName {
  Scale = 'scale',
  Intensify = 'intensify',
  Colorize = 'colorize'
}

class Dispatcher {
  taskMatrix: {
    scaled: boolean,
    intensified: boolean,
    colorized: boolean,
    width: number,
    startX: number,
  }[];
  priorityQueue: number[] = [];
  backgroundQueue: { 
    canvasIdx: number;
    taskName: TaskName;
  }[] = [];
  queueRunning: boolean = false;

  constructor(scaledShape: [number, number]) {
    const width = scaledShape[1];
    const normalColumns = Math.floor(width / maxCanvasWidth);
    const extraColWidth = width % maxCanvasWidth;
    this.taskMatrix = [];
    for (let i = 0; i < normalColumns; i++) {
      this.taskMatrix.push({ 
        scaled: false, 
        intensified: false, 
        colorized: false,
        width: maxCanvasWidth,
        startX: i * maxCanvasWidth
      });
    }
    if (extraColWidth > 0) {
      this.taskMatrix.push({
        scaled: false,
        intensified: false,
        colorized: false,
        width: extraColWidth,
        startX: normalColumns * maxCanvasWidth
      });
    }
    this.resetBackgroundQueue(TaskName.Scale, true);
  }

  respawnTaskMatrix = () => {
    if (scaledShape === undefined) {
      throw new Error('scaledShape is not initialized')
    }
    const width = scaledShape[1];
    const normalColumns = Math.floor(width / maxCanvasWidth);
    const extraColWidth = width % maxCanvasWidth;
    this.taskMatrix = [];
    for (let i = 0; i < normalColumns; i++) {
      this.taskMatrix.push({ 
        scaled: false, 
        intensified: false, 
        colorized: false,
        width: maxCanvasWidth,
        startX: i * maxCanvasWidth
      });
    }
    if (extraColWidth > 0) {
      this.taskMatrix.push({
        scaled: false,
        intensified: false,
        colorized: false,
        width: extraColWidth,
        startX: normalColumns * maxCanvasWidth
      });
    }
  }


  startQueue = () => {
    while (this.backgroundQueue.length > 0 || this.priorityQueue.length > 0) {
      if (this.priorityQueue.length > 0) {
        const canvasIdx = this.priorityQueue.shift()!;
        this.processCol(canvasIdx);
      } else if (this.backgroundQueue.length > 0) {
        const { canvasIdx, taskName } = this.backgroundQueue.shift()!;
        this.processTaskForCol(canvasIdx, taskName);
      }
    }
    this.queueRunning = false;
  }

  addToPriorityQueue = (canvasIdx: number) => {
    this.priorityQueue = this.priorityQueue.filter(idx => idx !== canvasIdx);
    this.priorityQueue.push(canvasIdx);
    if (!this.queueRunning) {
      this.queueRunning = true;
      this.startQueue();
    }
  }

  resetBackgroundQueue = (taskName: TaskName, init: boolean = false) => {
    if (taskName === TaskName.Scale) {
      this.respawnTaskMatrix();
    } else if (taskName === TaskName.Intensify) {
      this.taskMatrix.forEach(task => {
        task.intensified = false;
        task.colorized = false;
      });
    } else if (taskName === TaskName.Colorize) {
      this.taskMatrix.forEach(task => {
        task.colorized = false;
      });
    }
    this.backgroundQueue = [];
    if (taskName === TaskName.Scale) {
      this.taskMatrix.forEach((_, i) => {
        this.backgroundQueue.push({ canvasIdx: i, taskName: TaskName.Scale });
      });
    }
    if (taskName === TaskName.Intensify || taskName === TaskName.Scale) {
      this.taskMatrix.forEach((_, i) => {
        this.backgroundQueue.push({ 
          canvasIdx: i, 
          taskName: TaskName.Intensify 
        });
      });
    }
    if (
      taskName === TaskName.Colorize || 
      taskName === TaskName.Intensify || 
      taskName === TaskName.Scale
    ) {
      this.taskMatrix.forEach((_, i) => {
        this.backgroundQueue.push({ 
          canvasIdx: i, 
          taskName: TaskName.Colorize 
        });
      });
    }
    if (!this.queueRunning && !init) {
      this.queueRunning = true;
      this.startQueue();
    }
  }

  processCol = (canvasIdx: number) => {
    if (canvasIdx >= this.taskMatrix.length) {
      throw new Error('canvasIdx out of bounds');
    }
    const task = this.taskMatrix[canvasIdx];
    if (!task.scaled) {
      scaleCol(task.startX, task.width);
      task.scaled = true;
    }
    if (!task.intensified) {
      intensifyCol(task.startX, task.width);
      task.intensified = true;
    }
    if (!task.colorized) {
      colorizeCol(task.startX, task.width);
      task.colorized = true;
    }
    sendImgSlice(task.startX, task.width, canvasIdx);
  }

  processTaskForCol = (
    canvasIdx: number, 
    taskName: TaskName
  ) => {
    const task = this.taskMatrix[canvasIdx];
    if (taskName === TaskName.Scale) {
      if (!task.scaled) {
        scaleCol(task.startX, task.width);
        task.scaled = true;
      }
    } else if (taskName === TaskName.Intensify) {
      if (!task.intensified) {
        intensifyCol(task.startX, task.width);
        task.intensified = true;
      }
    } else if (taskName === TaskName.Colorize) {
      if (!task.colorized) {
        colorizeCol(task.startX, task.width);
        task.colorized = true;
      }
    }
  }
}

const fetchArrayBuf = async (dataUrl: string) => {
  let now: number | undefined = undefined;
  if (verbose) {
    now = performance.now() as number;
  }
  const res = await fetch(dataUrl);
  if (verbose) {
    const dur = performance.now() - now!;
    self.postMessage(`fetch time: ${(dur / 1000).toFixed()}`);
    now = performance.now() as number;
  }
  const arrayBuf = await res.arrayBuffer();
  const data = pako.inflate(new Uint8Array(arrayBuf))
  if (verbose) {
    const dur = performance.now() - now!;
    self.postMessage(`array buffer time: ${(dur / 1000).toFixed()}`);
  }
  return data;
};

const fetchShape = async (shapeUrl: string) => {
  const res = await fetch(shapeUrl);
  const shape = await res.json() as { shape: [number, number] };
  return shape.shape;
}

const createIntensityLUT = (maxVal: number) => {
  const maxPowVal = Math.pow(maxVal, power);
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    lut[i] = Math.floor(Math.pow(i, power) / maxPowVal * 255);
  }
  return lut;
}

const createColorMapLUT = (cMapObj: any) => {
  const lut: RGBColor[] = new Array(256);
  for (let i = 0; i < 256; i++) {
    lut[i] = rgb(cMapObj(i / 255));
  }
  return lut;
}

const initialize = async (
    audioID: string, 
    logMin: number, 
    logMax: number,
    start: number,
    end: number,
  ) => {
  const dir = 'https://swara.studio/spec_data/';
  const dataUrl = dir + audioID + '/spec_data.gz';
  const shapeUrl = dir + audioID + '/spec_shape.json';
  try {
    const dataPromise = fetchArrayBuf(dataUrl);
    const shapePromise = fetchShape(shapeUrl);
    [extData, extDataShape] = await Promise.all([dataPromise, shapePromise]);
  } catch (e) {
    console.error(e); 
  }
  const f32ExtData = new Float32Array(extData!);
  initData = ndarray(f32ExtData, extDataShape!);
  const totalColumns = initData.shape[1];
  const colStart = Math.floor(totalColumns * start);
  const colEnd = Math.ceil(totalColumns * end);
  initData = initData.lo(0, colStart).hi(initData.shape[0], colEnd - colStart);
  crop(logMin, logMax);
  if (scaledShape === undefined) {
    throw new Error('scaledShape is not initialized')
  }
  let [height, width] = scaledShape;
  const scaledArr = new Float32Array(width *  height);
  scaledData = ndarray(scaledArr, scaledShape);
  const intensifiedArr = new Float32Array(width * height);
  intensifiedData = ndarray(intensifiedArr, scaledShape);
  const imgDataArr = new Uint8ClampedArray(width * height * 4);
  imgData = new ImageData(imgDataArr, width, height);
  cmapLUT = createColorMapLUT(d3CMap[cmap]);
  dispatcher = new Dispatcher(scaledShape);
  dispatcher.startQueue();
};

const crop = (logMin: number, logMax: number) => {
  if (!initData) throw new Error('initData is not initialized');
  const initHeight = initData.shape[0];
  let yMin = (logMin - initLogMin) / (initLogMax - initLogMin) * initHeight;
  let yMax = (logMax - initLogMin) / (initLogMax - initLogMin) * initHeight;
  yMin = Math.floor(yMin);
  yMax = Math.ceil(yMax);
  const newHeight = yMax - yMin;
  croppedData = initData
    .lo(initHeight - yMax, 0)
    .hi(newHeight, initData.shape[1]);
  maxVal = ops.sup(croppedData);
  intensityLUT = createIntensityLUT(maxVal);
}

const scaleCol = (startX: number, width: number) => {
  if (scaledShape === undefined) {
    throw new Error('scaledShape is not initialized')
  }
  if (croppedData === undefined) {
    throw new Error('croppedData is not initialized')
  }
  if (scaledData === undefined) {
    throw new Error('scaledData is not initialized')
  }
  const scaledHeight = scaledShape[0];
  const scaledWidth = scaledShape[1];
  const croppedHeight = croppedData.shape[0];
  const croppedWidth = croppedData.shape[1];
  const xScale = croppedWidth / scaledWidth;
  const yScale = croppedHeight / scaledHeight;
  for (let i = 0; i < scaledHeight; i++) {
    for (let j = startX; j < startX + width; j++) {
      const y = i * yScale;
      const x = j * xScale;
      const y1 = Math.floor(y);
      const y2 = Math.min(Math.ceil(y), croppedHeight - 1);
      const x1 = Math.floor(x);
      const x2 = Math.min(Math.ceil(x), croppedWidth - 1);
      const a = y - y1;
      const b = x - x1;
      let y2x1 = croppedData.get(y2, x1) ?? 0;
      let y1x1 = croppedData.get(y1, x1) ?? 0;
      let y1x2 = croppedData.get(y1, x2) ?? 0;
      let y2x2 = croppedData.get(y2, x2) ?? 0;
      let val = (1 - a) * ((1 - b) * y1x1 + b * y1x2) + 
        a * ((1 - b) * y2x1 + b * y2x2);
      val = Math.round(val);
      scaledData.set(i, j, val);
    }
  }
}

const intensifyCol = (startX: number, width: number) => {
  if (scaledData === undefined) {
    throw new Error('scaledData is not initialized')
  }
  if (scaledShape === undefined) {
    throw new Error('scaledShape is not initialized')
  }
  if (intensifiedData === undefined) {
    throw new Error('intensifiedData is not initialized')
  }
  if (intensityLUT === undefined) {
    throw new Error('intensityLUT is not initialized')
  }
  if (power !== 1) {
    for (let i = 0; i < scaledShape[0]; i++) {
      for (let j = startX; j < startX + width; j++) {
        let val = scaledData.get(i, j)
        val = intensityLUT[val];
        intensifiedData.set(i, j, val);
      }
    }
  } else {
    for (let i = 0; i < scaledShape[0]; i++) {
      for (let j = startX; j < startX + width; j++) {
        intensifiedData.set(i, j, scaledData.get(i, j));
      }
    }
  }
}

const colorizeCol = (startX: number, width: number) => {
  if (imgData === undefined) {
    throw new Error('imgData is not initialized')
  }
  if (intensifiedData === undefined) {
    throw new Error('intensifiedData is not initialized')
  }
  if (cmapLUT === undefined) {
    throw new Error('cmapLUT is not initialized')
  }
  // console.log(cmapLUT)
  const imgDataHeight = imgData.height;
  const imgDataWidth = imgData.width;
  const imgDataData = imgData.data;
  for (let i = 0; i < imgDataHeight; i++) {
    for (let j = startX; j < startX + width; j++) {
      const val = intensifiedData.get(i, j);
      const idx = (i * imgDataWidth + j) * 4;
      const color = cmapLUT[val];
      if (color === undefined) {
        debugger;
      }
      imgDataData[idx] = color.r;
      imgDataData[idx + 1] = color.g;
      imgDataData[idx + 2] = color.b;
      imgDataData[idx + 3] = 255;
    }
  }
}

const sendImgSlice = (startX: number, width: number, canvasIdx: number) => {
  if (imgData === undefined) {
    throw new Error('imgData is not initialized')
  }
  const slice = new Uint8ClampedArray(width * imgData.height * 4);
  for (let y = 0; y < imgData.height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * imgData.width + x + startX) * 4;
      const destIdx = (y * width + x) * 4;
      [0, 1, 2, 3].forEach(i => slice[destIdx + i] = imgData!.data[srcIdx + i]);
    }
  }
  const sliceImgData = new ImageData(slice, width, imgData.height);
  const msg = {
    msg: 'render',
    payload: sliceImgData,
    canvasIdx
  };
  self.postMessage(msg, [slice.buffer])
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  if (e.data.msg === 'process') {
    const data = e.data.payload as ProcessMessage;
    const {
      type,
      logMin,
      logMax,
      newScaledShape,
      newPower,
      newCMap,
      audioID,
      newVerbose, 
      normedStart,
      normedEnd
    } = data;
    if (type === 'initial') {
      if (audioID === undefined) {
        throw new Error('audioID is undefined');
      }
      if (logMin === undefined || logMax === undefined) {
        throw new Error('logMin or logMax is undefined');
      }
      if (newScaledShape === undefined) {
        throw new Error('newScaledShape is undefined');
      }
      if (newPower !== undefined) {
        power = newPower 
      }
      if (newCMap !== undefined) {
        cmap = newCMap;
      }
      if (newVerbose !== undefined) {
        verbose = newVerbose;
      }
      scaledShape = newScaledShape;
      try {
        let start = normedStart === undefined ? 0 : normedStart;
        let end = normedEnd === undefined ? 1 : normedEnd;
        await initialize(audioID, logMin, logMax, start, end);
      } catch (e) {
        console.error(e);
      }
    } else {
      while (dispatcher === undefined) {
        await new Promise(r => setTimeout(r, 100));
      }
      if (type === 'crop') {
        if (logMin === undefined || logMax === undefined) {
          throw new Error('logMin or logMax is undefined');
        }
        crop(logMin, logMax);
        dispatcher!.resetBackgroundQueue(TaskName.Scale);
      } else if (type === 'scale') {
        if (newScaledShape === undefined) {
          throw new Error('newScaledShape is undefined');
        }
        scaledShape = newScaledShape;
        let [height, width] = scaledShape;
        const scaledArr = new Float32Array(width * height);
        scaledData = ndarray(scaledArr, scaledShape);
        const intensifiedArr = new Float32Array(width * height);
        intensifiedData = ndarray(intensifiedArr, scaledShape);
        const imgDataArr = new Uint8ClampedArray(width * height * 4);
        imgData = new ImageData(imgDataArr, width, height);
        cmapLUT = createColorMapLUT(d3CMap[cmap]);
        intensityLUT = createIntensityLUT(maxVal);
        dispatcher!.resetBackgroundQueue(TaskName.Scale);
      } else if (type === 'power') {
        if (newPower === undefined) {
          throw new Error('newPower is undefined');
        }
        power = newPower;
        intensityLUT = createIntensityLUT(maxVal);
        dispatcher!.resetBackgroundQueue(TaskName.Intensify);
        self.postMessage('updateObserver');
      } else if (type === 'color') {
        if (newCMap === undefined) {
          throw new Error('newCMap is undefined');
        }
        
        cmap = newCMap;
        cmapLUT = createColorMapLUT(d3CMap[cmap]);
        dispatcher!.resetBackgroundQueue(TaskName.Colorize);
        self.postMessage('updateObserver');
      } else if (type === 'powerAndColor') {
        if (newPower === undefined) {
          throw new Error('newPower is undefined');
        }
        if (newCMap === undefined) {
          throw new Error('newCMap is undefined');
        }
        power = newPower;
        cmap = newCMap;
        intensityLUT = createIntensityLUT(maxVal);
        cmapLUT = createColorMapLUT(d3CMap[cmap]);
        dispatcher!.resetBackgroundQueue(TaskName.Intensify);
        dispatcher!.resetBackgroundQueue(TaskName.Colorize);
        self.postMessage('updateObserver');
      }
    }
  } else if (e.data.msg === 'requestRenderData') {
    while (dispatcher === undefined) {
      await new Promise(r => setTimeout(r, 100));
    }
    const { canvasIdx, startX, width } = e.data.payload as {
      canvasIdx: number,
      startX: number,
      width: number
    };
    // const canvasIdx = e.data.payload.canvasIdx!;
    dispatcher.addToPriorityQueue(canvasIdx);
  }
}
