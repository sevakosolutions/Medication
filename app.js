/* ═══════════════════════════════════════════════════════════════
   APP — Navigation, rendering, settings, particle canvas
   ═══════════════════════════════════════════════════════════════ */

/* ─── NAVIGATION ──────────────────────────────────────────────── */
const views = {
  home:     document.getElementById('viewHome'),
  weekly:   document.getElementById('viewWeekly'),
  sessions: document.getElementById('viewSessions'),
  settings: document.getElementById('viewSettings')
};

function showView(name) {
  Object.values(views).forEach(v => v.classList.remove('active'));
  views[name]?.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  // Close mobile menu
  document.querySelector('.header-nav').classList.remove('open');
}

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => showView(btn.dataset.view));
});

// Mobile menu toggle
document.getElementById('menuToggle').addEventListener('click', () => {
  document.querySelector('.header-nav').classList.toggle('open');
});

/* ─── RENDER HOME ─────────────────────────────────────────────── */
function renderHome() {
  const sessions = DB.getSessions();
  const grid = document.getElementById('dailySessions');
  grid.innerHTML = '';

  sessions.forEach(sess => {
    const card = document.createElement('div');
    card.className = 'session-card';
    card.style.setProperty('--card-color', sess.color || '#9b72d0');

    card.innerHTML = `
      <div class="card-header">
        <span class="card-emoji">${sess.emoji}</span>
        <div class="card-meta">
          <div class="card-title">${sess.name}</div>
          <div class="card-purpose">${sess.purpose || ''}</div>
        </div>
        <button class="card-edit" data-id="${sess.id}" title="Edit">✏️</button>
      </div>
      <div class="card-duration">${sess.durationMins} min</div>
      <div class="card-crystals">
        ${(sess.crystals || []).slice(0,3).map(c => `<span class="crystal-tag">${c.split('—')[0].trim()}</span>`).join('')}
        ${sess.crystals?.length > 3 ? `<span class="crystal-tag">+${sess.crystals.length - 3}</span>` : ''}
      </div>
      <button class="start-btn">
        <span>Begin Practice</span>
        <span class="btn-arrow">→</span>
      </button>
    `;

    card.querySelector('.start-btn').addEventListener('click', () => {
      AudioEngine.resumeCtx();
      Player.open(sess);
    });
    card.querySelector('.card-edit').addEventListener('click', e => {
      e.stopPropagation();
      Editor.openSession(sess.id, () => { renderHome(); renderManage(); });
    });

    grid.appendChild(card);
  });

  renderCommute();
}

/* ─── RENDER COMMUTE ──────────────────────────────────────────── */
function renderCommute() {
  const commute = DB.getCommute();

  document.getElementById('commuteCrystals').innerHTML = commute.crystals.map(c =>
    `<span class="crystal-tag">${c}</span>`
  ).join('');

  document.getElementById('commuteAffirmations').innerHTML = commute.affirmations.map(a =>
    `<p>${a}</p>`
  ).join('');

  document.getElementById('startCommute').onclick = () => {
    AudioEngine.resumeCtx();
    Player.open({
      id: 'commute',
      emoji: '🚆',
      name: 'Office & Train Commute',
      purpose: 'Carry your pouch · 5 slow breaths',
      durationMins: 5,
      sound: 'none',
      crystals: commute.crystals,
      visualize: '',
      affirmations: commute.affirmations,
      repeatCount: 10
    });
  };

  document.querySelector('.commute-header .edit-btn').onclick = () => {
    Editor.openCommute(() => { renderHome(); });
  };
}

