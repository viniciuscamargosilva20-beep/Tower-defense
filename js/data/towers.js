// ══════════════════════════════════════════════════════════════
// TOWER DATA — Expanded Arsenal!
// ══════════════════════════════════════════════════════════════

export const TOWER_DATA = {
    // ─── BASIC ──────────────────────────────────────────
    archer: {
        name: 'Archer Tower', category: 'basic', cost: 70,
        range: 160, damage: 12, fireRate: 400, projSpeed: 800,
        color: '#4CAF50', projColor: '#81C784',
        description: 'Balanced single-target tower. Reliable early game.',
        icon: '🏹',
        upgradeCost: [50, 120, 250],
        upgradeNames: ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.MAX'],
        special: null, isAoe: false, aoeRadius: 0
    },
    crossbow: {
        name: 'Crossbow Fort', category: 'basic', cost: 120,
        range: 200, damage: 35, fireRate: 900, projSpeed: 1200,
        color: '#8D6E63', projColor: '#A1887F',
        description: 'Long range, high damage. Slow reload.',
        icon: '🎯',
        upgradeCost: [80, 180, 350],
        upgradeNames: ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.MAX'],
        special: null, isAoe: false, aoeRadius: 0
    },
    barracks: {
        name: 'Barracks', category: 'basic', cost: 100,
        range: 120, damage: 8, fireRate: 200, projSpeed: 700,
        color: '#FF7043', projColor: '#FF8A65',
        description: 'Rapid fire, low damage. Great against swarms.',
        icon: '⚔️',
        upgradeCost: [70, 150, 300],
        upgradeNames: ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.MAX'],
        special: null, isAoe: false, aoeRadius: 0
    },
    cannon: {
        name: 'Cannon Tower', category: 'basic', cost: 150,
        range: 140, damage: 60, fireRate: 1800, projSpeed: 500,
        color: '#78909C', projColor: '#90A4AE',
        description: 'Explosive AOE shells. Slow but devastating.',
        icon: '💣',
        upgradeCost: [100, 220, 450],
        upgradeNames: ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.MAX'],
        special: null, isAoe: true, aoeRadius: 70
    },
    sniper: {
        name: 'Sniper Nest', category: 'basic', cost: 180,
        range: 350, damage: 160, fireRate: 2500, projSpeed: 2000,
        color: '#5D4037', projColor: '#795548',
        description: 'Extreme range and massive damage. Very slow.',
        icon: '🔭',
        upgradeCost: [130, 260, 520],
        upgradeNames: ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.MAX'],
        special: null, isAoe: false, aoeRadius: 0
    },

    // ─── ELEMENTAL ──────────────────────────────────────
    frost_tower: {
        name: 'Frost Tower', category: 'elemental', cost: 130,
        range: 150, damage: 8, fireRate: 500, projSpeed: 600,
        color: '#4FC3F7', projColor: '#81D4FA',
        description: 'Slows enemies significantly. Low damage.',
        icon: '❄️',
        upgradeCost: [90, 200, 400],
        upgradeNames: ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.MAX'],
        special: 'slow', isAoe: false, aoeRadius: 0
    },
    flame_tower: {
        name: 'Flame Tower', category: 'elemental', cost: 160,
        range: 130, damage: 15, fireRate: 600, projSpeed: 500,
        color: '#FF5722', projColor: '#FF7043',
        description: 'Burn damage over time. Melts tough enemies.',
        icon: '🔥',
        upgradeCost: [110, 240, 480],
        upgradeNames: ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.MAX'],
        special: 'burn', isAoe: false, aoeRadius: 0
    },
    lightning_spire: {
        name: 'Lightning Spire', category: 'elemental', cost: 220,
        range: 170, damage: 28, fireRate: 400, projSpeed: 0,
        color: '#FFC107', projColor: '#FFD54F',
        description: 'Instant chain lightning. Hits up to 3 targets.',
        icon: '⚡',
        upgradeCost: [160, 320, 600],
        upgradeNames: ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.MAX'],
        special: 'tesla', isAoe: false, aoeRadius: 0
    },
    poison_tower: {
        name: 'Poison Tower', category: 'elemental', cost: 140,
        range: 140, damage: 10, fireRate: 800, projSpeed: 400,
        color: '#66BB6A', projColor: '#81C784',
        description: 'Poison stacks. Enemies take increasing damage.',
        icon: '☠️',
        upgradeCost: [100, 210, 420],
        upgradeNames: ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.MAX'],
        special: 'poison', isAoe: true, aoeRadius: 60
    },
    quake_totem: {
        name: 'Quake Totem', category: 'elemental', cost: 200,
        range: 110, damage: 45, fireRate: 1500, projSpeed: 0,
        color: '#795548', projColor: 'transparent',
        description: 'Pounds the ground, damaging and slowing nearby enemies.',
        icon: '🌋',
        upgradeCost: [150, 300, 600],
        upgradeNames: ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.MAX'],
        special: 'quake', isAoe: true, aoeRadius: 110
    },

    // ─── SUPPORT ────────────────────────────────────────
    war_drum: {
        name: 'War Drum', category: 'support', cost: 250,
        range: 180, damage: 0, fireRate: 0, projSpeed: 0,
        color: '#CE93D8', projColor: '#CE93D8',
        description: 'Boosts nearby tower damage by 25%.',
        icon: '🥁',
        upgradeCost: [180, 350, 650],
        upgradeNames: ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.MAX'],
        special: 'buff_damage', isAoe: false, aoeRadius: 0
    },
    beacon: {
        name: 'Speed Beacon', category: 'support', cost: 230,
        range: 170, damage: 0, fireRate: 0, projSpeed: 0,
        color: '#4DD0E1', projColor: '#4DD0E1',
        description: 'Increases nearby tower fire rate by 30%.',
        icon: '📡',
        upgradeCost: [170, 330, 600],
        upgradeNames: ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.MAX'],
        special: 'buff_speed', isAoe: false, aoeRadius: 0
    },
    radar: {
        name: 'Radar Station', category: 'support', cost: 200,
        range: 250, damage: 0, fireRate: 500, projSpeed: 0,
        color: '#B0BEC5', projColor: 'transparent',
        description: 'Reveals stealth enemies in a huge radius.',
        icon: '👀',
        upgradeCost: [150, 250, 450],
        upgradeNames: ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.MAX'],
        special: 'radar', isAoe: false, aoeRadius: 0
    },

    // ─── ECONOMY / FARM ─────────────────────────────────
    gold_mine: {
        name: 'Gold Mine', category: 'farm', cost: 250,
        range: 0, damage: 0, fireRate: 4000, projSpeed: 0,
        color: '#FFD700', projColor: '#FFD700',
        description: 'Generates gold passively every 4 seconds.',
        icon: '💰',
        upgradeCost: [200, 400, 700],
        upgradeNames: ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.MAX'],
        special: 'gold_passive', isAoe: false, aoeRadius: 0
    },
    trading_post: {
        name: 'Trading Post', category: 'farm', cost: 200,
        range: 0, damage: 0, fireRate: 0, projSpeed: 0,
        color: '#A5D6A7', projColor: '#A5D6A7',
        description: 'Earns bonus gold when each wave is cleared.',
        icon: '🏪',
        upgradeCost: [150, 300, 550],
        upgradeNames: ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.MAX'],
        special: 'gold_wave', isAoe: false, aoeRadius: 0
    },
    bounty_hunter: {
        name: 'Bounty Hunter', category: 'farm', cost: 280,
        range: 200, damage: 10, fireRate: 600, projSpeed: 650,
        color: '#FFAB40', projColor: '#FFD180',
        description: 'Low damage but kills in range give +50% gold.',
        icon: '🗡️',
        upgradeCost: [200, 400, 700],
        upgradeNames: ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.MAX'],
        special: 'bounty', isAoe: false, aoeRadius: 0
    },

    // ─── ADVANCED ───────────────────────────────────────
    multishot_tower: {
        name: 'Multishot Tower', category: 'advanced', cost: 350,
        range: 180, damage: 18, fireRate: 300, projSpeed: 800,
        color: '#7E57C2', projColor: '#9575CD',
        description: 'Fires at multiple enemies simultaneously.',
        icon: '🌀',
        upgradeCost: [250, 500, 900],
        upgradeNames: ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.MAX'],
        special: 'multishot', isAoe: false, aoeRadius: 0
    },
    vortex_tower: {
        name: 'Vortex Tower', category: 'advanced', cost: 500,
        range: 150, damage: 5, fireRate: 200, projSpeed: 0,
        color: '#5C6BC0', projColor: '#7986CB',
        description: 'Pulls enemies inward, slowing and damaging them.',
        icon: '🌊',
        upgradeCost: [400, 800, 1400],
        upgradeNames: ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.MAX'],
        special: 'blackhole', isAoe: true, aoeRadius: 130
    },
    missile_silo: {
        name: 'Missile Silo', category: 'advanced', cost: 600,
        range: 9999, damage: 180, fireRate: 4000, projSpeed: 300,
        color: '#455A64', projColor: '#CFD8DC',
        description: 'Global range. Launches devastating AOE missiles.',
        icon: '🚀',
        upgradeCost: [400, 800, 1500],
        upgradeNames: ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.MAX'],
        special: null, isAoe: true, aoeRadius: 100
    },

    // ─── LEGENDARY ──────────────────────────────────────
    chrono_shifter: {
        name: 'Chrono Shifter', category: 'legendary', cost: 1200,
        range: 180, damage: 0, fireRate: 3000, projSpeed: 0,
        color: '#9C27B0', projColor: 'transparent',
        description: 'Freezes time for all enemies in range periodically.',
        icon: '⏳',
        upgradeCost: [800, 1600, 2500],
        upgradeNames: ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.MAX'],
        special: 'chrono', isAoe: true, aoeRadius: 180
    },
    solar_beam: {
        name: 'Solar Beam', category: 'legendary', cost: 1000,
        range: 300, damage: 4, fireRate: 25, projSpeed: 0,
        color: '#FFEE58', projColor: '#FFF59D',
        description: 'Continuous beam of light. Insane sustained DPS.',
        icon: '☀️',
        upgradeCost: [800, 1600, 2800],
        upgradeNames: ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.MAX'],
        special: 'beam', isAoe: false, aoeRadius: 0
    },
    royal_guard: {
        name: 'Royal Guard', category: 'legendary', cost: 1500,
        range: 250, damage: 400, fireRate: 3500, projSpeed: 600,
        color: '#EF5350', projColor: '#EF9A9A',
        description: 'The ultimate tower. Extreme AOE devastation.',
        icon: '👑',
        upgradeCost: [1100, 2200, 4000],
        upgradeNames: ['Lv.1', 'Lv.2', 'Lv.3', 'Lv.MAX'],
        special: null, isAoe: true, aoeRadius: 100
    }
};

export const CATEGORY_COLORS = {
    basic:      '#78909C',
    elemental:  '#4FC3F7',
    support:    '#B0BEC5',
    farm:       '#FFD700',
    advanced:   '#7E57C2',
    legendary:  '#EF5350'
};

export const CATEGORY_NAMES = {
    basic:      'Basic',
    elemental:  'Elemental',
    support:    'Support',
    farm:       'Economy',
    advanced:   'Advanced',
    legendary:  'Legendary'
};
