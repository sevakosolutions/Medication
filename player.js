/* ═══════════════════════════════════════════════════════════════
   PLAYER — Timer ring, affirmation cycling, TTS, controls
   ═══════════════════════════════════════════════════════════════ */

const Player = (() => {

  // DOM refs
  const modal       = document.getElementById('playerModal');
  const closeBtn    = document.getElementById('closePlayer');
  const titleEl     = document.getElementById('playerTitle');
  const subtitleEl  = document.getElementById('playerSubtitle');
  const crystalsEl  = document.getElementById('playerCrystals');
  const timerDisp   = document.getElementById('timerDisplay');
  const timerLabel  = document.getElementById('timerLabel');
  const ringFill    = document.getElementById('ringFill');
  const affCount    = document.getElementById('affirmCount');
  const affText     = document.getElementById('affirmText');
  const vizBox      = document.getElementById('visualizeBox');
  const playPause   = document.getElementById('playPause');
  const prevBtn     = document.getElementById('prevAffirm');
  const nextBtn     = document.getElementById('nextAffirm');
  const repeatBtn   = document.getElementById('repeatToggle');
  const progressFill = document.getElementById('progressFill');
  const progressLabel = document.getElementById('progressLabel');

  // State
  let session       = null;
  let totalSecs     = 0;
  let remainSecs    = 0;
  let timerInterval = null;
  let isPlaying     = false;
  let affIdx        = 0;
  let repeatCount   = 0;
  let repeatMax     = 21;
  let repeatMode    = true; // cycle through all affirmations 21 times
  let autoSpeak     = true;
  let speakTimeout  = null;

  /* ─── RING CIRCUMFERENCE ──────────────────────────────────── */
  const CIRC = 2 * Math.PI * 88;

  function setRing(fraction) {
    const offset = CIRC * (1 - fraction);
    ringFill.style.strokeDashoffset = offset;
    // Color shift: gold when ending
    if (fraction < 0.25) ringFill.style.stroke = '#c9a84c';
    else if (fraction < 0.5) ringFill.style.stroke = '#c4a0f0';
    else ringFill.style.stroke = '#9b72d0';
  }

  /* ─── FORMAT TIME ─────────────────────────────────────────── */
  function fmt(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  }

  /* ─── OPEN SESSION ────────────────────────────────────────── */
  function open(sess) {
    session = sess;
    totalSecs = sess.durationMins * 60;
    remainSecs = totalSecs;
    affIdx = 0;
    repeatCount = 0;
    repeatMax = sess.repeatCount || 21;
    isPlaying = false;

    // Populate
    titleEl.textContent = `${sess.emoji} ${sess.name}`;
    subtitleEl.textContent = sess.purpose || '';

    // Crystals
    crystalsEl.innerHTML = (sess.crystals || []).map(c =>
      `<span class="player-crystal">${c}</span>`
    ).join('');

    vizBox.textContent = sess.visualize ? `✨ Visualize: ${sess.visualize}` : '';

    renderAffirmation();
    updateTimer();
    setRing(1);

    // Start ambient sound for this session
    if (sess.sound && sess.sound !== 'none') {
      AudioEngine.playAmbient(sess.sound);
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  /* ─── RENDER AFFIRMATION ──────────────────────────────────── */
  function renderAffirmation() {
    if (!session || !session.affirmations.length) return;
    const affs = session.affirmations;
    const current = affs[affIdx % affs.length];
    const cycle = Math.floor(repeatCount / affs.length) + 1;
    affText.textContent = `"${current}"`;
    affCount.textContent = `${repeatCount + 1} of ${repeatMax} · Affirmation ${(affIdx % affs.length) + 1}/${affs.length} · Cycle ${cycle}`;

    // Animate
    affText.style.animation = 'none';
    void affText.offsetWidth;
    affText.style.animation = 'fadeText 0.5s ease';
  }

  /* ─── SPEAK CURRENT ───────────────────────────────────────── */
  function speakCurrent() {
    if (!session || !autoSpeak) return;
    const text = session.affirmations[affIdx % session.affirmations.length];
    AudioEngine.speak(text, () => {
      if (!isPlaying) return;
      // Auto-advance after a short pause
      clearTimeout(speakTimeout);
      speakTimeout = setTimeout(() => {
        if (isPlaying) advanceAffirmation();
      }, 1800);
    });
  }

  /* ─── ADVANCE AFFIRMATION ─────────────────────────────────── */
  function advanceAffirmation() {
    if (!session) return;
    repeatCount++;
    affIdx = (affIdx + 1) % session.affirmations.length;

    if (repeatCount >= repeatMax) {
      // Done
      complete();
      return;
    }

    renderAffirmation();
    speakCurrent();
    updateProgress();
  }

  /* ─── TIMER ───────────────────────────────────────────────── */
  function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (!isPlaying) return;
      if (remainSecs <= 0) { complete(); return; }
      remainSecs--;
      updateTimer();
      setRing(remainSecs / totalSecs);
    }, 1000);
  }

  function updateTimer() {
    timerDisp.textContent = fmt(remainSecs);
    timerLabel.textContent = remainSecs > 0 ? 'remaining' : 'complete';
  }

  function updateProgress() {
    const pct = session ? (repeatCount / repeatMax) * 100 : 0;
    progressFill.style.width = `${pct}%`;
    progressLabel.textContent = `${repeatCount} of ${repeatMax} affirmations`;
  }

  /* ─── PLAY / PAUSE ────────────────────────────────────────── */
  function togglePlay() {
    AudioEngine.resumeCtx();
    isPlaying = !isPlaying;
    playPause.textContent = isPlaying ? '⏸' : '▶';
    if (isPlaying) {
      startTimer();
      speakCurrent();
    } else {
      clearTimeout(speakTimeout);
      AudioEngine.stopSpeech();
    }
  }

  /* ─── COMPLETE ────────────────────────────────────────────── */
  function complete() {
    isPlaying = false;
    clearInterval(timerInterval);
    clearTimeout(speakTimeout);
    playPause.textContent = '▶';
    timerLabel.textContent = 'complete ✦';
    affText.textContent = '"The practice is complete. Rest in stillness."';
    affCount.textContent = '✦ Session Complete ✦';
    setRing(0);
    progressFill.style.width = '100%';
    AudioEngine.speak('The practice is complete. Rest in stillness.');
    showToast('Session complete ✦');
  }

  /* ─── CLOSE ───────────────────────────────────────────────── */
  function close() {
    isPlaying = false;
    clearInterval(timerInterval);
    clearTimeout(speakTimeout);
    AudioEngine.stopSpeech();
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    // Keep ambient going (user controls it separately)
  }

  /* ─── EVENTS ──────────────────────────────────────────────── */
  closeBtn.addEventListener('click', close);
  modal.querySelector('.modal-backdrop').addEventListener('click', close);

  playPause.addEventListener('click', togglePlay);

  nextBtn.addEventListener('click', () => {
    AudioEngine.stopSpeech();
    clearTimeout(speakTimeout);
    if (repeatCount < repeatMax - 1) {
      repeatCount++;
      affIdx = (affIdx + 1) % (session?.affirmations.length || 1);
      renderAffirmation();
      updateProgress();
      if (isPlaying) speakCurrent();
    }
  });

  prevBtn.addEventListener('click', () => {
    AudioEngine.stopSpeech();
    clearTimeout(speakTimeout);
    if (repeatCount > 0) {
      repeatCount--;
      affIdx = (affIdx - 1 + (session?.affirmations.length || 1)) % (session?.affirmations.length || 1);
      renderAffirmation();
      updateProgress();
      if (isPlaying) speakCurrent();
    }
  });

  repeatBtn.addEventListener('click', () => {
    autoSpeak = !autoSpeak;
    repeatBtn.classList.toggle('active', autoSpeak);
    showToast(autoSpeak ? 'Voice guidance on' : 'Voice guidance off');
  });

  // Init repeat btn state
  repeatBtn.classList.add('active');

  return { open, close };

})();
