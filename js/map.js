// ══════════════════════════════════════════════════════════════
// MAP SYSTEM — 3 maps with decorations (rocks, trees, water)
// ══════════════════════════════════════════════════════════════

export const MAP_DEFS = {
    forest: {
        name: 'Forest Path',
        desc: 'A winding trail through ancient woods',
        icon: '🌲',
        bgColor: '#1a2a1a',
        pathColor: '#5d4e37',
        pathGlow: '#8a7a5a',
        grassColor: '#1e3a1e',
        gridColor: 'rgba(40, 80, 40, 0.08)',
        path: [
            {x:0,y:4},{x:4,y:4},{x:4,y:1},{x:8,y:1},{x:8,y:4},{x:12,y:4},
            {x:12,y:8},{x:8,y:8},{x:8,y:11},{x:4,y:11},{x:4,y:8},{x:0,y:8},
            {x:0,y:13},{x:8,y:13},{x:8,y:15},{x:14,y:15},{x:14,y:12},{x:18,y:12},
            {x:18,y:6},{x:14,y:6},{x:14,y:3},{x:18,y:3},{x:18,y:0},{x:23,y:0},
            {x:23,y:4},{x:20,y:4},{x:20,y:9},{x:23,y:9},{x:23,y:14},{x:20,y:14},{x:20,y:19}
        ],
        decorations: [
            {type:'tree',x:2,y:2},{type:'tree',x:6,y:6},{type:'rock',x:10,y:3},{type:'tree',x:15,y:1},
            {type:'tree',x:1,y:10},{type:'rock',x:6,y:5},{type:'bush',x:3,y:6},{type:'tree',x:16,y:9},
            {type:'rock',x:22,y:7},{type:'bush',x:11,y:10},{type:'tree',x:13,y:14},{type:'tree',x:17,y:17},
            {type:'rock',x:22,y:12},{type:'bush',x:5,y:15},{type:'tree',x:9,y:17},{type:'rock',x:2,y:17},
            {type:'bush',x:19,y:1},{type:'tree',x:21,y:16},{type:'rock',x:7,y:9},{type:'bush',x:16,y:5}
        ]
    },
    desert: {
        name: 'Desert Canyon',
        desc: 'Scorching sands and ancient ruins',
        icon: '🏜️',
        bgColor: '#2a2218',
        pathColor: '#c4a265',
        pathGlow: '#dbb878',
        grassColor: '#352a1c',
        gridColor: 'rgba(80, 60, 30, 0.08)',
        path: [
            {x:0,y:2},{x:6,y:2},{x:6,y:6},{x:2,y:6},{x:2,y:10},{x:10,y:10},
            {x:10,y:2},{x:16,y:2},{x:16,y:6},{x:12,y:6},{x:12,y:12},{x:18,y:12},
            {x:18,y:8},{x:22,y:8},{x:22,y:14},{x:16,y:14},{x:16,y:18},{x:8,y:18},
            {x:8,y:14},{x:4,y:14},{x:4,y:18},{x:0,y:18},{x:0,y:19}
        ],
        decorations: [
            {type:'cactus',x:4,y:4},{type:'rock',x:8,y:1},{type:'cactus',x:14,y:4},{type:'rock',x:20,y:3},
            {type:'ruins',x:1,y:8},{type:'cactus',x:7,y:8},{type:'rock',x:14,y:10},{type:'cactus',x:21,y:11},
            {type:'ruins',x:10,y:16},{type:'rock',x:20,y:16},{type:'cactus',x:6,y:16},{type:'rock',x:13,y:8},
            {type:'cactus',x:2,y:12},{type:'ruins',x:18,y:4},{type:'rock',x:11,y:4},{type:'cactus',x:22,y:17}
        ]
    },
    ice: {
        name: 'Frozen Peaks',
        desc: 'Treacherous ice and howling winds',
        icon: '🏔️',
        bgColor: '#141e2a',
        pathColor: '#6a8fa8',
        pathGlow: '#8ab4d0',
        grassColor: '#1a2836',
        gridColor: 'rgba(40, 60, 90, 0.08)',
        path: [
            {x:0,y:10},{x:4,y:10},{x:4,y:3},{x:8,y:3},{x:8,y:7},{x:12,y:7},
            {x:12,y:1},{x:17,y:1},{x:17,y:5},{x:14,y:5},{x:14,y:10},{x:10,y:10},
            {x:10,y:14},{x:6,y:14},{x:6,y:18},{x:14,y:18},{x:14,y:14},{x:20,y:14},
            {x:20,y:8},{x:23,y:8},{x:23,y:18},{x:18,y:18},{x:18,y:19}
        ],
        decorations: [
            {type:'crystal',x:2,y:5},{type:'rock',x:6,y:1},{type:'crystal',x:10,y:4},{type:'rock',x:15,y:3},
            {type:'crystal',x:19,y:7},{type:'rock',x:3,y:13},{type:'crystal',x:8,y:12},{type:'rock',x:12,y:16},
            {type:'crystal',x:16,y:11},{type:'rock',x:22,y:5},{type:'crystal',x:21,y:12},{type:'rock',x:8,y:16},
            {type:'crystal',x:1,y:17},{type:'rock',x:17,y:16},{type:'crystal',x:5,y:8},{type:'rock',x:19,y:2}
        ]
    }
};