/* ─── RENDER WEEKLY ───────────────────────────────────────────── */
function renderWeekly() {
  const weekly = DB.getWeekly();
  const today = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
  const grid = document.getElementById('weeklyGrid');
  grid.innerHTML = '';

  weekly.forEach((day, idx) => {
    const card = document.createElement('div');
    card.className = 'weekly-card';
    const isToday = day.day === today;

    card.innerHTML = `
      <div class="weekly-day ${isToday ? 'today' : ''}">${day.day}</div>
      <div class="weekly-title">${(day.crystals || []).join(' · ').split('—')[0].trim()}</div>
      <div class="weekly-focus">${day.focus || ''}</div>
      <div class="card-crystals" style="margin-bottom:0.75rem">
        ${(day.crystals || []).map(c => `<span class="crystal-tag">${c.split('—')[0].trim()}</span>`).join('')}
      </div>
      <div style="display:flex;gap:0.5rem;align-items:center">
        <button class="weekly-start">Begin</button>
        <button class="weekly-edit">✏️</button>
      </div>
    `;

    card.querySelector('.weekly-start').addEventListener('click', () => {
      AudioEngine.resumeCtx();
      Player.open({
        id: `weekly_${day.day}`,
        emoji: '📅',
        name: `${day.day} — ${day.focus || 'Weekly Practice'}`,
        purpose: day.focus || '',
        durationMins: 10,
        sound: 'bowls',
        crystals: day.crystals,
        visualize: 'A calming light surrounding your entire being.',
        affirmations: [
          'I am in harmony with this day.',
          'My crystals support and guide me.',
          `I embrace the energy of ${day.day}.`,
          'I am grounded and present.',
          'Light flows through every part of me.',
          'I am peaceful and strong.'
        ],
        repeatCount: 7
      });
    });

    card.querySelector('.weekly-edit').addEventListener('click', () => {
      Editor.openWeekly(idx, renderWeekly);
    });

    grid.appendChild(card);
  });
}

/* ─── RENDER MANAGE ───────────────────────────────────────────── */
function renderManage() {
  const sessions = DB.getSessions();
  const list = document.getElementById('manageList');
  list.innerHTML = '';

  sessions.forEach(sess => {
    const item = document.createElement('div');
    item.className = 'manage-item';
    item.innerHTML = `
      <span class="mi-emoji">${sess.emoji}</span>
      <span class="mi-name">${sess.name}</span>
      <span class="mi-dur">${sess.durationMins}m</span>
      <button class="mi-edit">✏️ Edit</button>
    `;
    item.querySelector('.mi-edit').addEventListener('click', () => {
      Editor.openSession(sess.id, () => { renderHome(); renderManage(); });
    });
    list.appendChild(item);
  });
}

document.getElementById('addSessionBtn').addEventListener('click', () => {
  Editor.openSession(null, () => { renderHome(); renderManage(); });
});

/* ─── SETTINGS ────────────────────────────────────────────────── */
function initSettings() {
  const s = DB.getSettings();
  const voiceSelect   = document.getElementById('voiceSelect');
  const speechRate    = document.getElementById('speechRate');
  const speechRateVal = document.getElementById('speechRateVal');
  const speechPitch   = document.getElementById('speechPitch');
  const speechPitchVal= document.getElementById('speechPitchVal');

  // Voice list (load after user interaction)
  function populateVoices() {
    const voices = AudioEngine.voices;
    voiceSelect.innerHTML = voices.map((v,i) =>
      `<option value="${i}" ${i===s.voiceIdx?'selected':''}>${v.name} (${v.lang})</option>`
    ).join('');
    if (!voiceSelect.innerHTML) voiceSelect.innerHTML = '<option value="0">Default Voice</option>';
  }
  populateVoices();
  setTimeout(populateVoices, 1000); // voices may load asynchronously

  speechRate.value = s.rate;
  speechRateVal.textContent = `${s.rate}×`;
  speechPitch.value = s.pitch;
  speechPitchVal.textContent = s.pitch;

  speechRate.addEventListener('input', () => {
    speechRateVal.textContent = `${speechRate.value}×`;
    saveSettings();
  });
  speechPitch.addEventListener('input', () => {
    speechPitchVal.textContent = speechPitch.value;
    saveSettings();
  });
  voiceSelect.addEventListener('change', saveSettings);

  function saveSettings() {
    const updated = {
      rate: parseFloat(speechRate.value),
      pitch: parseFloat(speechPitch.value),
      voiceIdx: parseInt(voiceSelect.value) || 0,
      darkMode: document.getElementById('darkModeToggle').checked,
      autoAdvance: document.getElementById('autoAdvance').checked,
      volume: parseFloat(document.getElementById('volSlider').value),
      ambientSound: AudioEngine.currentSound
    };
    DB.saveSettings(updated);
    AudioEngine.setTTS({ rate: updated.rate, pitch: updated.pitch, voiceIdx: updated.voiceIdx });
  }

  document.getElementById('testVoice').addEventListener('click', () => {
    AudioEngine.resumeCtx();
    AudioEngine.speak('My body is healing. I am strong and full of vitality.');
  });

  // Dark mode
  const darkToggle = document.getElementById('darkModeToggle');
  darkToggle.checked = s.darkMode !== false;
  applyDarkMode(darkToggle.checked);
  darkToggle.addEventListener('change', () => {
    applyDarkMode(darkToggle.checked);
    saveSettings();
  });

  document.getElementById('autoAdvance').checked = s.autoAdvance || false;
  document.getElementById('autoAdvance').addEventListener('change', saveSettings);

  // Volume
  const volSlider = document.getElementById('volSlider');
  volSlider.value = s.volume ?? 0.4;
  AudioEngine.setVolume(parseFloat(volSlider.value));
  volSlider.addEventListener('input', () => {
    AudioEngine.setVolume(parseFloat(volSlider.value));
    saveSettings();
  });

  // TTS settings from saved
  AudioEngine.setTTS({ rate: s.rate, pitch: s.pitch, voiceIdx: s.voiceIdx });

  // Custom audio upload
  document.getElementById('customAudioUpload').addEventListener('change', e => {
    const files = [...e.target.files];
    const container = document.getElementById('uploadedFiles');
    files.forEach(f => {
      const chip = document.createElement('span');
      chip.className = 'audio-chip';
      chip.textContent = `🎵 ${f.name}`;
      container.appendChild(chip);
    });
    showToast(`${files.length} audio file(s) uploaded`);
  });

  // Export
  document.getElementById('exportData').addEventListener('click', () => {
    const json = DB.export();
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'crystal-healing-sessions.json';
    a.click();
  });

  // Import
  document.getElementById('importDataBtn').addEventListener('click', () => {
    document.getElementById('importDataFile').click();
  });
  document.getElementById('importDataFile').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        DB.import(ev.target.result);
        renderAll();
        showToast('Sessions imported ✦');
      } catch {
        showToast('Import failed — invalid file');
      }
    };
    reader.readAsText(file);
  });

  // Reset
  document.getElementById('resetData').addEventListener('click', () => {
    Confirm.show('Reset all sessions to defaults? This cannot be undone.', () => {
      DB.reset();
      renderAll();
      showToast('Reset to defaults ✦');
    });
  });
}

