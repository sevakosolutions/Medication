/* ═══════════════════════════════════════════════════════════════
   AUDIO ENGINE
   – Web Audio API ambient sound generator (no external files)
   – Web Speech API for TTS affirmations
   – Custom audio file support
   ═══════════════════════════════════════════════════════════════ */

const AudioEngine = (() => {
  let ctx = null;
  let masterGain = null;
  let currentNodes = [];
  let currentSound = 'none';
  let volume = 0.4;

  /* ── INIT ────────────────────────────────────────────────── */
  function initCtx() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, ctx.currentTime);
    masterGain.connect(ctx.destination);
  }

  function resumeCtx() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  /* ── STOP ALL ─────────────────────────────────────────────── */
  function stopAll() {
    currentNodes.forEach(n => { try { n.stop(); } catch {} });
    currentNodes = [];
  }

  /* ── HELPERS ──────────────────────────────────────────────── */
  function addGain(amount) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(amount, ctx.currentTime);
    g.connect(masterGain);
    return g;
  }

  function noise(type = 'white') {
    const bufLen = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    if (type === 'white') {
      for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
    } else if (type === 'brown') {
      let last = 0;
      for (let i = 0; i < bufLen; i++) {
        const w = Math.random() * 2 - 1;
        data[i] = (last + 0.02 * w) / 1.02;
        last = data[i];
        data[i] *= 3.5;
      }
    } else if (type === 'pink') {
      let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0;
      for (let i = 0; i < bufLen; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886*b0 + w*0.0555179; b1 = 0.99332*b1 + w*0.0750759;
        b2 = 0.96900*b2 + w*0.1538520; b3 = 0.86650*b3 + w*0.3104856;
        b4 = 0.55000*b4 + w*0.5329522; b5 = -0.7616*b5 - w*0.0168980;
        data[i] = (b0+b1+b2+b3+b4+b5 + w*0.5362) / 7.0;
      }
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    return src;
  }

  function osc(freq, type = 'sine') {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    return o;
  }

  function lfo(target, param, rate, depth, base) {
    const l = ctx.createOscillator();
    const g = ctx.createGain();
    l.frequency.setValueAtTime(rate, ctx.currentTime);
    g.gain.setValueAtTime(depth, ctx.currentTime);
    l.connect(g);
    g.connect(param);
    param.setValueAtTime(base, ctx.currentTime);
    l.start();
    currentNodes.push(l);
  }

  /* ── SOUND GENERATORS ─────────────────────────────────────── */
  const GENERATORS = {

    none: () => {},

    bowls: () => {
      // Fundamental tone + harmonics + reverb tail simulation
      const fundamentals = [136.1, 272.2, 408.3, 544.4];
      fundamentals.forEach((f, i) => {
        const g = addGain(0.06 / (i + 1));
        const o = osc(f, 'sine');
        o.connect(g);
        o.start();
        currentNodes.push(o);

        // Slow amplitude envelope mimicking bowl sustain
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.06 / (i + 1), ctx.currentTime + 2 + i);
        lfo(o, o.frequency, 0.05 + i * 0.02, f * 0.002, f);
      });
      // Add gentle pink noise for room ambience
      const n = noise('pink');
      const ng = addGain(0.01);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      n.connect(filter);
      filter.connect(ng);
      n.start();
      currentNodes.push(n);
    },

    rain: () => {
      // Brown noise for rain body
      const rain = noise('brown');
      const rainG = addGain(0.18);
      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = 'bandpass';
      rainFilter.frequency.setValueAtTime(1200, ctx.currentTime);
      rainFilter.Q.setValueAtTime(0.3, ctx.currentTime);
      rain.connect(rainFilter);
      rainFilter.connect(rainG);
      rain.start();
      currentNodes.push(rain);

      // High freq drip texture
      const drip = noise('white');
      const dripG = addGain(0.04);
      const dripF = ctx.createBiquadFilter();
      dripF.type = 'highpass';
      dripF.frequency.setValueAtTime(3000, ctx.currentTime);
      drip.connect(dripF);
      dripF.connect(dripG);
      drip.start();
      currentNodes.push(drip);
    },

    forest: () => {
      // Wind — low brown noise
      const wind = noise('brown');
      const windG = addGain(0.08);
      const windF = ctx.createBiquadFilter();
      windF.type = 'lowpass';
      windF.frequency.setValueAtTime(600, ctx.currentTime);
      wind.connect(windF);
      windF.connect(windG);
      wind.start();
      currentNodes.push(wind);
      lfo(null, windG.gain, 0.08, 0.05, 0.08);

      // Bird-like chirp oscillators
      const birdFreqs = [2800, 3200, 3600, 2400];
      birdFreqs.forEach((f, i) => {
        const delay = i * 3 + Math.random() * 5;
        setTimeout(() => {
          if (!ctx) return;
          const bg = addGain(0);
          const bo = osc(f, 'sine');
          bo.connect(bg);
          bo.start();
          currentNodes.push(bo);
          // Chirp envelope
          function chirp() {
            bg.gain.setValueAtTime(0, ctx.currentTime);
            bg.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.05);
            bg.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.18);
            setTimeout(chirp, 4000 + Math.random() * 8000);
          }
          chirp();
        }, delay * 1000);
      });
    },

    ocean: () => {
      // Wave swell — brown noise with slow LFO
      const wave = noise('brown');
      const waveG = addGain(0.12);
      const waveF = ctx.createBiquadFilter();
      waveF.type = 'lowpass';
      waveF.frequency.setValueAtTime(400, ctx.currentTime);
      wave.connect(waveF);
      waveF.connect(waveG);
      wave.start();
      currentNodes.push(wave);

      // Swell LFO
      const swellLFO = ctx.createOscillator();
      const swellG = ctx.createGain();
      swellLFO.frequency.setValueAtTime(0.12, ctx.currentTime);
      swellG.gain.setValueAtTime(0.08, ctx.currentTime);
      swellLFO.connect(swellG);
      swellG.connect(waveG.gain);
      waveG.gain.setValueAtTime(0.12, ctx.currentTime);
      swellLFO.start();
      currentNodes.push(swellLFO);

      // Surf — pink noise high
      const surf = noise('pink');
      const surfG = addGain(0.05);
      const surfF = ctx.createBiquadFilter();
      surfF.type = 'highpass';
      surfF.frequency.setValueAtTime(1800, ctx.currentTime);
      surf.connect(surfF);
      surfF.connect(surfG);
      surf.start();
      currentNodes.push(surf);
    },

    om: () => {
      // OM fundamental 136 Hz + harmonics
      const freqs = [136.1, 204.15, 272.2, 340.25, 408.3];
      freqs.forEach((f, i) => {
        const g = addGain(0.05 / (i + 1));
        const o = osc(f, i === 0 ? 'sine' : 'triangle');
        o.connect(g);
        o.start();
        currentNodes.push(o);
        lfo(null, g.gain, 0.04, 0.01 / (i + 1), 0.05 / (i + 1));
      });
      // breath texture
      const breath = noise('pink');
      const bG = addGain(0.02);
      const bF = ctx.createBiquadFilter();
      bF.type = 'bandpass';
      bF.frequency.setValueAtTime(300, ctx.currentTime);
      bF.Q.setValueAtTime(2, ctx.currentTime);
      breath.connect(bF);
      bF.connect(bG);
      breath.start();
      currentNodes.push(breath);
    }
  };

  /* ── TTS ──────────────────────────────────────────────────── */
  let voices = [];
  let ttsSettings = { rate: 0.85, pitch: 1.0, voiceIdx: 0 };
  let currentUtterance = null;

  function loadVoices() {
    voices = window.speechSynthesis.getVoices();
    if (!voices.length) {
      window.speechSynthesis.onvoiceschanged = () => { voices = window.speechSynthesis.getVoices(); };
    }
    return voices;
  }

  function speak(text, onEnd) {
    if (!window.speechSynthesis) { if (onEnd) onEnd(); return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = ttsSettings.rate;
    utt.pitch = ttsSettings.pitch;
    if (voices[ttsSettings.voiceIdx]) utt.voice = voices[ttsSettings.voiceIdx];
    if (onEnd) utt.onend = onEnd;
    currentUtterance = utt;
    window.speechSynthesis.speak(utt);
  }

  function stopSpeech() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  /* ── CUSTOM AUDIO ─────────────────────────────────────────── */
  let customAudioMap = {}; // sessionId → AudioBuffer or ObjectURL
  let customAudioEl = null;

  function loadCustomAudio(file, cb) {
    const url = URL.createObjectURL(file);
    cb(url);
  }

  function playCustomAudio(url, onEnd) {
    if (customAudioEl) { customAudioEl.pause(); customAudioEl = null; }
    customAudioEl = new Audio(url);
    customAudioEl.volume = volume;
    customAudioEl.onended = onEnd;
    customAudioEl.play().catch(() => { if (onEnd) onEnd(); });
  }

  /* ── PUBLIC API ───────────────────────────────────────────── */
  return {
    init() { initCtx(); loadVoices(); },
    resumeCtx,

    setVolume(v) {
      volume = v;
      if (masterGain) masterGain.gain.setValueAtTime(v, ctx.currentTime);
    },

    playAmbient(name) {
      initCtx();
      resumeCtx();
      stopAll();
      currentSound = name;
      if (GENERATORS[name]) GENERATORS[name]();
    },

    stopAmbient() { stopAll(); },

    get currentSound() { return currentSound; },

    setTTS(settings) { ttsSettings = { ...ttsSettings, ...settings }; },
    get voices() { return loadVoices(); },
    speak,
    stopSpeech,

    loadCustomAudio,
    playCustomAudio
  };
})();
