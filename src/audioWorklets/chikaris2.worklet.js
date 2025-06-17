const AMP = 4.0;

class Processor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [
            {
                name: 'freq0',
                defaultValue: 110,
                minValue: 50,
                maxValue: 2000,
            },
            {
                name: 'freq1',
                defaultValue: 110,
                minValue: 50,
                maxValue: 2000,
            },
            {
                name: 'freq2',
                defaultValue: 110,
                minValue: 50,
                maxValue: 2000,
            },
            {
                name: 'freq3',
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
        this.delay0 = Array(2048).fill(0);
        this.delay1 = Array(2048).fill(0);
        this.initDelay1 = Array(2048).fill(0);
        this.readPtr0 = 0;
        this.readPtr1 = 0;
        this.writePtr0 = 0;
        this.writePtr1 = 0;
        this.initWritePtr1 = (2 ** -8 * sampleRate) & 2047;
        this.initReadPtr1 = 0;
        this.y1 = [0, 0, 0, 0];
    }

    setDelayTime(time0, time1) {
        this.writePtr0 = (this.readPtr0 + time0 * sampleRate) & 2047;
        this.writePtr1 = (this.readPtr1 + time1 * sampleRate) & 2047;
    }

    delayInput(x0, x1) {
        this.delay0[this.writePtr0] = x0;
        this.delay1[this.writePtr1] = x1;

        this.readPtr0 = (this.readPtr0 + 1) & 2047;
        this.writePtr0 = (this.writePtr0 + 1) & 2047;
        this.readPtr1 = (this.readPtr1 + 1) & 2047;
        this.writePtr1 = (this.writePtr1 + 1) & 2047;
    }

    initDelayInput(x) {
        this.initDelay1[this.initWritePtr1] = x;
        this.initReadPtr1 = (this.initReadPtr1 + 1) & 2047;
        this.initWritePtr1 = (this.initWritePtr1 + 1) & 2047;
    }

    delayOutput(i) {
        return [this.delay0[this.readPtr0], this.delay1[this.readPtr1]][i];
    }

    initDelayOutput(i) {
        return [this.initDelay1[this.initReadPtr1]][i - 1];
    }

    filter(x, cutoff, i) {
        const y = cutoff * x + (1 - cutoff) * this.y1[i];
        this.y1[i] = y;
        return y;
    }

    process(inputs, outputs, params) {
        let freq0 = params['freq0'][0];
        let freq1 = params['freq1'][0];
        const cutoff = params['Cutoff'][0];

        this.setDelayTime(1 / freq0, 1 / freq1);

        const out = outputs[0][0];
        const input = inputs[0][0];

        if (out) {
            for (let i = 0; i < out.length; ++i) {
                let x0 = input ? input[i] : 0;

                this.initDelayInput(input ? input[i] : 0);
                let x1 = this.initDelayOutput(1);

                x0 += this.filter(this.delayOutput(0), cutoff, 0);
                x1 += this.filter(this.delayOutput(1), cutoff, 1);

                this.delayInput(x0, x1);
                outputs[0][0][i] = AMP * x0;
                outputs[1][0][i] = AMP * x1;
            }
        }
        return true;
    }
}

registerProcessor('chikaris', Processor);
