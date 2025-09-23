const AMP = 1.25;

let dead;

class Processor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [
            {
                name: 'Frequency',
                defaultValue: 110,
                minValue: 50,
                maxValue: 2000,
            },
            {
                name: 'Cutoff',
                defaultValue: 0.5,
                minValue: 0,
                maxValue: 1,
            },
        ];
    }

    constructor() {
        super();
        this.port.onmessage = e => {
            if (e.data === 'reset') {
                reset();
            }
            if (e.data === 'status') {
                console.log('readPtr', readPtr, 
                            'writePtr', writePtr,
                            'dead?', dead ? 'yes' : 'no')
            }
            if (e.data === 'kill') {
                dead = true;
            }
        };
        dead = false;
    }


    process(inputs, outputs, params) {
        let freq = params['Frequency'][0];
        const cutoff = params['Cutoff'][0];
        const period = 1 / freq;
        setDelayTime(period);
        const out = outputs[0][0];
        const input = inputs[0][0];
        if (out) {
          for (let i = 0; i < out.length; ++i) {
              let x = input ? input[i] : 0;
              x += filter(delayOutput(), cutoff);
              delayInput(x);
              out[i] = AMP * x;
          }
        }
        if (dead === true) {
            return false;
        } else {
            return true;
        }
    }
}

registerProcessor('karplusStrong', Processor);

// const delay = new Float32Array(2048);
const delay = [...Array(2048)].map(() => 0);
let readPtr = 0;
let writePtr = 0;

function setDelayTime(time) {
    // eslint-disable-next-line no-undef
    writePtr = (readPtr + time * sampleRate) & 2047;
}

function delayInput(x) {
    delay[writePtr] = x;
    readPtr = (readPtr + 1) & 2047;
    writePtr = (writePtr + 1) & 2047;
}

function delayOutput() {
    return delay[readPtr];
}

let y1 = 0;

function filter(x, cutoff) {
    const y = cutoff * x + (1 - cutoff) * y1;
    y1 = y;
    return y;
}

function reset() {
    delay.fill(0);
    readPtr = 0;
    writePtr = 0;
    y1 = 0;
}
