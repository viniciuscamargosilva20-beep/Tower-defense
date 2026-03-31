// ══════════════════════════════════════════════════════════════
// AUDIO SYSTEM — Complete SFX + Epic Souls-like Boss Music
// ══════════════════════════════════════════════════════════════

export class AudioSystem {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.masterVol = 0.5;
        this.activeSources = [];
        this._bossNodes = [];
        this.bossPlaybackTime = 0;
        this.isBossThemePlaying = false;
        this.bossThemeInterval = null;
    }

    init() {
        if (!this.ctx) {
            try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
            catch (e) { this.enabled = false; }
        }
    }

    _gain(vol = 0.15) {
        let g = this.ctx.createGain();
        g.gain.value = vol * this.masterVol;
        g.connect(this.ctx.destination);
        return g;
    }

    // ─── SFX ────────────────────────────────────────────
    playShoot() {
        if (!this.enabled || !this.ctx) return;
        let now = this.ctx.currentTime;
        let o = this.ctx.createOscillator(), g = this._gain(0.06);
        o.type = 'square'; o.frequency.setValueAtTime(800, now);
        o.frequency.exponentialRampToValueAtTime(400, now + 0.06);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        o.connect(g); o.start(now); o.stop(now + 0.08);
    }

    playHit() {
        if (!this.enabled || !this.ctx) return;
        let now = this.ctx.currentTime;
        let o = this.ctx.createOscillator(), g = this._gain(0.08);
        o.type = 'sine'; o.frequency.setValueAtTime(200, now);
        o.frequency.exponentialRampToValueAtTime(80, now + 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        o.connect(g); o.start(now); o.stop(now + 0.12);
    }

    playExplosion() {
        if (!this.enabled || !this.ctx) return;
        let now = this.ctx.currentTime;
        // Epic deep explosion
        let buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.8, this.ctx.sampleRate);
        let data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.2));
        let filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass'; filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.8);
        let src = this.ctx.createBufferSource(), g = this._gain(0.3);
        src.buffer = buf; src.connect(filter); filter.connect(g); src.start(now);
    }

    playPlace() {
        if (!this.enabled || !this.ctx) return;
        let now = this.ctx.currentTime;
        let o = this.ctx.createOscillator(), g = this._gain(0.1);
        o.type = 'sine'; o.frequency.setValueAtTime(400, now);
        o.frequency.exponentialRampToValueAtTime(700, now + 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        o.connect(g); o.start(now); o.stop(now + 0.12);
    }

    playSell() {
        if (!this.enabled || !this.ctx) return;
        let now = this.ctx.currentTime;
        [600, 500, 350].forEach((f, i) => {
            let o = this.ctx.createOscillator(), g = this._gain(0.07);
            o.type = 'sine'; o.frequency.value = f;
            g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.1);
            o.connect(g); o.start(now + i * 0.08); o.stop(now + i * 0.08 + 0.1);
        });
    }

    playUpgrade() {
        if (!this.enabled || !this.ctx) return;
        let now = this.ctx.currentTime;
        [500, 700, 900, 1100].forEach((f, i) => {
            let o = this.ctx.createOscillator(), g = this._gain(0.09);
            o.type = 'sine'; o.frequency.value = f;
            g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.12);
            o.connect(g); o.start(now + i * 0.06); o.stop(now + i * 0.06 + 0.12);
        });
    }

    playWaveStart() {
        if (!this.enabled || !this.ctx) return;
        let now = this.ctx.currentTime;
        let o = this.ctx.createOscillator(), g = this._gain(0.15);
        o.type = 'triangle'; o.frequency.setValueAtTime(300, now);
        o.frequency.exponentialRampToValueAtTime(150, now + 0.6);
        g.gain.setValueAtTime(0.15 * this.masterVol, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        o.connect(g); o.start(now); o.stop(now + 0.8);
    }

    playWaveClear() {
        if (!this.enabled || !this.ctx) return;
        let now = this.ctx.currentTime;
        [523, 659, 784, 1047].forEach((f, i) => {
            let o = this.ctx.createOscillator(), g = this._gain(0.08);
            o.type = 'sine'; o.frequency.value = f;
            g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
            o.connect(g); o.start(now + i * 0.1); o.stop(now + i * 0.1 + 0.3);
        });
    }

    playEnemyDeath() {
        if (!this.enabled || !this.ctx) return;
        let now = this.ctx.currentTime;
        let o = this.ctx.createOscillator(), g = this._gain(0.04);
        o.type = 'square'; o.frequency.setValueAtTime(300, now);
        o.frequency.exponentialRampToValueAtTime(50, now + 0.1);
        let filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass'; filter.frequency.setValueAtTime(1500, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        o.connect(filter); filter.connect(g); o.start(now); o.stop(now + 0.1);
    }

    playSkill() {
        if (!this.enabled || !this.ctx) return;
        let now = this.ctx.currentTime;
        let o = this.ctx.createOscillator(), g = this._gain(0.15);
        o.type = 'sawtooth'; o.frequency.setValueAtTime(100, now);
        o.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
        g.gain.setValueAtTime(0.15 * this.masterVol, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        let filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass'; filter.frequency.value = 500;
        o.connect(filter); filter.connect(g); o.start(now); o.stop(now + 0.5);
    }

    playLifeLost() {
        if (!this.enabled || !this.ctx) return;
        let now = this.ctx.currentTime;
        [400, 300, 200, 100].forEach((f, i) => {
            let o = this.ctx.createOscillator(), g = this._gain(0.15);
            o.type = 'sawtooth'; o.frequency.value = f;
            g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.2);
            let filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass'; filter.frequency.value = 800;
            o.connect(filter); filter.connect(g); o.start(now + i * 0.15); o.stop(now + i * 0.15 + 0.2);
        });
    }

    playGameOver() {
        if (!this.enabled || !this.ctx) return;
        let now = this.ctx.currentTime;
        [400, 350, 300, 250, 180, 120, 60].forEach((f, i) => {
            let o = this.ctx.createOscillator(), g = this._gain(0.2);
            o.type = 'sawtooth'; o.frequency.value = f;
            g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.8);
            let filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass'; filter.frequency.setValueAtTime(2000, now + i * 0.2);
            filter.frequency.exponentialRampToValueAtTime(100, now + i * 0.2 + 0.8);
            o.connect(filter); filter.connect(g); o.start(now + i * 0.2); o.stop(now + i * 0.2 + 0.8);
        });
    }

    playClick() {
        if (!this.enabled || !this.ctx) return;
        let now = this.ctx.currentTime;
        let o = this.ctx.createOscillator(), g = this._gain(0.04);
        o.type = 'sine'; o.frequency.value = 800;
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        o.connect(g); o.start(now); o.stop(now + 0.05);
    }

    // ─── EPIC SOULS-LIKE BOSS THEME SYNTHESIS ───
    _createBell(freq, time, duration) {
        // FM Synthesis Bell: Modulator -> Carrier
        let carrier = this.ctx.createOscillator();
        let modulator = this.ctx.createOscillator();
        let modGain = this.ctx.createGain();
        let outGain = this.ctx.createGain();

        carrier.type = 'sine';
        modulator.type = 'sine';
        carrier.frequency.value = freq;
        modulator.frequency.value = freq * 1.618; // Inharmonic ratio for bell-like tone

        // Envelopes
        modGain.gain.setValueAtTime(freq * 2, time);
        modGain.gain.exponentialRampToValueAtTime(1, time + duration);

        outGain.gain.setValueAtTime(0.4 * this.masterVol, time);
        outGain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        modulator.connect(modGain);
        modGain.connect(carrier.frequency);
        carrier.connect(outGain);
        outGain.connect(this.ctx.destination);

        modulator.start(time); carrier.start(time);
        modulator.stop(time + duration); carrier.stop(time + duration);
        this._bossNodes.push(modulator, carrier);
    }

    _createChoirPad(chordFreqs, time, duration) {
        // Layered detuned sines to simulate an ethereal dark choir
        let outGain = this.ctx.createGain();
        outGain.gain.setValueAtTime(0, time);
        outGain.gain.linearRampToValueAtTime(0.25 * this.masterVol, time + 1);
        outGain.gain.setValueAtTime(0.25 * this.masterVol, time + duration - 1);
        outGain.gain.linearRampToValueAtTime(0, time + duration);
        outGain.connect(this.ctx.destination);

        chordFreqs.forEach(freq => {
            [-2, 0, 2].forEach(detune => {
                let o = this.ctx.createOscillator();
                o.type = 'triangle';
                o.frequency.value = freq;
                o.detune.value = detune;

                // Vibrato (human voice slight waver)
                let lfo = this.ctx.createOscillator();
                let lfoGain = this.ctx.createGain();
                lfo.type = 'sine'; lfo.frequency.value = 5 + Math.random();
                lfoGain.gain.value = 8;
                lfo.connect(lfoGain); lfoGain.connect(o.frequency);

                o.connect(outGain);
                o.start(time); o.stop(time + duration);
                lfo.start(time); lfo.stop(time + duration);
                this._bossNodes.push(o, lfo);
            });
        });
    }

    _createTimpaniHit(time) {
        // Massive bass drum/timpani drop
        let o = this.ctx.createOscillator();
        let g = this.ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(120, time);
        o.frequency.exponentialRampToValueAtTime(20, time + 0.3);
        
        g.gain.setValueAtTime(0.6 * this.masterVol, time);
        g.gain.exponentialRampToValueAtTime(0.001, time + 1.5);
        
        // Add noisy grit
        let noiseBuf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.5, this.ctx.sampleRate);
        let data = noiseBuf.getChannelData(0);
        for(let i=0; i<data.length; i++) data[i] = (Math.random()*2-1)*Math.exp(-i/(data.length*0.1));
        let noiseSrc = this.ctx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        let bq = this.ctx.createBiquadFilter();
        bq.type = 'lowpass'; bq.frequency.value = 300;
        let noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.3 * this.masterVol, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);

        o.connect(g); g.connect(this.ctx.destination);
        noiseSrc.connect(bq); bq.connect(noiseGain); noiseGain.connect(this.ctx.destination);

        o.start(time); o.stop(time + 1.5);
        noiseSrc.start(time);
        this._bossNodes.push(o, noiseSrc);
    }

    playBossTheme(bossType) {
        if (!this.enabled || !this.ctx) return;
        this.stopBossTheme();
        this.isBossThemePlaying = true;
        let t0 = this.ctx.currentTime;

        // An epic, dark minor progression: Dm -> A# -> F -> C
        const chords = [
            [73.42, 110.00, 146.83], // Dm (D2, A2, D3)
            [58.27, 92.50, 116.54],  // A# (Bb1, F2, Bb2)
            [43.65, 87.31, 130.81],  // F  (F1, F2, C3)
            [65.41, 98.00, 130.81]   // C  (C2, G2, C3)
        ];

        // Sequence generator wrapper so it loops intensely
        const scheduleMeasure = (timeOffset) => {
            if (!this.isBossThemePlaying) return;
            let measureTime = 4; // seconds per chord
            
            chords.forEach((chord, i) => {
                let time = timeOffset + i * measureTime;
                
                // 1. Swelling Dark Choir Pad for the full measure
                this._createChoirPad(chord, time, measureTime);
                
                // 2. Timpani hits on the downbeat and syncopated beat
                this._createTimpaniHit(time);
                this._createTimpaniHit(time + measureTime * 0.5);
                this._createTimpaniHit(time + measureTime * 0.875);

                // 3. Ominous Church Bell Melody fading in
                let bellRoot = chord[1] * 2; // Octave up
                this._createBell(bellRoot, time, 3);
                this._createBell(bellRoot * 1.5, time + 1.5, 2.5); // Perfect fifth up
                this._createBell(bellRoot * 1.25, time + 3.0, 2);   // Minor/Major third
            });
            
            // Re-schedule the next 4 bars (16 seconds total)
            this.bossThemeInterval = setTimeout(() => {
                scheduleMeasure(this.ctx.currentTime);
            }, (measureTime * chords.length - 0.1) * 1000);
        };

        // Epic Intro Hit
        this._createTimpaniHit(t0);
        this._createBell(146.83, t0, 5); // Huge D bell
        
        // Start the sequence
        scheduleMeasure(t0);
    }

    stopBossTheme() {
        this.isBossThemePlaying = false;
        if (this.bossThemeInterval) clearTimeout(this.bossThemeInterval);
        if (this._bossNodes) {
            this._bossNodes.forEach(n => { try { n.stop(); } catch (e) {} });
            this._bossNodes = [];
        }
    }
}
