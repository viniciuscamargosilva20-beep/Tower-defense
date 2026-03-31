import { ENEMY_TYPES } from '../data/waves.js';

export class Enemy {
    constructor(game, typeName, path, waveNum) {
        this.game = game;
        this.path = path;
        this.pathIndex = 0;
        this.typeName = typeName;

        let base = ENEMY_TYPES[typeName] || ENEMY_TYPES['scout'];
        let diffScale = game.difficulty?.hpScale || 1;
        let scale = (1 + (waveNum - 1) * 0.12) * diffScale;

        let s = this.path[0];
        this.x = s.x * game.map.tileSize + game.map.tileSize / 2;
        this.y = s.y * game.map.tileSize + game.map.tileSize / 2;

        this.hp = Math.floor(base.hp * scale);
        this.maxHp = this.hp;
        this.speed = base.speed + waveNum * 1;
        this.baseSpeed = this.speed;
        this.radius = base.radius;
        this.color = base.color;
        this.colorAlt = base.colorAlt || base.color;
        this.reward = Math.floor(base.reward * (game.difficulty?.goldScale || 1) * (1 + waveNum * 0.04));
        this.shape = base.shape;
        this.displayName = base.name;
        this.enemySpecial = base.special || null;
        this.bossAbility = base.bossAbility || null;
        this.lifeDamage = base.lifeDamage || 1;

        this.isBoss = this.shape === 'boss';
        this.isMiniBoss = typeName === 'splitter' || typeName === 'brute' || typeName === 'golem';

        this.dead = false;
        this.reachedEnd = false;
        this.angle = 0;

        // Status
        this.slowTimer = 0; this.slowFactor = 1;
        this.burnTimer = 0; this.burnDamage = 0;
        this.poisonTimer = 0; this.poisonDamage = 0;
        this.frozenTimer = 0;

        // Shield
        this.shield = (this.enemySpecial === 'shield') ? Math.floor(this.maxHp * 0.4) : 0;
        this.maxShield = this.shield;

        // Stealth
        this.stealthAlpha = (this.enemySpecial === 'stealth') ? 0.15 : 1;
        this.isRevealed = false;
        this.revealTimer = 0;

        // Healer / Summoner
        this.isHealer = this.enemySpecial === 'healer';
        this.healTimer = 0;
        this.summonTimer = 0;

        // Boss abilities
        this.abilityTimer = 0;
        this.phaseTimer = 0;
        this.isPhased = false;

        // Visual
        this.offsetX = (Math.random() - 0.5) * (typeName === 'swarm' ? 18 : 2);
        this.offsetY = (Math.random() - 0.5) * (typeName === 'swarm' ? 18 : 2);
        this.spawnTime = Date.now();
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.wobble = Math.random() * Math.PI * 2;
        this.eyeOffset = 0;
        this.legPhase = 0;
        this.hitFlash = 0;
    }

    update(deltaTime) {
        if (this.dead || this.reachedEnd) return;
        if (this.frozenTimer > 0) { this.frozenTimer -= deltaTime; return; }

        this.wobble += deltaTime * 0.005;
        this.legPhase += deltaTime * 0.008 * (this.speed / 80);
        if (this.hitFlash > 0) this.hitFlash -= deltaTime;

        // Status effects
        if (this.slowTimer > 0) { this.slowTimer -= deltaTime; if (this.slowTimer <= 0) this.slowFactor = 1; }
        if (this.burnTimer > 0) { this.burnTimer -= deltaTime; this.takeDamage(this.burnDamage * deltaTime / 1000, true); }
        if (this.poisonTimer > 0) { this.poisonTimer -= deltaTime; this.takeDamage(this.poisonDamage * deltaTime / 1000, true); }
        if (this.revealTimer > 0) { this.revealTimer -= deltaTime; if (this.revealTimer <= 0) this.isRevealed = false; }

        // New Specials
        if (this.enemySpecial === 'berserk') {
            this.speed = this.baseSpeed + ((this.maxHp - this.hp) / this.maxHp) * 80;
        }
        if (this.enemySpecial === 'regen') {
            this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.05 * deltaTime / 1000);
        }
        if (this.enemySpecial === 'summon_skel') {
            this.summonTimer += deltaTime;
            if (this.summonTimer > 3500) {
                this.summonTimer = 0;
                let e = new Enemy(this.game, 'skeleton', this.path, this.game.state.wave);
                e.x = this.x + (Math.random() - 0.5) * 30;
                e.y = this.y + (Math.random() - 0.5) * 30;
                e.pathIndex = this.pathIndex;
                this.game.enemies.push(e);
                this.game.particles.emit(this.x, this.y, '#e0e0e0', 8, 40, 200, 2);
            }
        }

