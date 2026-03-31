// ══════════════════════════════════════════════════════════════
// WAVE & ENEMY DATA + DIFFICULTY CONFIGS
// ══════════════════════════════════════════════════════════════

export const ENEMY_TYPES = {
    // Basic Troops
    scout:       { hp:30,   speed:120, radius:8,  color:'#ef9a9a', colorAlt:'#e57373', reward:7,  shape:'triangle', name:'Scout' },
    soldier:     { hp:80,   speed:70,  radius:12, color:'#e57373', colorAlt:'#c62828', reward:12, shape:'square',   name:'Soldier' },
    runner:      { hp:40,   speed:170, radius:8,  color:'#ce93d8', colorAlt:'#ab47bc', reward:10, shape:'diamond',  name:'Runner' },
    brute:       { hp:200,  speed:40,  radius:17, color:'#a1887f', colorAlt:'#6d4c41', reward:20, shape:'square',   name:'Brute' },
    swarm:       { hp:15,   speed:150, radius:6,  color:'#fff176', colorAlt:'#f9a825', reward:3,  shape:'circle',   name:'Swarm' },
    
    // Special Troops
    healer:      { hp:70,   speed:65,  radius:11, color:'#81c784', colorAlt:'#388e3c', reward:15, shape:'circle',   name:'Healer',  special:'healer' },
    shielded:    { hp:120,  speed:55,  radius:14, color:'#64b5f6', colorAlt:'#1565c0', reward:18, shape:'hexagon',  name:'Guard',   special:'shield' },
    shadow:      { hp:50,   speed:130, radius:9,  color:'#78909c', colorAlt:'#37474f', reward:14, shape:'triangle', name:'Shadow',  special:'stealth' },
    splitter:    { hp:100,  speed:60,  radius:14, color:'#ffb74d', colorAlt:'#e65100', reward:16, shape:'hexagon',  name:'Splitter', special:'split' },
    
    // New Advanced Troops
    tank:        { hp:350,  speed:30,  radius:20, color:'#5d4037', colorAlt:'#3e2723', reward:30, shape:'square',   name:'Tank', lifeDamage:2 },
    assassin:    { hp:25,   speed:220, radius:7,  color:'#212121', colorAlt:'#000000', reward:18, shape:'diamond',  name:'Assassin', special:'stealth' },
    necromancer: { hp:120,  speed:50,  radius:13, color:'#512da8', colorAlt:'#311b92', reward:25, shape:'hexagon',  name:'Necromancer', special:'summon_skel' },
    skeleton:    { hp:20,   speed:90,  radius:8,  color:'#e0e0e0', colorAlt:'#9e9e9e', reward:2,  shape:'triangle', name:'Skeleton' },
    berserker:   { hp:150,  speed:55,  radius:15, color:'#b71c1c', colorAlt:'#b71c1c', reward:22, shape:'circle',   name:'Berserker', special:'berserk' },
    regenerator: { hp:180,  speed:45,  radius:14, color:'#33691e', colorAlt:'#1b5e20', reward:22, shape:'square',   name:'Regenerator', special:'regen' },
    kamikaze:    { hp:40,   speed:160, radius:10, color:'#dd2c00', colorAlt:'#bf360c', reward:15, shape:'circle',   name:'Kamikaze', lifeDamage: 3 },
    golem:       { hp:600,  speed:25,  radius:22, color:'#424242', colorAlt:'#212121', reward:40, shape:'hexagon',  name:'Golem', special:'unyielding', lifeDamage:2 },

    // Bosses
    boss_warlord:     { hp:5000,  speed:28, radius:32, color:'#f44336', colorAlt:'#b71c1c', reward:300,  shape:'boss', name:'The Warlord',    special:'boss_stomp',  bossAbility:'stomp',  bossDesc:'Stomps every 5s, stunning towers', lifeDamage:10 },
    boss_lich:        { hp:4000,  speed:30, radius:30, color:'#7c4dff', colorAlt:'#311b92', reward:350,  shape:'boss', name:'The Lich King',  special:'boss_summon', bossAbility:'summon', bossDesc:'Summons scouts every 4s', lifeDamage:10 },
    boss_dragon:      { hp:8000,  speed:22, radius:38, color:'#ff6d00', colorAlt:'#e65100', reward:500,  shape:'boss', name:'Ancient Dragon', special:'boss_regen',  bossAbility:'regen',  bossDesc:'Regenerates 1% HP per second', lifeDamage:10 },
    boss_titan:       { hp:12000, speed:18, radius:42, color:'#ffd600', colorAlt:'#f57f17', reward:700,  shape:'boss', name:'The Titan',      special:'boss_aura',   bossAbility:'aura',   bossDesc:'Aura shields nearby enemies', lifeDamage:10 },
    boss_shadow_lord: { hp:15000, speed:25, radius:36, color:'#546e7a', colorAlt:'#263238', reward:1000, shape:'boss', name:'Shadow Lord',    special:'boss_phase',  bossAbility:'phase',  bossDesc:'Becomes invulnerable periodically', lifeDamage:20 }
};

