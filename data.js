/* ═══════════════════════════════════════════════════════════════
   DATA — Default sessions, weekly focus, commute kit
   All stored in localStorage so users can edit and persist.
   ═══════════════════════════════════════════════════════════════ */

const DEFAULT_SESSIONS = [
  {
    id: 'morning',
    emoji: '🌞',
    name: 'Morning Ritual',
    purpose: 'Digestion · Nutrient Absorption · Energy · Healthy Weight Gain',
    durationMins: 10,
    sound: 'bowls',
    color: '#c9a84c',
    crystals: [
      '🔹 Clear Quartz — 8 chips (Left Hand)',
      '🟡 Citrine — 7 chips (Right Hand)'
    ],
    visualize: 'A warm golden light filling your stomach and abdomen, nourishing every cell.',
    affirmations: [
      'My digestive system works in perfect harmony.',
      'My body absorbs every nutrient with ease.',
      'My appetite improves naturally.',
      'My healthy weight returns steadily.',
      'Every cell in my body becomes stronger.',
      'My energy grows every day.',
      'I am healthy, strong, and full of vitality.'
    ],
    repeatCount: 21
  },
  {
    id: 'strength',
    emoji: '💪',
    name: 'Strength & Muscle Recovery',
    purpose: 'Physical Strength · Muscle Rebuilding · Stamina',
    durationMins: 7,
    sound: 'forest',
    color: '#c94c6a',
    crystals: [
      '🟥 Bloodstone — 1 cube',
      '🟠 Red Carnelian — 7 chips',
      '🟤 Tiger Eye — 7 chips'
    ],
    visualize: 'Red and golden light filling every muscle, rebuilding and strengthening.',
    affirmations: [
      'My muscles rebuild every day.',
      'My body gains healthy muscle naturally.',
      'My strength increases.',
      'My stamina improves.',
      'My body recovers quickly.',
      'I feel powerful and energetic.'
    ],
    repeatCount: 21
  },
  {
    id: 'healing',
    emoji: '💚',
    name: 'Neck, Back & Chest Healing',
    purpose: 'Physical Relief · Posture · Relaxation',
    durationMins: 5,
    sound: 'rain',
    color: '#4caf85',
    crystals: [
      '🟢 Green Jade — 7 chips',
      '🟣 Amethyst — 7 chips'
    ],
    visualize: 'A green healing light flowing through your chest, neck, shoulders, and upper back.',
    affirmations: [
      'My neck is relaxed.',
      'My shoulders are comfortable.',
      'My upper back feels free.',
      'My chest is open and relaxed.',
      'My posture improves naturally.',
      'My body feels light and comfortable.'
    ],
    repeatCount: 21
  },
  {
    id: 'evening',
    emoji: '🌙',
    name: 'Evening Grounding & Recovery',
    purpose: 'Stress Release · Deep Sleep · Organ Restoration',
    durationMins: 8,
    sound: 'ocean',
    color: '#4c82c9',
    crystals: [
      '⚫ Black Tourmaline — 7 chips',
      '⚫ Hematite — 1 cube',
      '🔹 Clear Quartz — 8 chips'
    ],
    visualize: 'Stress flowing out through your feet deep into the nourishing earth.',
    affirmations: [
      'I release all stress.',
      'My body heals while I sleep.',
      'Every organ restores itself.',
      'I wake refreshed.',
      'My energy grows stronger every day.'
    ],
    repeatCount: 21
  }
];

