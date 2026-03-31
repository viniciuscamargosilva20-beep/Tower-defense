export class Projectile {
    constructor(game, x, y, target, damage, speed, isAoe, aoeRadius, color, special) {
        this.game = game;
        this.x = x; this.y = y;
        this.target = target;
        this.damage = damage;
        this.speed = speed;
        this.isAoe = isAoe;
        this.aoeRadius = aoeRadius || 60;
        this.color = color;
        this.special = special;
        this.dead = false;
        this.targetX = target.x; this.targetY = target.y;
        this.trail = [];
    }

    update(deltaTime) {
        if (this.dead) return;
        if (!this.target.dead) { this.targetX = this.target.x; this.targetY = this.target.y; }
        this.trail.push({ x: this.x, y: this.y, life: 100 });
        if (this.trail.length > 5) this.trail.shift();

        let dx = this.targetX - this.x, dy = this.targetY - this.y;
        let dist = Math.hypot(dx, dy);
        let move = (this.speed * deltaTime) / 1000;
        if (dist <= move + 5) this.hit();
        else { this.x += (dx / dist) * move; this.y += (dy / dist) * move; }
    }

    hit() {
        this.dead = true;
        this.game.particles.emit(this.x, this.y, this.color, 4, 70, 180, 2);
        if (this.isAoe) {
            this.game.shakeScreen(150, 4);
            this.game.particles.emit(this.x, this.y, '#f57f17', 15, 120, 350, 4);
            this.game.enemies.forEach(e => {
                if (!e.dead && !e.reachedEnd && Math.hypot(e.x - this.x, e.y - this.y) <= this.aoeRadius) {
                    e.takeDamage(this.damage);
                    this.applySpecial(e);
                }
            });
        } else if (!this.target.dead) {
            this.target.takeDamage(this.damage);
            this.applySpecial(this.target);
        }
    }

    applySpecial(enemy) {
        if (this.special === 'slow') enemy.applySlow(0.35, 2500);
        if (this.special === 'burn') enemy.applyBurn(20, 3500);
        if (this.special === 'poison') enemy.applyPoison(12, 4000);
    }

    draw(ctx) {
        if (this.dead) return;
        ctx.globalCompositeOperation = 'lighter';
        this.trail.forEach(t => {
            ctx.globalAlpha = t.life / 100 * 0.5;
            ctx.fillStyle = this.color;
            ctx.beginPath(); ctx.arc(t.x, t.y, 2.5, 0, Math.PI * 2); ctx.fill();
        });
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ffffff'; 
        ctx.shadowBlur = 15; ctx.shadowColor = this.color;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.isAoe ? 5 : 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.isAoe ? 7 : 4, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalCompositeOperation = 'source-over';
    }
}
