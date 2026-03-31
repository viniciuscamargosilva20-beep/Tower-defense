export class SkillSystem {
    constructor(game) {
        this.game = game;
        this.skills = {
            heal:      { name: 'Heal',         cooldown: 0, maxCooldown: 25000, icon: '💚', key: '1', desc: 'Restore 4 lives' },
            smite:     { name: 'Smite',         cooldown: 0, maxCooldown: 35000, icon: '⚡', key: '2', desc: 'Kill weakest 25%' },
            overclock: { name: 'Overclock',     cooldown: 0, maxCooldown: 40000, icon: '🔥', key: '3', desc: '2x tower speed 10s' },
            blizzard:  { name: 'Blizzard',      cooldown: 0, maxCooldown: 30000, icon: '❄️', key: '4', desc: 'Freeze all 4s' }
        };
        this.activeEffects = [];
    }

    update(deltaTime) {
        for (let k in this.skills) {
            if (this.skills[k].cooldown > 0) {
                this.skills[k].cooldown -= deltaTime;
                if (this.skills[k].cooldown < 0) this.skills[k].cooldown = 0;
            }
        }
        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            this.activeEffects[i].duration -= deltaTime;
            if (this.activeEffects[i].duration <= 0) this.activeEffects.splice(i, 1);
        }
    }

    activate(key) {
        let s = this.skills[key];
        if (!s || s.cooldown > 0) return false;
        s.cooldown = s.maxCooldown;

        if (key === 'heal') {
            this.game.state.lives = Math.min(this.game.state.lives + 4, 30);
            this.game.particles.emit(this.game.width / 2, 40, '#66bb6a', 15, 60, 400, 3);
        }
        if (key === 'smite') {
            let sorted = [...this.game.enemies].filter(e => !e.dead && !e.reachedEnd).sort((a, b) => a.hp - b.hp);
            let count = Math.ceil(sorted.length * 0.25);
            for (let i = 0; i < count; i++) {
                sorted[i].hp = 0; sorted[i].dead = true;
                this.game.particles.emit(sorted[i].x, sorted[i].y, '#ffc107', 8, 80, 300, 3);
            }
        }
        if (key === 'overclock') this.activeEffects.push({ type: 'overclock', duration: 10000 });
        if (key === 'blizzard') {
            this.game.enemies.forEach(e => {
                if (!e.dead && !e.reachedEnd) {
                    e.frozenTimer = 4000;
                    this.game.particles.emit(e.x, e.y, '#4fc3f7', 4, 30, 300, 2);
                }
            });
        }
        return true;
    }

    isOverclockActive() { return this.activeEffects.some(e => e.type === 'overclock'); }
}