const DEFAULT_WEEKLY = [
  {
    day: 'Monday',
    crystals: ['🌈 Rainbow Moonstone — 7 chips', '🔹 Clear Quartz — 8 chips'],
    focus: 'Emotional balance and intuition.'
  },
  {
    day: 'Tuesday',
    crystals: ['🟥 Bloodstone — 1 cube', '🟠 Red Carnelian — 7 chips'],
    focus: 'Strength and recovery.'
  },
  {
    day: 'Wednesday',
    crystals: ['🟦 Fluorite — 7 chips', '🟤 Tiger Eye — 7 chips'],
    focus: 'Mental clarity and focus.'
  },
  {
    day: 'Thursday',
    crystals: ['🟡 Citrine — 7 chips', '🟢 Green Jade — 7 chips'],
    focus: 'Digestion and wellbeing.'
  },
  {
    day: 'Friday',
    crystals: ['🌸 Rose Quartz — 7 chips', '🟩 Green Aventurine — 7 chips'],
    focus: 'Emotional renewal and healing.'
  },
  {
    day: 'Saturday',
    crystals: ['⚫ Hematite — 1 cube', '⚫ Black Tourmaline — 7 chips'],
    focus: 'Grounding and stability.'
  },
  {
    day: 'Sunday',
    crystals: ['🔹 Clear Quartz — 8 chips', '🟣 Amethyst — 7 chips'],
    focus: 'Rest, reflection, and relaxation.'
  }
];

const DEFAULT_COMMUTE = {
  crystals: [
    '🟤 Tiger Eye — 3 chips',
    '🟥 Bloodstone — 1 cube',
    '⚫ Black Tourmaline — 3 chips',
    '🔹 Clear Quartz — 3 chips'
  ],
  affirmations: [
    'I am calm.',
    'I am strong.',
    'My body has the energy it needs.',
    'I remain grounded throughout the day.'
  ]
};

/* ─── DATA ACCESS LAYER ──────────────────────────────────────── */
const DB = {
  KEY_SESSIONS: 'cm_sessions_v2',
  KEY_WEEKLY:   'cm_weekly_v2',
  KEY_COMMUTE:  'cm_commute_v2',
  KEY_SETTINGS: 'cm_settings_v2',

  getSessions() {
    try {
      const raw = localStorage.getItem(this.KEY_SESSIONS);
      return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT_SESSIONS));
    } catch { return JSON.parse(JSON.stringify(DEFAULT_SESSIONS)); }
  },

  saveSessions(sessions) {
    localStorage.setItem(this.KEY_SESSIONS, JSON.stringify(sessions));
  },

  getWeekly() {
    try {
      const raw = localStorage.getItem(this.KEY_WEEKLY);
      return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT_WEEKLY));
    } catch { return JSON.parse(JSON.stringify(DEFAULT_WEEKLY)); }
  },

  saveWeekly(weekly) {
    localStorage.setItem(this.KEY_WEEKLY, JSON.stringify(weekly));
  },

  getCommute() {
    try {
      const raw = localStorage.getItem(this.KEY_COMMUTE);
      return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULT_COMMUTE));
    } catch { return JSON.parse(JSON.stringify(DEFAULT_COMMUTE)); }
  },

  saveCommute(data) {
    localStorage.setItem(this.KEY_COMMUTE, JSON.stringify(data));
  },

  getSettings() {
    const defaults = { rate: 0.85, pitch: 1.0, voiceIdx: 0, darkMode: true, autoAdvance: false, volume: 0.4, ambientSound: 'none' };
    try {
      const raw = localStorage.getItem(this.KEY_SETTINGS);
      return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
    } catch { return defaults; }
  },

  saveSettings(s) {
    localStorage.setItem(this.KEY_SETTINGS, JSON.stringify(s));
  },

  reset() {
    localStorage.removeItem(this.KEY_SESSIONS);
    localStorage.removeItem(this.KEY_WEEKLY);
    localStorage.removeItem(this.KEY_COMMUTE);
  },

  export() {
    return JSON.stringify({
      sessions: this.getSessions(),
      weekly:   this.getWeekly(),
      commute:  this.getCommute()
    }, null, 2);
  },

  import(json) {
    const d = JSON.parse(json);
    if (d.sessions) this.saveSessions(d.sessions);
    if (d.weekly)   this.saveWeekly(d.weekly);
    if (d.commute)  this.saveCommute(d.commute);
  }
};