function applyDarkMode(on) {
  document.body.classList.toggle('light', !on);
}

/* ─── AMBIENT SOUND CHIPS ─────────────────────────────────────── */
function initAmbientBar() {
  const s = DB.getSettings();
  const chips = document.querySelectorAll('.sound-chip');

  // Set saved state
  chips.forEach(chip => {
    chip.classList.toggle('active', chip.dataset.sound === (s.ambientSound || 'none'));
  });

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      AudioEngine.resumeCtx();
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      AudioEngine.playAmbient(chip.dataset.sound);
      const saved = DB.getSettings();
      saved.ambientSound = chip.dataset.sound;
      DB.saveSettings(saved);
    });
  });

  const vol = document.getElementById('volSlider');
  vol.addEventListener('input', () => {
    AudioEngine.setVolume(parseFloat(vol.value));
  });
}

/* ─── PARTICLE CANVAS ─────────────────────────────────────────── */
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles;

  const COLORS = ['#9b72d0','#c9a84c','#4caf85','#d07899','#c4a0f0','#c94c6a'];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.r = 0.4 + Math.random() * 2;
      this.alpha = 0.05 + Math.random() * 0.3;
      this.vx = (Math.random() - 0.5) * 0.25;
      this.vy = -0.1 - Math.random() * 0.4;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.life = 0;
      this.maxLife = 200 + Math.random() * 400;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      if (this.life > this.maxLife || this.y < -10) this.reset();
    }
    draw() {
      const progress = this.life / this.maxLife;
      const a = this.alpha * (progress < 0.1 ? progress / 0.1 : progress > 0.9 ? (1 - progress) / 0.1 : 1);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = a;
      ctx.fill();
    }
  }

  particles = Array.from({ length: 80 }, () => new Particle());

  function animate() {
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
}

/* ─── RENDER ALL ──────────────────────────────────────────────── */
function renderAll() {
  renderHome();
  renderWeekly();
  renderManage();
}

/* ─── INIT ────────────────────────────────────────────────────── */
(function init() {
  AudioEngine.init();
  initParticles();
  initSettings();
  initAmbientBar();
  renderAll();

  // Show home
  showView('home');
})();