export class Map {
    constructor(game, mapId = 'forest') {
        this.game = game;
        this.tileSize = 40;
        this.cols = Math.floor(game.width / this.tileSize);
        this.rows = Math.floor(game.height / this.tileSize);
        this.mapDef = MAP_DEFS[mapId] || MAP_DEFS.forest;
        this.path = this.mapDef.path;
        this.decorations = this.mapDef.decorations;

        // Build grid (0=empty, 1=path)
        this.grid = [];
        for (let r = 0; r < this.rows; r++) {
            this.grid[r] = [];
            for (let c = 0; c < this.cols; c++) this.grid[r][c] = 0;
        }

        // Mark path on grid
        for (let i = 0; i < this.path.length - 1; i++) {
            let a = this.path[i], b = this.path[i + 1];
            let dx = Math.sign(b.x - a.x), dy = Math.sign(b.y - a.y);
            let cx = a.x, cy = a.y;
            while (cx !== b.x || cy !== b.y) {
                if (cy >= 0 && cy < this.rows && cx >= 0 && cx < this.cols) this.grid[cy][cx] = 1;
                cx += dx; cy += dy;
            }
        }
        let last = this.path[this.path.length - 1];
        if (last.y < this.rows && last.x < this.cols) this.grid[last.y][last.x] = 1;

        // Pre-render decorations
        this._decoCache = this.decorations.map(d => ({
            ...d,
            px: d.x * this.tileSize + this.tileSize / 2,
            py: d.y * this.tileSize + this.tileSize / 2
        }));
    }

