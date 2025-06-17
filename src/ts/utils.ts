const getContrastingTextColor = (backgroundColor: string): string => {
  // Convert the background color to RGB
  const color = (backgroundColor.charAt(0) === '#') ? 
    backgroundColor.substring(1, 7) : 
    backgroundColor;
  const r = parseInt(color.substring(0, 2), 16); // Red
  const g = parseInt(color.substring(2, 4), 16); // Green
  const b = parseInt(color.substring(4, 6), 16); // Blue

  // Calculate the brightness of the background color
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Return either black or white based on the brightness
  return (brightness > 155) ? 'black' : 'white';

}

const pitchNumberToChroma = (pitchNumber: number) => {
  let chroma = pitchNumber % 12;
  while (chroma < 0) {
    chroma += 12;
  }
  return chroma
}

const displayTime = (dur: number) => {
  const hours = Math.floor(dur / 3600);
  let minutes: number | string = Math.floor((dur - hours * 3600) / 60);
  let seconds: number | string = Math.round(dur % 60);
  if (seconds.toString().length === 1) seconds = '0' + seconds;
  if (hours !== 0) {
    if (minutes.toString().length === 1) minutes = '0' + minutes;
    return ([hours, minutes, seconds]).join(':')
  } else {
    return minutes + ':' + seconds 
  }
}

const closeTo = (a: number, b: number) => Math.abs(a - b) < 0.000001;

const linSpace = (startVal: number, stopVal: number, cardinality: number) => {
  var arr = [];
  var step = (stopVal - startVal) / (cardinality - 1);
  for (var i = 0; i < cardinality; i++) {
    arr.push(startVal + (step * i));
  }
  return arr;
};

const escCssClass = (str: string) => {
  return str.replace(/([!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~])/g, '\\$1');
}

const cumsum = (sum: number = 0) => (sum = 0, (n: number) => sum += n);

const getClosest = (counts: number[], goal: number) => {
  return counts.reduce((prev, curr) => {
    return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev
  })
};

const isObject = (argument: any) => {
  return typeof argument === 'object' && argument !== null
}

const getStarts = (durArray: number[]) => {
  const cumsum: (value: number) => number = (sum => value => sum += value)(0);
  return [0].concat(durArray.slice(0, durArray.length - 1)).map(cumsum)
};

const getEnds = (durArray: number[]) => {
  const cumsum: (value: number) => number = (sum => value => sum += value)(0);
  return durArray.map(cumsum)
}

const isUpperCase = (str: string) => str === str.toUpperCase();

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

const findClosestStartTimeAfter = (startTimes: number[], timepoint: number) => {
  let closestIndex = -1;
  let closestDiff = Infinity;
  for (let i = 0; i < startTimes.length; i++) {
    if (startTimes[i] <= timepoint) continue; // Skip start times <= timepoint

    const diff = startTimes[i] - timepoint;
    if (diff < closestDiff) {
      closestDiff = diff;
      closestIndex = i;
    }
  }
  return closestIndex;
}

const  findClosestStartTime = (startTimes: number[], timepoint: number) => {
  let closestIndex = -1;
  let closestDiff = Infinity;

  for (let i = 0; i < startTimes.length; i++) {
    if (startTimes[i] > timepoint) continue; // Skip start times after timepoint

    const diff = timepoint - startTimes[i];
    if (diff < closestDiff) {
      closestDiff = diff;
      closestIndex = i;
    }
  }
  return closestIndex;
}


export { 
  getContrastingTextColor, 
  displayTime, 
  closeTo, 
  linSpace, 
  escCssClass,
  cumsum,
  getClosest,
  isUpperCase,
  sum,
  findClosestStartTime,
  findClosestStartTimeAfter,
  isObject,
  getStarts,
  getEnds,
  pitchNumberToChroma
};