        // Healer
        if (this.isHealer) {
            this.healTimer -= deltaTime;
            if (this.healTimer <= 0) {
                this.healTimer = 2000;
                this.game.enemies.forEach(e => {
                    if (!e.dead && !e.reachedEnd && e !== this && Math.hypot(e.x - this.x, e.y - this.y) < 100)
                        e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.05);
                });
            }
        }

        // Boss abilities
        if (this.isBoss) {
            this.abilityTimer += deltaTime;
            if (this.bossAbility === 'stomp' && this.abilityTimer >= 5000) {
                this.abilityTimer = 0;
                this.game.particles.emit(this.x, this.y, this.color, 30, 140, 600, 6);
                this.game.audio?.playExplosion();
                this.game.towers.forEach(t => {
                    if (Math.hypot(t.x - this.x, t.y - this.y) < 150) { t.disabled = true; t.disableTimer = 2000; }
                });
            }
            if (this.bossAbility === 'summon' && this.abilityTimer >= 4000) {
                this.abilityTimer = 0;
                for (let i = 0; i < 3; i++) {
                    let e = new Enemy(this.game, 'scout', this.path, this.game.state.wave);
                    e.x = this.x + (Math.random() - 0.5) * 50;
                    e.y = this.y + (Math.random() - 0.5) * 50;
                    e.pathIndex = this.pathIndex;
                    this.game.enemies.push(e);
                }
                this.game.particles.emit(this.x, this.y, '#7c4dff', 15, 80, 400, 4);
            }
            if (this.bossAbility === 'regen') {
                this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.01 * deltaTime / 1000);
            }
            if (this.bossAbility === 'aura') {
                this.game.enemies.forEach(e => {
                    if (!e.dead && !e.reachedEnd && e !== this && !e.isBoss && Math.hypot(e.x - this.x, e.y - this.y) < 130) {
                        e.shield = Math.min(e.maxHp * 0.3, e.shield + 20 * deltaTime / 1000);
                        e.maxShield = Math.max(e.maxShield, e.shield);
                    }
                });
                this.slowFactor = Math.max(this.slowFactor, 0.7);
            }
            if (this.bossAbility === 'phase') {
                this.phaseTimer += deltaTime;
                if (this.phaseTimer >= 3000) {
                    this.phaseTimer = 0;
                    this.isPhased = !this.isPhased;
                    if (this.isPhased) this.game.particles.emit(this.x, this.y, '#90a4ae', 20, 100, 400, 4);
                }
            }
        }

        // Movement
        let tgt = this.path[this.pathIndex + 1];
        if (!tgt) { this.reachedEnd = true; return; }
        let tx = tgt.x * this.game.map.tileSize + this.game.map.tileSize / 2;
        let ty = tgt.y * this.game.map.tileSize + this.game.map.tileSize / 2;
        let dx = tx - this.x, dy = ty - this.y;
        let dist = Math.hypot(dx, dy);
        this.angle = Math.atan2(dy, dx);
        let move = (this.speed * this.slowFactor * deltaTime) / 1000;
        this.eyeOffset = Math.sin(this.wobble * 3) * 1.5;

        if (dist <= move) {
            this.x = tx; this.y = ty;
            this.pathIndex++;
            if (this.pathIndex >= this.path.length - 1) this.reachedEnd = true;
        } else {
            this.x += (dx / dist) * move;
            this.y += (dy / dist) * move;
        }
    }

    draw(ctx) {
        if (this.dead || this.reachedEnd) return;
        let X = this.x + this.offsetX, Y = this.y + this.offsetY;
        let t = Date.now();
        let r = this.radius;

        ctx.globalAlpha = this.isRevealed ? 0.8 : this.stealthAlpha;
        if (this.isPhased) ctx.globalAlpha = 0.12;

        // Hit flash
        if (this.hitFlash > 0) {
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(X, Y, r + 2, 0, Math.PI * 2); ctx.fill();
        }

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath(); ctx.ellipse(X + 2, Y + r + 2, r * 0.8, r * 0.3, 0, 0, Math.PI * 2); ctx.fill();

        if (this.isBoss) {
            this.drawBoss(ctx, X, Y, r, t);
        } else {
            this.drawRegular(ctx, X, Y, r, t);
        }

        // Health bar
        if (this.hp < this.maxHp || this.isBoss) {
            let barW = Math.max(r * 2.5, 28);
            let barH = this.isBoss ? 6 : 3;
            let barY = Y - r - (this.isBoss ? 30 : 10);
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            this.roundRect(ctx, X - barW / 2 - 1, barY - 1, barW + 2, barH + 2, 2);
            ctx.fill();
            if (this.shield > 0 && this.maxShield > 0) {
                ctx.fillStyle = '#64b5f6';
                ctx.fillRect(X - barW / 2, barY, barW * (this.shield / this.maxShield), barH);
            }
            let pct = Math.max(0, this.hp / this.maxHp);
            ctx.fillStyle = pct > 0.5 ? '#66bb6a' : (pct > 0.25 ? '#ffc107' : '#f44336');
            ctx.fillRect(X - barW / 2, barY, barW * pct, barH);
        }

        // Status icons
        if (this.slowTimer > 0) { ctx.font = '9px sans-serif'; ctx.fillText('❄', X + r + 3, Y - r); }
        if (this.burnTimer > 0) { ctx.font = '9px sans-serif'; ctx.fillText('🔥', X + r + 3, Y - r + 10); }
        if (this.poisonTimer > 0) { ctx.font = '9px sans-serif'; ctx.fillText('☠', X + r + 3, Y - r + 20); }
        if (this.frozenTimer > 0) {
            ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(X, Y, r + 3, 0, Math.PI * 2); ctx.stroke();
        }

        ctx.globalAlpha = 1;
    }

    drawRegular(ctx, X, Y, r, t) {
        let legSwing = Math.sin(this.legPhase) * 4;
        let bodyBob = Math.abs(Math.sin(this.legPhase * 0.5)) * 2;
        Y -= bodyBob;

        // Legs
        ctx.strokeStyle = this.colorAlt;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        // Left leg
        ctx.beginPath(); ctx.moveTo(X - r * 0.3, Y + r); ctx.lineTo(X - r * 0.5 - legSwing, Y + r + 6); ctx.stroke();
        // Right leg
        ctx.beginPath(); ctx.moveTo(X + r * 0.3, Y + r); ctx.lineTo(X + r * 0.5 + legSwing, Y + r + 6); ctx.stroke();

        // Body
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 6; ctx.shadowColor = this.color + '80';

        if (this.shape === 'triangle') {
            // Pointy, menacing triangle body
            ctx.beginPath();
            ctx.moveTo(X + Math.cos(this.angle) * r * 1.3, Y + Math.sin(this.angle) * r * 1.3);
            ctx.lineTo(X + Math.cos(this.angle + 2.3) * r, Y + Math.sin(this.angle + 2.3) * r);
            ctx.lineTo(X + Math.cos(this.angle - 2.3) * r, Y + Math.sin(this.angle - 2.3) * r);
            ctx.closePath(); ctx.fill();
        } else if (this.shape === 'diamond') {
            ctx.beginPath();
            ctx.moveTo(X, Y - r * 1.2); ctx.lineTo(X + r, Y);
            ctx.lineTo(X, Y + r * 0.8); ctx.lineTo(X - r, Y); ctx.closePath(); ctx.fill();
            ctx.fillStyle = this.colorAlt;
            ctx.beginPath();
            ctx.moveTo(X, Y - r * 0.8); ctx.lineTo(X + r * 0.5, Y);
            ctx.lineTo(X, Y + r * 0.4); ctx.lineTo(X - r * 0.5, Y); ctx.closePath(); ctx.fill();
        } else if (this.shape === 'hexagon') {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                let a = (Math.PI / 3) * i - Math.PI / 6;
                let hx = X + Math.cos(a) * r, hy = Y + Math.sin(a) * r;
                if (i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
            }
            ctx.closePath(); ctx.fill();
            // Inner hex
            ctx.fillStyle = this.colorAlt;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                let a = (Math.PI / 3) * i; let s = r * 0.5;
                if (i === 0) ctx.moveTo(X + Math.cos(a) * s, Y + Math.sin(a) * s);
                else ctx.lineTo(X + Math.cos(a) * s, Y + Math.sin(a) * s);
            }
            ctx.closePath(); ctx.fill();
        } else if (this.shape === 'square') {
            this.roundRect(ctx, X - r, Y - r, r * 2, r * 2, 4);
            ctx.fill();
            // Inner detail
            ctx.fillStyle = this.colorAlt;
            this.roundRect(ctx, X - r * 0.5, Y - r * 0.5, r, r, 2);
            ctx.fill();
        } else {
            ctx.beginPath(); ctx.arc(X, Y, r, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = this.colorAlt;
            ctx.beginPath(); ctx.arc(X, Y, r * 0.6, 0, Math.PI * 2); ctx.fill();
        }

        ctx.shadowBlur = 0;

        // Eyes (all enemies get expressive eyes)
        let eyeR = Math.max(2, r * 0.18);
        let eyeDist = r * 0.35;
        let ex1 = X - eyeDist + this.eyeOffset, ey = Y - r * 0.1;
        let ex2 = X + eyeDist + this.eyeOffset;

        // Eye whites
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(ex1, ey, eyeR + 1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(ex2, ey, eyeR + 1, 0, Math.PI * 2); ctx.fill();
        // Pupils (look toward movement)
        let px = Math.cos(this.angle) * eyeR * 0.4;
        let py = Math.sin(this.angle) * eyeR * 0.4;
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.arc(ex1 + px, ey + py, eyeR * 0.7, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(ex2 + px, ey + py, eyeR * 0.7, 0, Math.PI * 2); ctx.fill();

        // Healer cross
        if (this.isHealer) {
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(X, Y - 5); ctx.lineTo(X, Y + 5); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(X - 5, Y); ctx.lineTo(X + 5, Y); ctx.stroke();
            ctx.strokeStyle = 'rgba(129, 199, 132, 0.2)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(X, Y, 80, 0, Math.PI * 2); ctx.stroke();
        }

        // Shield visual
        if (this.shield > 0) {
            ctx.strokeStyle = 'rgba(100, 181, 246, 0.6)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(X, Y, r + 4, 0, Math.PI * 2); ctx.stroke();
        }
    }

    drawBoss(ctx, X, Y, r, t) {
        let pulse = Math.sin(t / 250 + this.pulsePhase) * 5;
        let R = r + pulse;

        // Menacing aura rings
        for (let i = 4; i >= 1; i--) {
            let ringR = R + 14 * i + Math.sin(t / 400 + i) * 4;
            ctx.strokeStyle = this.color;
            ctx.globalAlpha = (this.isPhased ? 0.02 : 0.06) * i;
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(X, Y, ringR, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.globalAlpha = this.isPhased ? 0.12 : 1;

        // Outer glow
        let gradient = ctx.createRadialGradient(X, Y, R * 0.5, X, Y, R * 1.5);
        gradient.addColorStop(0, this.color + '40');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath(); ctx.arc(X, Y, R * 1.5, 0, Math.PI * 2); ctx.fill();

        // Body — layered octagon with rotation
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 20; ctx.shadowColor = this.color;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            let a = (Math.PI / 4) * i + t / 4000;
            let hx = X + Math.cos(a) * R, hy = Y + Math.sin(a) * R;
            if (i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
        }
        ctx.closePath(); ctx.fill();

        // Inner layer
        ctx.fillStyle = this.colorAlt || '#fff';
        ctx.globalAlpha *= 0.3;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            let a = (Math.PI / 4) * i - t / 3000;
            let s = R * 0.6;
            if (i === 0) ctx.moveTo(X + Math.cos(a) * s, Y + Math.sin(a) * s);
            else ctx.lineTo(X + Math.cos(a) * s, Y + Math.sin(a) * s);
        }
        ctx.closePath(); ctx.fill();
        ctx.globalAlpha = this.isPhased ? 0.12 : 1;
        ctx.shadowBlur = 0;

        // Core eye
        ctx.fillStyle = '#fff';
        ctx.globalAlpha *= (0.7 + Math.sin(t / 150) * 0.3);
        ctx.beginPath(); ctx.arc(X, Y, R * 0.25, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.arc(X + Math.cos(this.angle) * 3, Y + Math.sin(this.angle) * 3, R * 0.12, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = this.isPhased ? 0.12 : 1;

        // Boss emoji icon
        ctx.font = `${Math.floor(R * 0.5)}px sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        let icons = { boss_warlord: '⚔️', boss_lich: '💀', boss_dragon: '🐉', boss_titan: '🏔️', boss_shadow_lord: '👁️' };
        ctx.fillText(icons[this.typeName] || '💀', X, Y - R - 10);

        // Boss name
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = this.color;
        ctx.fillText(this.displayName, X, Y - R - 24);

        // Titan aura
        if (this.bossAbility === 'aura') {
            ctx.strokeStyle = 'rgba(255, 214, 0, 0.12)';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath(); ctx.arc(X, Y, 130, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    takeDamage(amount, isDot = false) {
        if (this.isPhased && !isDot) return;
        if (this.shield > 0) {
            let absorbed = Math.min(this.shield, amount);
            this.shield -= absorbed;
            amount -= absorbed;
        }
        this.hp -= amount;
        this.hitFlash = 80;
        if (this.hp <= 0) { this.hp = 0; this.dead = true; }
    }

    applySlow(f, d) {
        if (this.bossAbility === 'aura' || this.enemySpecial === 'unyielding') return;
        if (this.isBoss && f < 0.4) f = 0.4;
        this.slowFactor = f; this.slowTimer = d;
    }
    applyBurn(dps, dur) { this.burnDamage = dps; this.burnTimer = dur; }
    applyPoison(dps, dur) { this.poisonDamage += dps * 0.5; this.poisonTimer = dur; }
    reveal(dur) { this.isRevealed = true; this.revealTimer = dur; }
}
