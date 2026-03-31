export class Particle {
    constructor(x, y, color, speed, life, size) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        let angle = Math.random() * Math.PI * 2;
        let s = Math.random() * speed;
        this.vx = Math.cos(angle) * s;
        this.vy = Math.sin(angle) * s;
        this.size = size || (Math.random() * 3 + 1);
        this.gravity = 50; 
        this.drag = 0.95;  
    }

    update(dt) {
        let dts = dt / 1000;
        this.vx *= Math.pow(this.drag, dts * 60);
        this.vy *= Math.pow(this.drag, dts * 60);
        this.vy += this.gravity * dts; 
        this.x += this.vx * dts;
        this.y += this.vy * dts;
        this.life -= dt;
    }

    draw(ctx) {
        if (this.life <= 0) return;
        let alpha = this.life / this.maxLife;
        let currentSize = this.size * alpha;

        ctx.globalAlpha = alpha;
        
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = this.color;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
        ctx.fill();

        if (this.size > 2) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, currentSize * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
    }
}

export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emit(x, y, color, count, speed, life, baseSize = 3) {
        for (let i = 0; i < count; i++) {
            let pLife = life * (0.5 + Math.random() * 0.8);
            let pSpeed = speed * (0.8 + Math.random() * 0.6);
            let pSize = baseSize * (0.5 + Math.random());
            this.particles.push(new Particle(x, y, color, pSpeed, pLife, pSize));
        }
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt);
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    }
}
