import { Game } from './game.js';
import { TOWER_DATA, CATEGORY_COLORS, CATEGORY_NAMES } from './data/towers.js';
import { DIFFICULTIES } from './data/waves.js';
import { MAP_DEFS } from './map.js';

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const game = new Game(canvas);

    let selectedDiff = null;
    let selectedMap = null;

    // Build difficulty grid
    const diffGrid = document.getElementById('diff-grid');
    for (let id in DIFFICULTIES) {
        let d = DIFFICULTIES[id];
        let btn = document.createElement('button');
        btn.className = 'diff-btn';
        btn.setAttribute('data-diff', id);
        btn.innerHTML = `<span class="diff-name" style="color:${d.color}">${d.name}</span><span class="diff-desc">${d.desc}</span>`;
        btn.addEventListener('click', () => {
            diffGrid.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedDiff = id;
            checkReady();
        });
        diffGrid.appendChild(btn);
    }

    // Build map grid
    const mapGrid = document.getElementById('map-grid');
    for (let id in MAP_DEFS) {
        let m = MAP_DEFS[id];
        let btn = document.createElement('button');
        btn.className = 'map-btn';
        btn.setAttribute('data-map', id);
        btn.innerHTML = `<span class="map-icon">${m.icon}</span><span class="map-name">${m.name}</span><span class="map-desc">${m.desc}</span>`;
        btn.addEventListener('click', () => {
            mapGrid.querySelectorAll('.map-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedMap = id;
            checkReady();
        });
        mapGrid.appendChild(btn);
    }

    function checkReady() {
        document.getElementById('btn-play').disabled = !(selectedDiff && selectedMap);
    }

    document.getElementById('btn-play').addEventListener('click', () => {
        if (!selectedDiff || !selectedMap) return;
        document.getElementById('start-menu').classList.add('hidden');
        document.getElementById('game-ui').classList.remove('hidden');
        buildShop(game);
        game.init(selectedDiff, selectedMap);
    });

    setupGameUI(game);
});

function buildShop(game) {
    const el = document.getElementById('shop-list');
    el.innerHTML = '';
    const cats = {};
    for (let k in TOWER_DATA) {
        let t = TOWER_DATA[k];
        if (!cats[t.category]) cats[t.category] = [];
        cats[t.category].push({ key: k, ...t });
    }
    ['basic', 'elemental', 'support', 'farm', 'advanced', 'legendary'].forEach(cat => {
        if (!cats[cat]) return;
        let label = document.createElement('div');
        label.className = 'shop-cat';
        label.style.color = CATEGORY_COLORS[cat];
        label.textContent = CATEGORY_NAMES[cat];
        el.appendChild(label);
        cats[cat].forEach(t => {
            let btn = document.createElement('button');
            btn.className = 'tower-btn';
            btn.setAttribute('data-type', t.key);
            btn.setAttribute('data-cost', t.cost);
            btn.innerHTML = `<span class="t-icon">${t.icon}</span><span class="t-info"><span class="t-name">${t.name}</span><span class="t-cost">${t.cost}g</span></span>`;
            btn.title = t.description;
            el.appendChild(btn);
        });
    });
}

function setupGameUI(game) {
    document.getElementById('btn-start').addEventListener('click', () => game.startNextWave());
    document.getElementById('btn-skip').addEventListener('click', () => game.skipWave());
    document.getElementById('btn-auto').addEventListener('click', () => game.toggleAutoNext());
    document.getElementById('btn-restart').addEventListener('click', () => game.restart());

    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            game.setGameSpeed(parseInt(btn.getAttribute('data-speed')));
        });
    });

    document.getElementById('shop-list').addEventListener('click', (e) => {
        let btn = e.target.closest('.tower-btn');
        if (!btn) return;
        let type = btn.getAttribute('data-type'), cost = parseInt(btn.getAttribute('data-cost'));
        if (btn.classList.contains('selected')) {
            btn.classList.remove('selected');
            game.setPlacingTower(null, 0);
        } else {
            document.querySelectorAll('.tower-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            game.setPlacingTower(type, cost);
        }
        game.audio.playClick();
    });

    const canvas = document.getElementById('game-canvas');
    canvas.addEventListener('mousemove', (e) => {
        const r = canvas.getBoundingClientRect();
        game.setHoverPos((e.clientX - r.left) * (canvas.width / r.width), (e.clientY - r.top) * (canvas.height / r.height));
    });
    canvas.addEventListener('click', () => game.handleCanvasClick());
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        document.querySelectorAll('.tower-btn').forEach(b => b.classList.remove('selected'));
        game.setPlacingTower(null, 0);
        game.selectedTower = null;
    });

    document.getElementById('btn-upgrade').addEventListener('click', () => game.upgradeTower());
    document.getElementById('btn-sell').addEventListener('click', () => game.sellTower());

    document.querySelectorAll('.skill').forEach(btn => {
        btn.addEventListener('click', () => {
            if (game.skills.activate(btn.getAttribute('data-skill')))
                game.audio.playSkill();
        });
    });

    window.addEventListener('keydown', (e) => {
        let map = { '1': 'heal', '2': 'smite', '3': 'overclock', '4': 'blizzard' };
        if (map[e.key] && game.skills.activate(map[e.key])) game.audio.playSkill();
        if (e.key === 'Escape') {
            document.querySelectorAll('.tower-btn').forEach(b => b.classList.remove('selected'));
            game.setPlacingTower(null, 0); game.selectedTower = null;
        }
    });
}