export const BOSS_ROTATION = ['boss_warlord', 'boss_lich', 'boss_dragon', 'boss_titan', 'boss_shadow_lord'];

export const DIFFICULTIES = {
    easy:      { name: 'Easy',      desc: 'Relaxed pace, extra gold',      hpScale: 0.7,  speedScale: 0.8, goldScale: 1.4, startMoney: 700, startLives: 30, color: '#66bb6a' },
    normal:    { name: 'Normal',    desc: 'The intended experience',        hpScale: 1.0,  speedScale: 1.0, goldScale: 1.0, startMoney: 500, startLives: 20, color: '#42a5f5' },
    hard:      { name: 'Hard',      desc: 'Tougher enemies, less gold',     hpScale: 1.4,  speedScale: 1.1, goldScale: 0.8, startMoney: 400, startLives: 15, color: '#ffa726' },
    extreme:   { name: 'Extreme',   desc: 'Punishing. Every tower counts',  hpScale: 2.0,  speedScale: 1.2, goldScale: 0.65, startMoney: 350, startLives: 10, color: '#ef5350' },
    nightmare: { name: 'Nightmare', desc: 'Near impossible. Good luck.',     hpScale: 3.0,  speedScale: 1.35, goldScale: 0.5, startMoney: 300, startLives: 5,  color: '#ab47bc' }
};

export function generateWave(waveNum) {
    let groups = [];
    let basicTypes = ['scout', 'soldier', 'runner', 'swarm'];
    let specTypes = ['brute', 'healer', 'shielded', 'shadow', 'splitter', 'tank', 'assassin', 'necromancer', 'berserker', 'regenerator', 'kamikaze', 'golem'];

    // Boss Waves
    if (waveNum % 10 === 0) {
        let bossIdx = Math.floor((waveNum / 10 - 1) % BOSS_ROTATION.length);
        let bossType = BOSS_ROTATION[bossIdx];
        groups.push({ type: 'soldier', count: 6 + waveNum, interval: 300, delay: 0 });
        groups.push({ type: 'shielded', count: 3 + Math.floor(waveNum / 5), interval: 500, delay: 600 });
        groups.push({ type: 'tank', count: 2, interval: 800, delay: 1500 });
        groups.push({ type: bossType, count: 1, interval: 5000, delay: 2000 });
        let boss = ENEMY_TYPES[bossType];
        return { groups, isBoss: true, bossName: boss.name, bossType, bossDesc: boss.bossDesc };
    }

    // Swarm / Mini-boss waves
    if (waveNum % 5 === 0) {
        groups.push({ type: 'swarm', count: 20 + waveNum * 2, interval: 100, delay: 0 });
        groups.push({ type: 'kamikaze', count: 5 + Math.floor(waveNum / 5), interval: 200, delay: 500 });
        groups.push({ type: 'golem', count: 1 + Math.floor(waveNum / 10), interval: 2000, delay: 1000 });
        return { groups, isBoss: false, bossName: null };
    }

    // Normal waves mapping
    let mainType = basicTypes[waveNum % basicTypes.length];
    let baseCount = 8 + waveNum * 2;
    let interval = Math.max(120, 550 - waveNum * 8);

    groups.push({ type: mainType, count: baseCount, interval, delay: 0 });
    
    // Add special types based on wave progress to keep it varied
    if (waveNum > 2) {
        let spec1 = specTypes[waveNum % specTypes.length];
        groups.push({ type: spec1, count: Math.floor(baseCount * 0.3), interval: interval * 0.9, delay: 300 });
    }
    if (waveNum > 5) {
        let spec2 = specTypes[(waveNum * 2 + 1) % specTypes.length];
        groups.push({ type: spec2, count: Math.floor(baseCount * 0.2), interval: interval * 1.5, delay: 600 });
    }
    if (waveNum > 8) {
        let spec3 = specTypes[(waveNum * 3 + 2) % specTypes.length];
        groups.push({ type: spec3, count: Math.max(1, Math.floor(baseCount * 0.1)), interval: interval * 2, delay: 900 });
    }

    return { groups, isBoss: false, bossName: null };
}
