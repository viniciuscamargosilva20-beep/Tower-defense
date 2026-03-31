import { TOWER_DATA } from '../data/towers.js';
import { Projectile } from './projectile.js';

export class Tower {
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x; this.y = y;
        this.type = type;
        this.level = 1;

        let d = TOWER_DATA[type];
        this.name = d.name; this.category = d.category;
        this.baseRange = d.range; this.baseDamage = d.damage; this.baseFireRate = d.fireRate;
        this.projSpeed = d.projSpeed; this.isAoe = d.isAoe; this.aoeRadius = d.aoeRadius;
        this.color = d.color; this.projColor = d.projColor;
        this.special = d.special; this.icon = d.icon;
        this.upgradeCosts = d.upgradeCost; this.upgradeNames = d.upgradeNames;

        this.range = this.baseRange; this.damage = this.baseDamage; this.fireRate = this.baseFireRate;
        this.cooldown = 0; this.target = null; this.angle = 0;
        this.farmTimer = 0; this.totalGenerated = 0;
        this.beamTarget = null;
        this.disabled = false; this.disableTimer = 0;
        this._rangeBuff = 1; this._speedBuff = 1; this._damageBuff = 1;
    }

    getUpgradeCost() { return this.level <= this.upgradeCosts.length ? this.upgradeCosts[this.level - 1] : null; }
    getCurrentUpgradeName() { return this.upgradeNames[this.level - 1] || 'MAX'; }
    getNextUpgradeName() { return this.upgradeNames[this.level] || null; }

    upgrade() {
        let cost = this.getUpgradeCost();
        if (!cost || this.game.state.money < cost) return false;
        this.game.state.money -= cost;
        this.level++;
        this.game.particles.emit(this.x, this.y, '#66bb6a', 18, 80, 400, 3);
        return true;
    }

    getSellValue() {
        let spent = TOWER_DATA[this.type].cost;
        for (let i = 0; i < this.level - 1 && i < this.upgradeCosts.length; i++) spent += this.upgradeCosts[i];
        return Math.floor(spent * 0.6);
    }

    update(deltaTime) {
        if (this.disabled) { this.disableTimer -= deltaTime; if (this.disableTimer <= 0) this.disabled = false; return; }

        // Farm
        if (this.special === 'gold_passive') {
            this.farmTimer -= deltaTime;
            if (this.farmTimer <= 0) {
                let amt = 12 * this.level;
                this.game.state.money += amt;
                this.totalGenerated += amt;
                this.game.state.totalEarnings += amt;
                this.farmTimer = this.fireRate;
                this.game.particles.emit(this.x, this.y, '#ffd700', 3, 20, 250, 2);
            }
            return;
        }
        if (this.special === 'gold_wave' || this.special === 'buff_damage' || this.special === 'buff_speed') return;

        // Radar
        if (this.special === 'radar') {
            this.game.enemies.forEach(e => {
                if (e.enemySpecial === 'stealth' && this.distTo(e) <= this.range) {
                    e.reveal(200);
                }
            });
            return;
        }

        // Quake
        if (this.special === 'quake') {
            if (this.cooldown > 0) this.cooldown -= deltaTime;
            if (this.cooldown <= 0) {
                let hit = false;
                this.game.enemies.forEach(e => {
                    if (e.dead || e.reachedEnd) return;
                    if (this.distTo(e) <= this.range) {
                        e.takeDamage(this.damage);
                        e.applySlow(0.4, 1000);
                        hit = true;
                    }
                });
                if (hit) {
                    this.game.particles.emit(this.x, this.y, '#795548', 20, this.range, 400, 4);
                    if (this.game.audio) this.game.audio.playExplosion();
                    this.game.shakeScreen(300, 8);
                    this.cooldown = this.fireRate;
                }
            }
            return;
        }

        // Chrono
        if (this.special === 'chrono') {
            if (this.cooldown > 0) this.cooldown -= deltaTime;
            if (this.cooldown <= 0) {
                let hit = false;
                this.game.enemies.forEach(e => {
                    if (e.dead || e.reachedEnd) return;
                    if (this.distTo(e) <= this.range) {
                        e.frozenTimer = 2000;
                        hit = true;
                    }
                });
                if (hit) {
                    this.game.particles.emit(this.x, this.y, '#9C27B0', 30, this.range, 800, 5);
                    if (this.game.audio) this.game.audio.playSkill();
                    this.game.shakeScreen(200, 5);
                    this.cooldown = this.fireRate;
                }
            }
            return;
        }

        // Tesla / chain
        if (this.special === 'tesla') {
            if (this.cooldown > 0) this.cooldown -= deltaTime;
            if (this.cooldown <= 0) {
                let t = this.findTarget();
                if (t) {
                    this.angle = Math.atan2(t.y - this.y, t.x - this.x);
                    t.takeDamage(this.damage);
                    if (t.enemySpecial === 'stealth') t.reveal(3000);
                    this.game.particles.emit(t.x, t.y, this.color, 4, 50, 150, 2);
                    let chained = 0;
                    this.game.enemies.forEach(e => {
                        if (chained >= 2 + this.level || e.dead || e.reachedEnd || e === t) return;
                        if (Math.hypot(e.x - t.x, e.y - t.y) < 100) { e.takeDamage(this.damage * 0.5); chained++; }
                    });
                    this.cooldown = this.fireRate;
                }
            }
            return;
        }

        // Blackhole / Vortex
        if (this.special === 'blackhole') {
            this.game.enemies.forEach(e => {
                if (e.dead || e.reachedEnd) return;
                let d = Math.hypot(e.x - this.x, e.y - this.y);
                if (d <= this.range) {
                    e.applySlow(0.25, 200);
                    e.takeDamage(this.damage * deltaTime / 1000, true);
                    if (d > 15) { let pull = 30 * deltaTime / 1000; e.x -= ((e.x - this.x) / d) * pull; e.y -= ((e.y - this.y) / d) * pull; }
                }
            });
            return;
        }

        // Beam
        if (this.special === 'beam') {
            this.target = this.findTarget();
            if (this.target) {
                this.angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
                this.target.takeDamage(this.damage * this.level * deltaTime / 1000);
                this.beamTarget = this.target;
            } else this.beamTarget = null;
            return;
        }

        // Multishot
        if (this.special === 'multishot') {
            if (this.cooldown > 0) this.cooldown -= deltaTime;
            if (this.cooldown <= 0) {
                let targets = [], count = 2 + this.level;
                for (let e of this.game.enemies) {
                    if (e.dead || e.reachedEnd) continue;
                    if (this.distTo(e) <= this.range) { targets.push(e); if (targets.length >= count) break; }
                }
                if (targets.length > 0) {
                    targets.forEach(t => {
                        this.angle = Math.atan2(t.y - this.y, t.x - this.x);
                        this.game.projectiles.push(new Projectile(this.game, this.x + Math.cos(this.angle) * 14, this.y + Math.sin(this.angle) * 14, t, this.damage, this.projSpeed, false, 0, this.projColor, this.special));
                    });
                    this.cooldown = this.fireRate;
                }
            }
            return;
        }

        // Standard targeting
        if (this.cooldown > 0) this.cooldown -= deltaTime;
        if (!this.target || this.target.dead || this.distTo(this.target) > this.range || this.target.reachedEnd) this.target = this.findTarget();
        if (this.target) {
            this.angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            if (this.cooldown <= 0) {
                this.game.projectiles.push(new Projectile(this.game, this.x + Math.cos(this.angle) * 14, this.y + Math.sin(this.angle) * 14, this.target, this.damage, this.projSpeed, this.isAoe, this.aoeRadius, this.projColor, this.special));
                this.cooldown = this.fireRate;
            }
        }
    }

    distTo(e) { return Math.hypot(e.x - this.x, e.y - this.y); }

    findTarget() {
        let best = null, bestDist = this.range + 1;
        for (let e of this.game.enemies) {
            if (e.dead || e.reachedEnd) continue;
            let d = this.distTo(e);
            if (d <= this.range && d < bestDist) { bestDist = d; best = e; }
        }
        return best;
    }

    draw(ctx) {
        let r = 18;

        // Support aura ring
        if (this.special === 'buff_damage' || this.special === 'buff_speed') {
            ctx.strokeStyle = this.color + '20';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath(); ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);
        }

        // Blackhole rings
        if (this.special === 'blackhole') {
            for (let i = 1; i <= 3; i++) {
                ctx.strokeStyle = this.color;
                ctx.globalAlpha = 0.08;
                ctx.beginPath(); ctx.arc(this.x, this.y, (this.range / 3) * i, 0, Math.PI * 2); ctx.stroke();
            }
            ctx.globalAlpha = 1;
        }

        // Beam
        if (this.special === 'beam' && this.beamTarget && !this.beamTarget.dead) {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2 + Math.sin(Date.now() / 50) * 1.5;
            ctx.shadowBlur = 12; ctx.shadowColor = this.color;
            ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(this.beamTarget.x, this.beamTarget.y); ctx.stroke();
            ctx.shadowBlur = 0;
        }

        if (this.disabled) ctx.globalAlpha = 0.3;

        // Tower base
        ctx.fillStyle = '#1a1a2e';
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 6; ctx.shadowColor = this.color;
        ctx.beginPath(); ctx.arc(this.x, this.y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.shadowBlur = 0;

        // Level pips
        for (let i = 0; i < this.level - 1; i++) {
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            let a = -Math.PI / 2 + (i * Math.PI / 3);
            ctx.arc(this.x + Math.cos(a) * (r + 5), this.y + Math.sin(a) * (r + 5), 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Turret / icon
        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.category === 'farm' || this.category === 'support') {
            ctx.font = '14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillStyle = this.color; ctx.fillText(this.icon, 0, 1);
        } else {
            ctx.rotate(this.angle);
            ctx.fillStyle = this.color;
            ctx.fillRect(0, -3, 18, 6);
            ctx.fillStyle = '#0f0f1a';
            ctx.fillRect(4, -1, 12, 2);
        }
        ctx.restore();

        // Farm earnings label
        if (this.special === 'gold_passive' && this.totalGenerated > 0) {
            ctx.fillStyle = '#ffd700'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
            ctx.fillText(`+${this.totalGenerated}`, this.x, this.y + r + 13);
        }

        ctx.globalAlpha = 1;
    }
}