    draw(ctx, time) {
        let ts = this.tileSize;
        let def = this.mapDef;

        // Background
        ctx.fillStyle = def.bgColor;
        ctx.fillRect(0, 0, this.game.width, this.game.height);

        // Subtle grid
        ctx.strokeStyle = def.gridColor;
        ctx.lineWidth = 0.5;
        for (let c = 0; c <= this.cols; c++) {
            ctx.beginPath(); ctx.moveTo(c * ts, 0); ctx.lineTo(c * ts, this.game.height); ctx.stroke();
        }
        for (let r = 0; r <= this.rows; r++) {
            ctx.beginPath(); ctx.moveTo(0, r * ts); ctx.lineTo(this.game.width, r * ts); ctx.stroke();
        }

        // Path tiles
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c] === 1) {
                    ctx.fillStyle = def.pathColor;
                    ctx.fillRect(c * ts + 1, r * ts + 1, ts - 2, ts - 2);
                    // Subtle edge glow
                    ctx.strokeStyle = def.pathGlow + '30';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(c * ts + 1, r * ts + 1, ts - 2, ts - 2);
                }
            }
        }

        // Path lines (smooth)
        ctx.strokeStyle = def.pathGlow + '40';
        ctx.lineWidth = 2;
        ctx.beginPath();
        this.path.forEach((p, i) => {
            let px = p.x * ts + ts / 2, py = p.y * ts + ts / 2;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        });
        ctx.stroke();

        // Decorations
        this._decoCache.forEach(d => this.drawDecoration(ctx, d, time));

        // Spawn point indicator
        let sp = this.path[0];
        let spx = sp.x * ts + ts / 2, spy = sp.y * ts + ts / 2;
        let pulse = Math.sin(time / 400) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(76, 175, 80, ${pulse * 0.3})`;
        ctx.beginPath(); ctx.arc(spx, spy, 16 + Math.sin(time / 300) * 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath(); ctx.arc(spx, spy, 6, 0, Math.PI * 2); ctx.fill();

        // End point
        let ep = this.path[this.path.length - 1];
        let epx = ep.x * ts + ts / 2, epy = ep.y * ts + ts / 2;
        let pulse2 = Math.sin(time / 350) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(244, 67, 54, ${pulse2 * 0.3})`;
        ctx.beginPath(); ctx.arc(epx, epy, 16 + Math.sin(time / 280) * 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#f44336';
        ctx.beginPath(); ctx.arc(epx, epy, 6, 0, Math.PI * 2); ctx.fill();
    }

    drawDecoration(ctx, d, time) {
        let x = d.px, y = d.py;

        if (d.type === 'tree') {
            // Trunk
            ctx.fillStyle = '#5d4e37';
            ctx.fillRect(x - 3, y, 6, 12);
            // Canopy (layered circles)
            ctx.fillStyle = '#2d5a2d';
            ctx.beginPath(); ctx.arc(x, y - 4, 14, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#3a7a3a';
            ctx.beginPath(); ctx.arc(x - 3, y - 6, 10, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + 4, y - 3, 9, 0, Math.PI * 2); ctx.fill();
            // Highlight
            ctx.fillStyle = 'rgba(100, 200, 100, 0.15)';
            ctx.beginPath(); ctx.arc(x - 2, y - 8, 6, 0, Math.PI * 2); ctx.fill();
        }

        if (d.type === 'rock') {
            ctx.fillStyle = '#4a4a4a';
            ctx.beginPath();
            ctx.moveTo(x - 12, y + 6); ctx.lineTo(x - 8, y - 8);
            ctx.lineTo(x + 2, y - 10); ctx.lineTo(x + 10, y - 4);
            ctx.lineTo(x + 12, y + 6); ctx.closePath();
            ctx.fill();
            // Highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.beginPath();
            ctx.moveTo(x - 6, y - 5); ctx.lineTo(x, y - 9);
            ctx.lineTo(x + 6, y - 5); ctx.lineTo(x, y - 3); ctx.closePath();
            ctx.fill();
            // Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.beginPath();
            ctx.ellipse(x, y + 7, 11, 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        if (d.type === 'bush') {
            ctx.fillStyle = '#2a5a2a';
            ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#3a7a3a';
            ctx.beginPath(); ctx.arc(x - 4, y - 2, 6, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + 3, y + 1, 5, 0, Math.PI * 2); ctx.fill();
        }

        if (d.type === 'cactus') {
            ctx.fillStyle = '#4a7a3a';
            ctx.fillRect(x - 3, y - 14, 6, 24);
            ctx.fillRect(x - 10, y - 8, 8, 5);
            ctx.fillRect(x + 2, y - 4, 10, 5);
            ctx.fillStyle = '#5a9a4a';
            ctx.fillRect(x - 2, y - 13, 4, 22);
        }

        if (d.type === 'ruins') {
            ctx.fillStyle = '#6a5a4a';
            ctx.fillRect(x - 10, y - 6, 5, 16);
            ctx.fillRect(x + 5, y - 8, 5, 18);
            ctx.fillRect(x - 10, y - 8, 20, 4);
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(x - 4, y + 2, 8, 8);
        }

        if (d.type === 'crystal') {
            let glow = Math.sin(time / 1000 + d.x) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(100, 180, 255, ${glow * 0.6})`;
            ctx.beginPath();
            ctx.moveTo(x, y - 14); ctx.lineTo(x + 6, y);
            ctx.lineTo(x + 3, y + 8); ctx.lineTo(x - 3, y + 8);
            ctx.lineTo(x - 6, y); ctx.closePath();
            ctx.fill();
            ctx.fillStyle = `rgba(180, 220, 255, ${glow * 0.3})`;
            ctx.beginPath();
            ctx.moveTo(x, y - 12); ctx.lineTo(x + 3, y - 2);
            ctx.lineTo(x - 3, y - 2); ctx.closePath();
            ctx.fill();
            // Glow
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(100, 180, 255, 0.3)';
            ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
}
