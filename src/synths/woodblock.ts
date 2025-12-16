export class WoodblockSynth {
	ac: AudioContext;
	osc1: OscillatorNode;
	osc2: OscillatorNode;
	mixNode: GainNode;
	envNode: GainNode;
	// Track scheduled noise nodes for cleanup
	private scheduledNoiseSources: AudioBufferSourceNode[] = [];
	private scheduledNoiseGains: GainNode[] = [];

	constructor(ac: AudioContext, destination: AudioNode) {
		this.ac = ac;
		// create nodes
		this.mixNode = ac.createGain();
		this.envNode = ac.createGain();
		this.osc1 = ac.createOscillator();
		this.osc2 = ac.createOscillator();

		// connect nodes
		this.mixNode.connect(destination);
		this.envNode.connect(this.mixNode);
		this.osc1.connect(this.envNode);
		this.osc2.connect(this.envNode);
		
		// set parameters
		this.envNode.gain.value = 0;
		this.osc1.type = 'sine';
		this.osc1.frequency.value = 600;
		this.osc2.type = 'sine';
		this.osc2.frequency.value = 1500;

		// start oscillators
		this.osc1.start();
		this.osc2.start();

	}

	private makeNoiseBuffer(dur = 0.02): AudioBuffer {
    const length = Math.floor(this.ac.sampleRate * dur);
    const buffer = this.ac.createBuffer(1, length, this.ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1; // white noise
    }
    return buffer;
  }

  // Noise FM on osc2 for a short attack
  private noiseFM(when: number, dur = 0.02, depthHz = 80) {
    const noiseSrc = this.ac.createBufferSource();
    noiseSrc.buffer = this.makeNoiseBuffer(dur);

    // This GainNode sets modulation depth *and* provides the envelope
    const depth = this.ac.createGain();
    depth.gain.setValueAtTime(0, when);

    // Short "pop" of modulation: 0 → depthHz → ~0 over `dur`
    depth.gain.linearRampToValueAtTime(depthHz, when + 0.001);
    depth.gain.exponentialRampToValueAtTime(0.01, when + dur);

    // Connect: noise → depth → osc2.frequency
    noiseSrc.connect(depth);
    depth.connect(this.osc2.frequency);

    noiseSrc.start(when);
    noiseSrc.stop(when + dur + 0.01);

    // Track for cleanup
    this.scheduledNoiseSources.push(noiseSrc);
    this.scheduledNoiseGains.push(depth);
  }

	scheduleAttack(when: number, freq: number, amp: number) {
    const g = this.envNode.gain;

    // base freqs
    this.osc1.frequency.setValueAtTime(freq, when);
    this.osc2.frequency.setValueAtTime(freq * 2.7, when); // slightly inharmonic

    // amp envelope
    g.cancelScheduledValues(when);
    g.setValueAtTime(0, when);

    const attackTime = 0.001;
    const decayTime = 0.12;
    g.linearRampToValueAtTime(amp, when + attackTime);
    g.exponentialRampToValueAtTime(0.0001, when + decayTime);

    // add noisy attack on osc2
    this.noiseFM(when, 0.015, 60); // tweak dur/depth
  }

  cancelScheduled(when?: number) {
    const t = when ?? this.ac.currentTime;
    this.envNode.gain.cancelScheduledValues(t);
    this.envNode.gain.setValueAtTime(0, t);
    this.osc1.frequency.cancelScheduledValues(t);
    this.osc2.frequency.cancelScheduledValues(t);

    // Clean up all scheduled noise nodes
    for (const src of this.scheduledNoiseSources) {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {
        // Ignore errors from already-stopped sources
      }
    }
    for (const gain of this.scheduledNoiseGains) {
      try {
        gain.disconnect();
      } catch (e) {
        // Ignore errors from already-disconnected nodes
      }
    }
    this.scheduledNoiseSources = [];
    this.scheduledNoiseGains = [];
  }

}
