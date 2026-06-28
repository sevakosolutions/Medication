/* ═══════════════════════════════════════════════════════════════
   EDITOR — Edit/Add sessions, weekly focus, commute kit
   ═══════════════════════════════════════════════════════════════ */

const Editor = (() => {

  const modal     = document.getElementById('editModal');
  const closeBtn  = document.getElementById('closeEdit');
  const saveBtn   = document.getElementById('saveSession');
  const deleteBtn = document.getElementById('deleteSession');
  const backdrop  = modal.querySelector('.modal-backdrop');

  // Fields
  const fName       = document.getElementById('editName');
  const fEmoji      = document.getElementById('editEmoji');
  const fDuration   = document.getElementById('editDuration');
  const fPurpose    = document.getElementById('editPurpose');
  const fCrystals   = document.getElementById('editCrystals');
  const fVisualize  = document.getElementById('editVisualize');
  const fAffirm     = document.getElementById('editAffirmations');
  const fSound      = document.getElementById('editSound');

  let currentId     = null;
  let currentType   = 'session'; // 'session' | 'weekly' | 'commute'
  let weeklyIdx     = null;
  let onSaved       = null;

  /* ─── OPEN FOR SESSION ────────────────────────────────────── */
  function openSession(id, callback) {
    currentType = 'session';
    currentId   = id;
    onSaved     = callback;
    weeklyIdx   = null;

    const sessions = DB.getSessions();
    const isNew = !id;

    document.querySelector('.edit-title').textContent = isNew ? 'New Session' : 'Edit Session';
    deleteBtn.style.display = isNew ? 'none' : 'inline-block';

    if (isNew) {
      fName.value = '';
      fEmoji.value = '✨';
      fDuration.value = '10';
      fPurpose.value = '';
      fCrystals.value = '';
      fVisualize.value = '';
      fAffirm.value = '';
      fSound.value = 'bowls';
    } else {
      const sess = sessions.find(s => s.id === id);
      if (!sess) return;
      fName.value = sess.name || '';
      fEmoji.value = sess.emoji || '✨';
      fDuration.value = sess.durationMins || 10;
      fPurpose.value = sess.purpose || '';
      fCrystals.value = (sess.crystals || []).join('\n');
      fVisualize.value = sess.visualize || '';
      fAffirm.value = (sess.affirmations || []).join('\n');
      fSound.value = sess.sound || 'none';
    }

    show();
  }

  /* ─── OPEN FOR WEEKLY ─────────────────────────────────────── */
  function openWeekly(idx, callback) {
    currentType = 'weekly';
    currentId   = null;
    weeklyIdx   = idx;
    onSaved     = callback;

    const weekly = DB.getWeekly();
    const day = weekly[idx];

    document.querySelector('.edit-title').textContent = `Edit ${day.day}`;
    deleteBtn.style.display = 'none';

    fName.value = day.day;
    fEmoji.value = '📅';
    fDuration.value = '';
    fPurpose.value = day.focus || '';
    fCrystals.value = (day.crystals || []).join('\n');
    fVisualize.value = '';
    fAffirm.value = '';
    fSound.value = 'none';

    // Hide irrelevant fields
    fDuration.closest('label').style.display = 'none';
    fVisualize.closest('label').style.display = 'none';
    fAffirm.closest('label').style.display = 'none';
    fSound.closest('label').style.display = 'none';

    show();
  }

  /* ─── OPEN FOR COMMUTE ────────────────────────────────────── */
  function openCommute(callback) {
    currentType = 'commute';
    currentId   = null;
    weeklyIdx   = null;
    onSaved     = callback;

    const commute = DB.getCommute();

    document.querySelector('.edit-title').textContent = 'Edit Commute Kit';
    deleteBtn.style.display = 'none';

    fName.value = 'Commute Kit';
    fEmoji.value = '🚆';
    fDuration.value = '';
    fPurpose.value = '';
    fCrystals.value = (commute.crystals || []).join('\n');
    fVisualize.value = '';
    fAffirm.value = (commute.affirmations || []).join('\n');
    fSound.value = 'none';

    fDuration.closest('label').style.display = 'none';
    fPurpose.closest('label').style.display = 'none';
    fVisualize.closest('label').style.display = 'none';
    fSound.closest('label').style.display = 'none';

    show();
  }

  /* ─── SHOW / HIDE ─────────────────────────────────────────── */
  function show() {
    // Reset hidden fields
    fDuration.closest('label').style.display = '';
    fPurpose.closest('label').style.display = '';
    fVisualize.closest('label').style.display = '';
    fAffirm.closest('label').style.display = '';
    fSound.closest('label').style.display = '';

    // Then re-hide per type
    if (currentType === 'weekly') {
      fDuration.closest('label').style.display = 'none';
      fVisualize.closest('label').style.display = 'none';
      fAffirm.closest('label').style.display = 'none';
      fSound.closest('label').style.display = 'none';
    } else if (currentType === 'commute') {
      fDuration.closest('label').style.display = 'none';
      fPurpose.closest('label').style.display = 'none';
      fVisualize.closest('label').style.display = 'none';
      fSound.closest('label').style.display = 'none';
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    fName.focus();
  }

  function hide() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  /* ─── SAVE ────────────────────────────────────────────────── */
  function save() {
    if (currentType === 'session') saveSession();
    else if (currentType === 'weekly') saveWeekly();
    else if (currentType === 'commute') saveCommute();
  }

  function saveSession() {
    const sessions = DB.getSessions();
    const crystals = fCrystals.value.trim().split('\n').filter(Boolean);
    const affirmations = fAffirm.value.trim().split('\n').filter(Boolean);

    if (!fName.value.trim()) { showToast('Please enter a session name.'); return; }

    const sessionData = {
      id: currentId || `custom_${Date.now()}`,
      name: fName.value.trim(),
      emoji: fEmoji.value.trim() || '✨',
      durationMins: parseInt(fDuration.value) || 10,
      purpose: fPurpose.value.trim(),
      crystals,
      visualize: fVisualize.value.trim(),
      affirmations,
      sound: fSound.value,
      repeatCount: 21,
      color: '#9b72d0'
    };

    if (currentId) {
      const idx = sessions.findIndex(s => s.id === currentId);
      if (idx >= 0) sessions[idx] = sessionData;
    } else {
      sessions.push(sessionData);
    }

    DB.saveSessions(sessions);
    hide();
    showToast('Session saved ✦');
    if (onSaved) onSaved();
  }

  function saveWeekly() {
    const weekly = DB.getWeekly();
    const crystals = fCrystals.value.trim().split('\n').filter(Boolean);
    weekly[weeklyIdx] = {
      ...weekly[weeklyIdx],
      crystals,
      focus: fPurpose.value.trim()
    };
    DB.saveWeekly(weekly);
    hide();
    showToast('Weekly focus saved ✦');
    if (onSaved) onSaved();
  }

  function saveCommute() {
    const crystals = fCrystals.value.trim().split('\n').filter(Boolean);
    const affirmations = fAffirm.value.trim().split('\n').filter(Boolean);
    DB.saveCommute({ crystals, affirmations });
    hide();
    showToast('Commute kit saved ✦');
    if (onSaved) onSaved();
  }

  /* ─── DELETE ──────────────────────────────────────────────── */
  function deleteSession() {
    if (!currentId) return;
    Confirm.show(`Delete "${fName.value}"?`, () => {
      const sessions = DB.getSessions().filter(s => s.id !== currentId);
      DB.saveSessions(sessions);
      hide();
      showToast('Session deleted');
      if (onSaved) onSaved();
    });
  }

  /* ─── EVENTS ──────────────────────────────────────────────── */
  closeBtn.addEventListener('click', hide);
  backdrop.addEventListener('click', hide);
  saveBtn.addEventListener('click', save);
  deleteBtn.addEventListener('click', deleteSession);

  return { openSession, openWeekly, openCommute };
})();

/* ═══════════════════════════════════════════════════════════════
   CONFIRM DIALOG
   ═══════════════════════════════════════════════════════════════ */
const Confirm = (() => {
  const modal   = document.getElementById('confirmModal');
  const msg     = document.getElementById('confirmMsg');
  const yesBtn  = document.getElementById('confirmYes');
  const noBtn   = document.getElementById('confirmNo');
  const backdrop = modal.querySelector('.modal-backdrop');
  let cb = null;

  function show(message, callback) {
    msg.textContent = message;
    cb = callback;
    modal.classList.remove('hidden');
  }

  function hide() { modal.classList.add('hidden'); cb = null; }

  yesBtn.addEventListener('click', () => { hide(); if (cb) cb(); });
  noBtn.addEventListener('click', hide);
  backdrop.addEventListener('click', hide);

  return { show };
})();

/* ═══════════════════════════════════════════════════════════════
   TOAST HELPER
   ═══════════════════════════════════════════════════════════════ */
function showToast(msg, dur = 2500) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), dur);
}
