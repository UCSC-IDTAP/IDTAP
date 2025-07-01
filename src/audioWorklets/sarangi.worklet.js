class BiquadFilter {
  constructor(b0, b1, b2, a1, a2) {
    this.b0 = b0; this.b1 = b1; this.b2 = b2;
    this.a1 = a1; this.a2 = a2;
    this.x1 = this.x2 = this.y1 = this.y2 = 0;
  }
  process(x) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y;
    return y;
  }
  static bandPass(sr, freq, q) {
    const w = 2 * Math.PI * freq / sr;
    const beta = Math.sin(w) / (2 * q);
    const b0 = (Math.sin(w) / 2) / (1 + beta);
    const b1 = 0;
    const b2 = -b0;
    const a1 = -2 * Math.cos(w) / (1 + beta);
    const a2 = (1 - beta) / (1 + beta);
    return new BiquadFilter(b0, b1, b2, a1, a2);
  }
  static notch(sr, freq, bw) {
    const w0 = 2 * Math.PI * freq / sr;
    const alpha = Math.sin(w0) * Math.sinh(Math.log(2) / 2 * bw * w0 / Math.sin(w0));
    const a0 = 1 + alpha;
    const b0 = 1 / a0;
    const b1 = -2 * Math.cos(w0) / a0;
    const b2 = 1 / a0;
    const a1 = -2 * Math.cos(w0) / a0;
    const a2 = (1 - alpha) / a0;
    return new BiquadFilter(b0, b1, b2, a1, a2);
  }
}

class SimpleLP {
  constructor(c) { this.c = c; this.s = 0; }
  process(x) { const y = (1 - this.c) * x + this.c * this.s; this.s = y; return y; }
}

const sampleRate = 48000;
const MAX_DELAY = 4096;
const MASK = MAX_DELAY - 1;

class DelayLine {
  constructor() {
    this.buf = new Float32Array(MAX_DELAY);
    this.read = 0;
    this.write = 1;
    this.len = 1;
  }
  setDelay(len) {
    this.len = len & MASK;
    this.write = (this.read + this.len) & MASK;
  }
  tick(x) {
    const y = this.buf[this.read];
    this.buf[this.write] = x;
    this.read = (this.read + 1) & MASK;
    this.write = (this.write + 1) & MASK;
    return y;
  }
  lastOut() { return this.buf[this.read]; }
}

const neckDelay = new DelayLine();
const bridgeDelay = new DelayLine();
const nutLP = new SimpleLP(0.9);
const bridgeLP = new SimpleLP(0.9);

const noiseFilter = BiquadFilter.bandPass(sampleRate, 1000, 1);
const resFreqs = [185, 275, 405, 460, 530];
const resFilters = resFreqs.map(f => BiquadFilter.bandPass(sampleRate, f, 1));
const notchFilter = BiquadFilter.notch(sampleRate, 10000, 1.4);

let baseDelay = sampleRate / 110 - 4;
let bowPos = 0.1;

function updateDelays(freq, position) {
  baseDelay = sampleRate / freq - 4;
  if (baseDelay < 1) baseDelay = 1;
  bowPos = position;
  const neck = Math.floor(baseDelay * (1 - bowPos));
  const bridge = Math.floor(baseDelay * bowPos);
  neckDelay.setDelay(neck);
  bridgeDelay.setDelay(bridge);
}

class Processor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'Frequency', defaultValue: 110, minValue: 50, maxValue: 2000 },
      { name: 'BowGain', defaultValue: 0.3, minValue: 0, maxValue: 1 },
      { name: 'Gain', defaultValue: 0.0, minValue: 0, maxValue: 1 },
      { name: 'BandPassFrequency', defaultValue: 800, minValue: 100, maxValue: 5000 },
      { name: 'BandPassQ', defaultValue: 1.0, minValue: 0.1, maxValue: 10 },
      { name: 'bowPosition', defaultValue: 0.1, minValue: 0, maxValue: 1 },
      { name: 'bowPressure', defaultValue: 0.3, minValue: 0, maxValue: 1 },
      { name: 'bowVelocity', defaultValue: 0.1, minValue: -1, maxValue: 1 }
    ];
  }

  constructor() {
    super();
    this.prevBandPassFreq = 800;
    this.prevBandPassQ = 1.0;
  }

  process(inputs, outputs, parameters) {
    const freq = parameters['Frequency'];
    const bowGain = parameters['BowGain'];
    const gain = parameters['Gain'];
    const bandPassFreq = parameters['BandPassFrequency'][0];
    const bandPassQ = parameters['BandPassQ'][0];
    const bowPosParam = parameters['bowPosition'];
    const bowPressureParam = parameters['bowPressure'];
    const bowVelocityParam = parameters['bowVelocity'];

    if (!closeTo(bandPassFreq, this.prevBandPassFreq) || !closeTo(bandPassQ, this.prevBandPassQ)) {
      noiseFilter.calculateBandpass(sampleRate, bandPassFreq, bandPassQ);
      this.prevBandPassFreq = bandPassFreq;
      this.prevBandPassQ = bandPassQ;
    }

    if (freq.length === 1 && bowPosParam.length === 1) {
      updateDelays(freq[0], bowPosParam[0]);
    }

    const out = outputs[0][0];
    if (!out) return true;

    for (let i = 0; i < out.length; i++) {
      const f = freq.length === 1 ? freq[0] : freq[i];
      const pos = bowPosParam.length === 1 ? bowPosParam[0] : bowPosParam[i];
      if (freq.length > 1 || bowPosParam.length > 1) {
        updateDelays(f, pos);
      }
      const pressureAlias = bowGain.length === 1 ? bowGain[0] : bowGain[i];
      const pressure = bowPressureParam.length === 1 ? bowPressureParam[0] : bowPressureParam[i];
      const bowPressure = pressureAlias !== 0.3 ? pressureAlias : pressure;
      const bowVel = bowVelocityParam.length === 1 ? bowVelocityParam[0] : bowVelocityParam[i];

      const bridgeOut = bridgeDelay.lastOut();
      const nutOut = neckDelay.lastOut();
      const bridgeRef = -bridgeLP.process(bridgeOut);
      const nutRef = -nutLP.process(nutOut);
      const stringVel = bridgeRef + nutRef;
      const deltaV = bowVel - stringVel;
      const newVel = bowPressure * Math.tanh(deltaV * 5);
      neckDelay.tick(bridgeRef + newVel);
      bridgeDelay.tick(nutRef + newVel);

      let resSig = bridgeOut + nutOut;
      const parallel = resFilters.map(fil => fil.process(resSig));
      resSig = parallel.reduce((a, v) => a + v, 0) * 0.2;
      resSig = notchFilter.process(resSig);
      const g = gain.length === 1 ? gain[0] : gain[i];
      out[i] = resSig * g;
    }
    return true;
  }
}

registerProcessor('sarangi', Processor);

function closeTo(a, b) { return Math.abs(a - b) < 0.000001; }
