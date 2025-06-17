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
            {
                name: 'stringGain0',
                defaultValue: 1.0,
                minValue: 0,
                maxValue: 1,
            },
            {
                name: 'stringGain1',
                defaultValue: 1.0,
                minValue: 0,
                maxValue: 1,
            },
            {
                name: 'stringGain2',
                defaultValue: 1.0,
                minValue: 0,
                maxValue: 1,
            },
            {
                name: 'stringGain3',
                defaultValue: 1.0,
                minValue: 0,
                maxValue: 1,
            },
        ];
    }

    constructor() {
        super();
        // 4 delay lines for 4 strings
        this.delay0 = Array(2048).fill(0);
        this.delay1 = Array(2048).fill(0);
        this.delay2 = Array(2048).fill(0);
        this.delay3 = Array(2048).fill(0);
        
        // Initial delay for strum effect
        this.initDelay0 = Array(2048).fill(0);
        this.initDelay1 = Array(2048).fill(0);
        this.initDelay2 = Array(2048).fill(0);
        this.initDelay3 = Array(2048).fill(0);
        
        // Read/write pointers for main delays
        this.readPtr0 = 0;
        this.readPtr1 = 0;
        this.readPtr2 = 0;
        this.readPtr3 = 0;
        this.writePtr0 = 0;
        this.writePtr1 = 0;
        this.writePtr2 = 0;
        this.writePtr3 = 0;
        
        // Initial delay pointers for strum timing
        this.initWritePtr0 = 0;
        this.initWritePtr1 = (2 ** -8 * sampleRate) & 2047;
        this.initWritePtr2 = (2 ** -7 * sampleRate) & 2047;
        this.initWritePtr3 = (2 ** -6 * sampleRate) & 2047;
        this.initReadPtr0 = 0;
        this.initReadPtr1 = 0;
        this.initReadPtr2 = 0;
        this.initReadPtr3 = 0;
        
        // Filter states for each string
        this.y1 = [0, 0, 0, 0];
    }

    setDelayTime(time0, time1, time2, time3) {
        this.writePtr0 = (this.readPtr0 + time0 * sampleRate) & 2047;
        this.writePtr1 = (this.readPtr1 + time1 * sampleRate) & 2047;
        this.writePtr2 = (this.readPtr2 + time2 * sampleRate) & 2047;
        this.writePtr3 = (this.readPtr3 + time3 * sampleRate) & 2047;
    }

    delayInput(x0, x1, x2, x3) {
        this.delay0[this.writePtr0] = x0;
        this.delay1[this.writePtr1] = x1;
        this.delay2[this.writePtr2] = x2;
        this.delay3[this.writePtr3] = x3;

        this.readPtr0 = (this.readPtr0 + 1) & 2047;
        this.writePtr0 = (this.writePtr0 + 1) & 2047;
        this.readPtr1 = (this.readPtr1 + 1) & 2047;
        this.writePtr1 = (this.writePtr1 + 1) & 2047;
        this.readPtr2 = (this.readPtr2 + 1) & 2047;
        this.writePtr2 = (this.writePtr2 + 1) & 2047;
        this.readPtr3 = (this.readPtr3 + 1) & 2047;
        this.writePtr3 = (this.writePtr3 + 1) & 2047;
    }

    initDelayInput(x) {
        this.initDelay0[this.initWritePtr0] = x;
        this.initDelay1[this.initWritePtr1] = x;
        this.initDelay2[this.initWritePtr2] = x;
        this.initDelay3[this.initWritePtr3] = x;
        
        this.initReadPtr0 = (this.initReadPtr0 + 1) & 2047;
        this.initWritePtr0 = (this.initWritePtr0 + 1) & 2047;
        this.initReadPtr1 = (this.initReadPtr1 + 1) & 2047;
        this.initWritePtr1 = (this.initWritePtr1 + 1) & 2047;
        this.initReadPtr2 = (this.initReadPtr2 + 1) & 2047;
        this.initWritePtr2 = (this.initWritePtr2 + 1) & 2047;
        this.initReadPtr3 = (this.initReadPtr3 + 1) & 2047;
        this.initWritePtr3 = (this.initWritePtr3 + 1) & 2047;
    }

    delayOutput(i) {
        return [
            this.delay0[this.readPtr0], 
            this.delay1[this.readPtr1],
            this.delay2[this.readPtr2],
            this.delay3[this.readPtr3]
        ][i];
    }

    initDelayOutput(i) {
        return [
            this.initDelay0[this.initReadPtr0],
            this.initDelay1[this.initReadPtr1],
            this.initDelay2[this.initReadPtr2],
            this.initDelay3[this.initReadPtr3]
        ][i];
    }

    filter(x, cutoff, i) {
        const y = cutoff * x + (1 - cutoff) * this.y1[i];
        this.y1[i] = y;
        return y;
    }

    process(inputs, outputs, params) {
        const freq0 = params['freq0'][0];
        const freq1 = params['freq1'][0];
        const freq2 = params['freq2'][0];
        const freq3 = params['freq3'][0];
        const cutoff = params['Cutoff'][0];
        const stringGain0 = params['stringGain0'][0];
        const stringGain1 = params['stringGain1'][0];
        const stringGain2 = params['stringGain2'][0];
        const stringGain3 = params['stringGain3'][0];

        this.setDelayTime(1 / freq0, 1 / freq1, 1 / freq2, 1 / freq3);

        const out = outputs[0];
        const input = inputs[0][0];

        if (out && out[0]) {
            for (let i = 0; i < out[0].length; ++i) {
                const inputSample = input ? input[i] : 0;
                
                this.initDelayInput(inputSample);
                
                // Get delayed input for each string (strum effect)
                const x0 = inputSample + this.initDelayOutput(0);
                const x1 = inputSample + this.initDelayOutput(1);
                const x2 = inputSample + this.initDelayOutput(2);
                const x3 = inputSample + this.initDelayOutput(3);
                
                // Apply string resonance and filtering
                let y0 = x0 + this.filter(this.delayOutput(0), cutoff, 0);
                let y1 = x1 + this.filter(this.delayOutput(1), cutoff, 1);
                let y2 = x2 + this.filter(this.delayOutput(2), cutoff, 2);
                let y3 = x3 + this.filter(this.delayOutput(3), cutoff, 3);
                
                // Apply individual string gains (smooth volume control, no pops)
                y0 *= stringGain0;
                y1 *= stringGain1;
                y2 *= stringGain2;
                y3 *= stringGain3;
                
                this.delayInput(y0, y1, y2, y3);
                
                // Mix all strings to output
                const mixedOutput = AMP * (y0 + y1 + y2 + y3) * 0.25; // Scale by 1/4 to prevent clipping
                
                // Output to both channels
                out[0][i] = mixedOutput;
                if (out[1]) {
                    out[1][i] = mixedOutput;
                }
            }
        }
        return true;
    }
}

registerProcessor('chikaris4', Processor);
