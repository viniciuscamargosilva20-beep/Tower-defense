import { Map } from './map.js';
import { Enemy } from './entities/enemy.js';
import { Tower } from './entities/tower.js';
import { ParticleSystem } from './particles.js';
import { SkillSystem } from './skills.js';
import { AudioSystem } from './audio.js';
import { TOWER_DATA } from './data/towers.js';
import { generateWave, ENEMY_TYPES, DIFFICULTIES } from './data/waves.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.lastTime = 0;
        this.isRunning = false;

        this.audio = new AudioSystem();
        this.difficulty = DIFFICULTIES.normal;
        this.selectedMap = 'forest';

        this.state = { money: 500, lives: 20, wave: 0, maxLives: 30, totalEarnings: 0 };
        this.gameSpeed = 1;
        this.placingTowerType = null;
        this.placingTowerCost = 0;
        this.selectedTower = null;

        this.map = null;
        this.enemies = [];
        this.towers = [];
        this.projectiles = [];
        this.particles = new ParticleSystem();
        this.skills = new SkillSystem(this);

        this.waveGroups = [];
        this.waveInProgress = false;
        this.currentBoss = null;

        this.hoverX = 0; this.hoverY = 0;
        this.autoNextWave = false;
        this.autoNextDelay = 0;
        this.bossWarningTimer = 0;

        this.loop = this.loop.bind(this);
    }

    init(difficultyId, mapId) {
        this.audio.init();
        this.difficulty = DIFFICULTIES[difficultyId] || DIFFICULTIES.normal;
        this.selectedMap = mapId;
        this.state = {
            money: this.difficulty.startMoney,
            lives: this.difficulty.startLives,
            wave: 0,
            maxLives: this.difficulty.startLives,
            totalEarnings: 0
        };
        this.map = new Map(this, mapId);
        this.enemies = []; this.towers = []; this.projectiles = [];
        this.particles = new ParticleSystem();
        this.skills = new SkillSystem(this);
        this.waveGroups = []; this.waveInProgress = false;
        this.currentBoss = null; this.selectedTower = null;
        this.autoNextDelay = 0; this.bossWarningTimer = 0;
        this.shakeDuration = 0; this.shakeIntensity = 0;
        this.start();
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            requestAnimationFrame(this.loop);
        }
    }

    loop(ts) {
        let raw = ts - this.lastTime;
        if (raw > 100) raw = 100;
        this.lastTime = ts;
        let dt = raw * this.gameSpeed;
        this.update(dt);
        this.draw(ts);
        if (this.isRunning) requestAnimationFrame(this.loop);
    }

    update(dt) {
        // Spawning
        for (let g of this.waveGroups) {
            if (g.count <= 0) continue;
            if (g.delay > 0) { g.delay -= dt; continue; }
            g.timer -= dt;
            if (g.timer <= 0) {
                let e = new Enemy(this, g.type, this.map.path, this.state.wave);
                this.enemies.push(e);
                if (e.isBoss) this.currentBoss = e;
                g.count--; g.timer = g.interval;
            }
        }
        this.waveGroups = this.waveGroups.filter(g => g.count > 0);

        // Wave complete
        if (this.waveInProgress && this.waveGroups.length === 0 && this.enemies.length === 0) {
            this.waveInProgress = false;
            this.currentBoss = null;
            this.audio.playWaveClear();
            let goldReward = 25 + this.state.wave * 5;
            this.towers.forEach(t => {
                if (t.special === 'gold_wave') {
                    let b = 60 * t.level; goldReward += b; t.totalGenerated += b;
                }
            });
            this.state.money += goldReward;
            this.state.totalEarnings += goldReward;
            this.updateBossCountdown();
            if (this.autoNextWave) this.autoNextDelay = 2000;
        }

        // Auto next
        if (this.autoNextWave && !this.waveInProgress && this.autoNextDelay > 0) {
            this.autoNextDelay -= dt;
            if (this.autoNextDelay <= 0) this.startNextWave();
        }

        if (this.bossWarningTimer > 0) this.bossWarningTimer -= dt;
        if (this.shakeDuration > 0) this.shakeDuration -= dt;

        // Enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            let e = this.enemies[i];
            e.update(dt);
            if (e.reachedEnd) {
                let dmg = e.lifeDamage || (e.isBoss ? 5 : (e.isMiniBoss ? 2 : 1));
                this.state.lives -= dmg;
                this.audio.playLifeLost();
                this.enemies.splice(i, 1);
                if (this.state.lives <= 0) { this.state.lives = 0; this.handleGameOver(); }
            } else if (e.dead) {
                let reward = e.reward;
                this.towers.forEach(t => {
                    if (t.special === 'bounty' && t.distTo(e) <= t.range)
                        reward = Math.floor(reward * (1.5 + (t.level - 1) * 0.2));
                });
                this.state.money += reward;
                this.state.totalEarnings += reward;
                this.audio.playEnemyDeath();
                if (e.enemySpecial === 'split') {
                    for (let s = 0; s < 2; s++) {
                        let spawn = new Enemy(this, 'scout', this.map.path, this.state.wave);
                        spawn.x = e.x + (Math.random() - 0.5) * 25;
                        spawn.y = e.y + (Math.random() - 0.5) * 25;
                        spawn.pathIndex = e.pathIndex;
                        this.enemies.push(spawn);
                    }
                }
                this.particles.emit(e.x, e.y, '#ffd700', 5, 40, 250, 2);
                this.particles.emit(e.x, e.y, e.color, 10, 80, 400, 3);
                this.enemies.splice(i, 1);
            }
        }

        // Support Buffs
        this.towers.forEach(t => { t._rangeBuff = 1; t._speedBuff = 1; t._damageBuff = 1; });
        this.towers.forEach(t => {
            if (t.special === 'buff_damage') {
                this.towers.forEach(o => {
                    if (o !== t && Math.hypot(o.x - t.x, o.y - t.y) <= t.range)
                        o._damageBuff = Math.max(o._damageBuff, 1 + 0.25 * t.level);
                });
            }
            if (t.special === 'buff_speed') {
                this.towers.forEach(o => {
                    if (o !== t && Math.hypot(o.x - t.x, o.y - t.y) <= t.range)
                        o._speedBuff = Math.max(o._speedBuff, 1 + 0.3 * t.level);
                });
            }
        });

        // Tower updates
        let overclocked = this.skills.isOverclockActive();
        this.towers.forEach(t => {
            t.range = Math.floor(t.baseRange * (1 + (t.level - 1) * 0.15) * t._rangeBuff);
            t.damage = Math.floor(t.baseDamage * (1 + (t.level - 1) * 0.45) * t._damageBuff);
            let fr = Math.max(20, Math.floor(t.baseFireRate * (1 - (t.level - 1) * 0.12)));
            fr = Math.floor(fr / t._speedBuff);
            if (overclocked) fr = Math.floor(fr * 0.5);
            t.fireRate = fr;
            t.update(dt);
        });

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            this.projectiles[i].update(dt);
            if (this.projectiles[i].dead) {
                if (this.projectiles[i].isAoe) this.audio.playExplosion();
                else this.audio.playHit();
                this.projectiles.splice(i, 1);
            }
        }
        this.particles.update(dt);
        this.skills.update(dt);
    }

    draw(ts) {
        let dx = 0, dy = 0;
        if (this.shakeDuration > 0) {
            let mag = Math.min(1, this.shakeDuration / 500) * this.shakeIntensity;
            dx = (Math.random() - 0.5) * mag * 2;
            dy = (Math.random() - 0.5) * mag * 2;
        }

        this.ctx.save();
        this.ctx.translate(dx, dy);

        this.ctx.fillStyle = '#0d0d14';
        this.ctx.fillRect(0, 0, this.width, this.height);

        if (this.map) this.map.draw(this.ctx, ts);
        this.towers.forEach(t => t.draw(this.ctx));
        this.enemies.forEach(e => e.draw(this.ctx));
        this.projectiles.forEach(p => p.draw(this.ctx));
        this.particles.draw(this.ctx);

        // Placement preview
        if (this.placingTowerType) {
            let col = Math.floor(this.hoverX / this.map.tileSize);
            let row = Math.floor(this.hoverY / this.map.tileSize);
            let cx = col * this.map.tileSize + this.map.tileSize / 2;
            let cy = row * this.map.tileSize + this.map.tileSize / 2;
            let ok = this.checkPlacement(col, row);
            let rng = TOWER_DATA[this.placingTowerType]?.range || 150;
            this.ctx.strokeStyle = ok ? 'rgba(102, 187, 106, 0.4)' : 'rgba(244, 67, 54, 0.4)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath(); this.ctx.arc(cx, cy, rng, 0, Math.PI * 2); this.ctx.stroke();
            this.ctx.fillStyle = ok ? 'rgba(102, 187, 106, 0.15)' : 'rgba(244, 67, 54, 0.15)';
            this.ctx.beginPath(); this.ctx.arc(cx, cy, 18, 0, Math.PI * 2); this.ctx.fill();
        }

        // Selected tower
        if (this.selectedTower) {
            this.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            this.ctx.setLineDash([4, 4]);
            this.ctx.beginPath(); this.ctx.arc(this.selectedTower.x, this.selectedTower.y, this.selectedTower.range, 0, Math.PI * 2); this.ctx.stroke();
            this.ctx.setLineDash([]);
            this.ctx.strokeStyle = '#fff'; this.ctx.lineWidth = 2;
            this.ctx.beginPath(); this.ctx.arc(this.selectedTower.x, this.selectedTower.y, 20, 0, Math.PI * 2); this.ctx.stroke();
        }

        // Boss warning red flash
        if (this.bossWarningTimer > 0) {
            let a = Math.min(1, this.bossWarningTimer / 1000) * 0.1;
            this.ctx.fillStyle = `rgba(244, 67, 54, ${a})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        this.ctx.restore();
        this.updateUI();
    }

    updateUI() {
        document.getElementById('money').innerText = this.state.money;
        document.getElementById('lives').innerText = this.state.lives;
        document.getElementById('wave').innerText = this.state.wave;

        let farmEarn = 0;
        this.towers.forEach(t => { if (t.totalGenerated) farmEarn += t.totalGenerated; });
        document.getElementById('farm-earnings').innerText = farmEarn;
        document.getElementById('total-earnings').innerText = this.state.totalEarnings;

        // Boss countdown
        let wavesUntilBoss = 10 - (this.state.wave % 10);
        if (wavesUntilBoss === 10) wavesUntilBoss = 0;
        let bossCountEl = document.getElementById('boss-countdown');
        if (wavesUntilBoss > 0 && wavesUntilBoss <= 5) {
            bossCountEl.classList.remove('hidden');
            bossCountEl.innerText = `⚠ Boss in ${wavesUntilBoss} wave${wavesUntilBoss > 1 ? 's' : ''}`;
            bossCountEl.style.color = wavesUntilBoss <= 2 ? '#f44336' : '#ffc107';
        } else if (wavesUntilBoss === 0 && this.currentBoss) {
            bossCountEl.classList.remove('hidden');
            bossCountEl.innerText = '💀 BOSS';
            bossCountEl.style.color = '#f44336';
        } else bossCountEl.classList.add('hidden');

        // Boss HP
        let bossBar = document.getElementById('boss-bar');
        if (this.currentBoss && !this.currentBoss.dead) {
            bossBar.classList.remove('hidden');
            document.getElementById('boss-name').innerText = this.currentBoss.displayName;
            let bd = document.getElementById('boss-desc');
            if (bd) bd.innerText = ENEMY_TYPES[this.currentBoss.typeName]?.bossDesc || '';
            document.getElementById('boss-hp-fill').style.width = Math.max(0, (this.currentBoss.hp / this.currentBoss.maxHp) * 100) + '%';
        } else bossBar.classList.add('hidden');

        // Skills
        for (let k in this.skills.skills) {
            let el = document.getElementById('skill-' + k);
            if (el) {
                let s = this.skills.skills[k];
                let cd = el.querySelector('.skill-cd');
                if (s.cooldown > 0) { el.classList.add('on-cd'); cd.innerText = Math.ceil(s.cooldown / 1000) + 's'; }
                else { el.classList.remove('on-cd'); cd.innerText = ''; }
            }
        }

        document.querySelectorAll('.tower-btn').forEach(btn => {
            let cost = parseInt(btn.getAttribute('data-cost'));
            if (cost > this.state.money) btn.classList.add('cant-afford');
            else btn.classList.remove('cant-afford');
        });

        // Upgrade panel
        let panel = document.getElementById('upgrade-panel');
        if (this.selectedTower) {
            panel.classList.remove('hidden');
            let t = this.selectedTower;
            document.getElementById('sel-name').innerText = `${t.name} ${t.getCurrentUpgradeName()}`;
            document.getElementById('sel-dmg').innerText = t.damage;
            document.getElementById('sel-rng').innerText = t.range;
            document.getElementById('sel-spd').innerText = t.fireRate > 0 ? (1000 / t.fireRate).toFixed(1) + '/s' : '—';
            let upCost = t.getUpgradeCost();
            let upBtn = document.getElementById('btn-upgrade');
            let nextName = t.getNextUpgradeName();
            if (upCost && nextName) {
                upBtn.innerText = `Upgrade → ${nextName} (${upCost}g)`;
                upBtn.disabled = this.state.money < upCost;
                upBtn.classList.remove('hidden');
            } else upBtn.classList.add('hidden');
            document.getElementById('sel-sell').innerText = `Sell (${t.getSellValue()}g)`;
            let extra = document.getElementById('sel-extra');
            if (t.special === 'gold_passive' || t.special === 'gold_wave') {
                extra.classList.remove('hidden'); extra.innerText = `💰 Earned: ${t.totalGenerated}g`;
            } else extra.classList.add('hidden');
        } else panel.classList.add('hidden');

        let autoBtn = document.getElementById('btn-auto');
        if (autoBtn) {
            if (this.autoNextWave) { autoBtn.classList.add('active'); autoBtn.innerText = 'Auto: ON'; }
            else { autoBtn.classList.remove('active'); autoBtn.innerText = 'Auto: OFF'; }
        }
    }

    updateBossCountdown() {
        let wu = 10 - ((this.state.wave) % 10);
        if (wu <= 3 && wu > 0) this.bossWarningTimer = 3000;
    }

    startNextWave() {
        if (this.waveInProgress) return;
        this.state.wave++;
        this.waveInProgress = true;
        let data = generateWave(this.state.wave);
        this.waveGroups = data.groups.map(g => ({ ...g, timer: 0 }));
        this.audio.playWaveStart();

        if (data.isBoss) {
            this.audio.playBossTheme(data.bossType);
            this.bossWarningTimer = 5000;
            this.shakeScreen(1500, 20); // Massive shake for boss entry
            this.particles.emit(this.width / 2, this.height / 2, '#f44336', 50, 200, 1000, 6);
        }
        this.updateBossCountdown();
    }

    skipWave() {
        if (this.waveInProgress) return;
        let bonus = 30 + this.state.wave * 3;
        this.state.money += bonus;
        this.state.totalEarnings += bonus;
        this.audio.playClick();
        this.startNextWave();
    }

    setGameSpeed(sp) { this.gameSpeed = sp; this.audio.playClick(); }
    toggleAutoNext() { this.autoNextWave = !this.autoNextWave; this.audio.playClick(); }

    handleGameOver() {
        document.getElementById('game-over-screen').classList.remove('hidden');
        document.getElementById('final-wave').innerText = this.state.wave;
        document.getElementById('final-earnings').innerText = this.state.totalEarnings;
        this.audio.playGameOver();
        this.isRunning = false;
    }

    restart() {
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('game-ui').classList.add('hidden');
        document.getElementById('start-menu').classList.remove('hidden');
        this.isRunning = false;
    }

    setPlacingTower(type, cost) { this.placingTowerType = type; this.placingTowerCost = cost; this.selectedTower = null; }
    setHoverPos(x, y) { this.hoverX = x; this.hoverY = y; }
    checkPlacement(col, row) {
        if (!this.map || col < 0 || col >= this.map.cols || row < 0 || row >= this.map.rows) return false;
        if (this.map.grid[row][col] !== 0) return false;
        return this.state.money >= this.placingTowerCost;
    }

    handleCanvasClick() {
        if (!this.map) return;
        let col = Math.floor(this.hoverX / this.map.tileSize);
        let row = Math.floor(this.hoverY / this.map.tileSize);
        if (this.placingTowerType) {
            if (this.checkPlacement(col, row)) {
                this.state.money -= this.placingTowerCost;
                this.map.grid[row][col] = 2;
                let cx = col * this.map.tileSize + this.map.tileSize / 2;
                let cy = row * this.map.tileSize + this.map.tileSize / 2;
                this.towers.push(new Tower(this, cx, cy, this.placingTowerType));
                this.particles.emit(cx, cy, '#66bb6a', 8, 40, 250, 3);
                this.audio.playPlace();
            }
        } else {
            let clicked = null;
            this.towers.forEach(t => {
                if (Math.hypot(t.x - (col * this.map.tileSize + this.map.tileSize / 2), t.y - (row * this.map.tileSize + this.map.tileSize / 2)) < 5) clicked = t;
            });
            this.selectedTower = clicked;
            if (clicked) this.audio.playClick();
        }
    }

    upgradeTower() {
        if (this.selectedTower && this.selectedTower.upgrade()) this.audio.playUpgrade();
    }
    sellTower() {
        if (this.selectedTower) {
            this.state.money += this.selectedTower.getSellValue();
            let col = Math.floor((this.selectedTower.x - this.map.tileSize / 2) / this.map.tileSize);
            let row = Math.floor((this.selectedTower.y - this.map.tileSize / 2) / this.map.tileSize);
            if (this.map.grid[row]) this.map.grid[row][col] = 0;
            this.particles.emit(this.selectedTower.x, this.selectedTower.y, '#ef5350', 10, 60, 300, 3);
            this.towers = this.towers.filter(t => t !== this.selectedTower);
            this.selectedTower = null;
            this.audio.playSell();
        }
    }

    shakeScreen(duration, intensity) {
        this.shakeDuration = duration;
        this.shakeIntensity = intensity;
    }
}
