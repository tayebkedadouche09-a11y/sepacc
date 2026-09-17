/**
 * Procedural ambient audio — no external files, no network.
 * User-gesture required to start (browser policy).
 * Volume capped for comfort.
 */

export type AmbientWeather = "clear" | "partly" | "overcast" | "fog" | "drizzle" | "rain";
export type AmbientBiome = "space" | "coast" | "mountains" | "desert" | "plains";
export type AmbientPeriod = "dawn" | "sunrise" | "day" | "golden" | "sunset" | "dusk" | "night";

type AmbientState = {
  weather: AmbientWeather;
  biome: AmbientBiome;
  period: AmbientPeriod;
};

const MAX_MASTER = 0.22;

function noiseBuffer(ctx: AudioContext, seconds = 2): AudioBuffer {
  const rate = ctx.sampleRate;
  const len = rate * seconds;
  const buf = ctx.createBuffer(1, len, rate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

export class AmbientEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private padGain: GainNode | null = null;
  private rainSource: AudioBufferSourceNode | null = null;
  private windSource: AudioBufferSourceNode | null = null;
  private padOsc: OscillatorNode[] = [];
  private thunderTimer: number | null = null;
  private enabled = false;
  private muted = true;
  private state: AmbientState = { weather: "clear", biome: "space", period: "night" };

  get isMuted() {
    return this.muted;
  }

  get isEnabled() {
    return this.enabled;
  }

  async unlock() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);

      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.value = 0;
      this.rainGain.connect(this.master);

      this.windGain = this.ctx.createGain();
      this.windGain.gain.value = 0;
      this.windGain.connect(this.master);

      this.padGain = this.ctx.createGain();
      this.padGain.gain.value = 0;
      this.padGain.connect(this.master);

      this.startNoiseLayers();
      this.startPad();
    }
    if (this.ctx.state === "suspended") await this.ctx.resume();
    this.enabled = true;
    this.muted = false;
    this.applyGains(true);
    this.scheduleThunder();
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (!this.master || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.linearRampToValueAtTime(m ? 0 : MAX_MASTER, t + 0.4);
    if (m && this.thunderTimer) {
      window.clearTimeout(this.thunderTimer);
      this.thunderTimer = null;
    }
    if (!m) this.scheduleThunder();
  }

  update(state: AmbientState) {
    this.state = state;
    this.applyGains(false);
    this.retunePad();
  }

  private startNoiseLayers() {
    if (!this.ctx || !this.rainGain || !this.windGain) return;
    const buf = noiseBuffer(this.ctx, 3);

    // Rain: highpassed noise
    const rain = this.ctx.createBufferSource();
    rain.buffer = buf;
    rain.loop = true;
    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = "bandpass";
    rainFilter.frequency.value = 1800;
    rainFilter.Q.value = 0.6;
    rain.connect(rainFilter);
    rainFilter.connect(this.rainGain);
    rain.start();
    this.rainSource = rain;

    // Wind: lowpassed noise
    const wind = this.ctx.createBufferSource();
    wind.buffer = buf;
    wind.loop = true;
    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = "lowpass";
    windFilter.frequency.value = 400;
    wind.connect(windFilter);
    windFilter.connect(this.windGain);
    wind.start();
    this.windSource = wind;
  }

  /** Soft piano-like pad: stacked sine partials (no sample files) */
  private startPad() {
    if (!this.ctx || !this.padGain) return;
    const freqs = this.padFrequencies();
    for (const f of freqs) {
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      const g = this.ctx.createGain();
      g.gain.value = 0.12;
      osc.connect(g);
      g.connect(this.padGain);
      osc.start();
      this.padOsc.push(osc);
    }
  }

  private padFrequencies(): number[] {
    const { biome, period } = this.state;
    // Gentle chord centers by landscape mood
    if (biome === "coast" || period === "sunrise") return [196, 246.94, 293.66]; // G minor-ish calm
    if (biome === "desert" || period === "sunset") return [174.61, 220, 261.63]; // warm
    if (biome === "mountains") return [146.83, 196, 246.94]; // deeper
    if (biome === "plains" || period === "day") return [261.63, 329.63, 392]; // brighter
    return [130.81, 164.81, 196]; // night / space
  }

  private retunePad() {
    if (!this.ctx || this.padOsc.length === 0) return;
    const freqs = this.padFrequencies();
    const t = this.ctx.currentTime;
    this.padOsc.forEach((osc, i) => {
      const f = freqs[i % freqs.length];
      osc.frequency.cancelScheduledValues(t);
      osc.frequency.linearRampToValueAtTime(f, t + 2.5);
    });
  }

  private applyGains(immediate: boolean) {
    if (!this.ctx || !this.master || !this.rainGain || !this.windGain || !this.padGain) return;
    const t = this.ctx.currentTime;
    const ramp = immediate ? 0.05 : 1.8;
    const { weather, biome } = this.state;

    let rain = 0;
    let wind = 0.04;
    let pad = 0.1;

    if (weather === "rain") {
      rain = 0.55;
      wind = 0.12;
      pad = 0.06;
    } else if (weather === "drizzle") {
      rain = 0.28;
      wind = 0.08;
      pad = 0.08;
    } else if (weather === "fog") {
      rain = 0.04;
      wind = 0.1;
      pad = 0.09;
    } else if (weather === "overcast") {
      wind = 0.14;
      pad = 0.07;
    } else if (weather === "partly") {
      wind = 0.07;
      pad = 0.1;
    } else {
      wind = biome === "coast" ? 0.09 : biome === "desert" ? 0.11 : 0.05;
      pad = 0.11;
    }

    if (this.muted) {
      this.master.gain.linearRampToValueAtTime(0, t + 0.3);
      return;
    }

    this.master.gain.linearRampToValueAtTime(MAX_MASTER, t + ramp);
    this.rainGain.gain.linearRampToValueAtTime(rain, t + ramp);
    this.windGain.gain.linearRampToValueAtTime(wind, t + ramp);
    this.padGain.gain.linearRampToValueAtTime(pad, t + ramp);
  }

  private scheduleThunder() {
    if (this.thunderTimer) window.clearTimeout(this.thunderTimer);
    if (this.muted || !this.enabled) return;
    const { weather } = this.state;
    if (weather !== "rain" && weather !== "overcast") return;

    const delay = 8000 + Math.random() * 18000;
    this.thunderTimer = window.setTimeout(() => {
      this.playThunder();
      this.scheduleThunder();
    }, delay);
  }

  private playThunder() {
    if (!this.ctx || !this.master || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(55, t);
    osc.frequency.exponentialRampToValueAtTime(28, t + 1.2);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 120;
    osc.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    osc.start(t);
    osc.stop(t + 2);
  }

  dispose() {
    if (this.thunderTimer) window.clearTimeout(this.thunderTimer);
    try {
      this.rainSource?.stop();
      this.windSource?.stop();
      this.padOsc.forEach((o) => o.stop());
      void this.ctx?.close();
    } catch {
      /* ignore */
    }
    this.ctx = null;
  }
}

export const ambientEngine = new AmbientEngine();
