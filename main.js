'use strict';

// ── Constants ────────────────────────────────────────────────
const STORAGE_KEY = 'calendar-events';
const DAYS  = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

// ── State ────────────────────────────────────────────────────
function getToday() { return new Date(); }
let currentYear  = getToday().getFullYear();
let currentMonth = getToday().getMonth();
let miniYear     = currentYear;
let miniMonth    = currentMonth;
let editingId    = null;
let events       = loadEvents();

// ── DOM refs ─────────────────────────────────────────────────
const monthTitle     = document.getElementById('month-title');
const calGrid        = document.getElementById('calendar-grid');
const miniGrid       = document.getElementById('mini-grid');
const miniMonthTitle = document.getElementById('mini-month-title');
const modal          = document.getElementById('event-modal');
const form           = document.getElementById('event-form');
const modalTitle     = document.getElementById('modal-heading');
const fTitle         = document.getElementById('f-title');
const fDate          = document.getElementById('f-date');
const fStart         = document.getElementById('f-start');
const fEnd           = document.getElementById('f-end');
const fDesc          = document.getElementById('f-desc');
const errTitle       = document.getElementById('err-title');
const errDate        = document.getElementById('err-date');
const errTime        = document.getElementById('err-time');
const btnDelete      = document.getElementById('btn-delete');
const btnCancel      = document.getElementById('btn-cancel');
const btnAdd         = document.getElementById('btn-add');
const btnPrev        = document.getElementById('btn-prev');
const btnNext        = document.getElementById('btn-next');
const btnToday       = document.getElementById('btn-today');
const btnModalClose  = document.getElementById('btn-modal-close');
const miniPrev       = document.getElementById('mini-prev');
const miniNext       = document.getElementById('mini-next');
const logoDay        = document.getElementById('logo-day');

// ── Storage ──────────────────────────────────────────────────
function loadEvents() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveEvents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}
function generateId() {
  return crypto.randomUUID ? crypto.randomUUID()
    : String(Date.now()) + Math.random().toString(36).slice(2);
}

// ── Helpers ──────────────────────────────────────────────────
function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function formatTime(t) {
  if (!t || !/^\d{2}:\d{2}$/.test(t)) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'pm' : 'am';
  return `${h % 12 || 12}:${String(m).padStart(2,'0')}${ampm}`;
}

// ── Render main calendar ─────────────────────────────────────
function renderCalendar() {
  const today = getToday();
  monthTitle.textContent = `${MONTHS[currentMonth]} ${currentYear}`;
  logoDay.textContent = today.getDate();
  calGrid.innerHTML = '';

  // DOW headers
  const DOW_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  DAYS.forEach((d, i) => {
    const h = document.createElement('div');
    h.className = 'dow-header';
    h.setAttribute('role', 'columnheader');
    h.setAttribute('aria-label', DOW_FULL[i]);
    h.textContent = d;
    calGrid.appendChild(h);
  });

  const firstDay    = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrev  = new Date(currentYear, currentMonth, 0).getDate();
  const todayStr    = formatDate(today);
  const totalCells  = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';

    let day, year, month, isCurrentMonth;
    if (i < firstDay) {
      day = daysInPrev - firstDay + i + 1;
      month = currentMonth === 0 ? 11 : currentMonth - 1;
      year  = currentMonth === 0 ? currentYear - 1 : currentYear;
      isCurrentMonth = false;
    } else if (i - firstDay < daysInMonth) {
      day = i - firstDay + 1;
      month = currentMonth;
      year  = currentYear;
      isCurrentMonth = true;
    } else {
      day = i - firstDay - daysInMonth + 1;
      month = currentMonth === 11 ? 0 : currentMonth + 1;
      year  = currentMonth === 11 ? currentYear + 1 : currentYear;
      isCurrentMonth = false;
    }

    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    cell.dataset.date = dateStr;
    cell.setAttribute('role', 'gridcell');
    cell.setAttribute('tabindex', '0');

    if (!isCurrentMonth) cell.classList.add('other-month');
    if (dateStr === todayStr) cell.classList.add('today');

    const numEl = document.createElement('div');
    numEl.className = 'day-num';
    numEl.textContent = day;
    cell.appendChild(numEl);

    const dayEvents = events
      .filter(e => e.date === dateStr)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

    const evCount = dayEvents.length;
    const cellLabel = `${MONTHS[month]} ${day}, ${year}${evCount ? `, ${evCount} event${evCount !== 1 ? 's' : ''}` : ''}`;
    cell.setAttribute('aria-label', cellLabel);

    const MAX_VISIBLE = 4;
    dayEvents.slice(0, MAX_VISIBLE).forEach(ev => {
      cell.appendChild(createChip(ev));
    });
    if (dayEvents.length > MAX_VISIBLE) {
      const more = document.createElement('div');
      more.className = 'more-events';
      more.textContent = `${dayEvents.length - MAX_VISIBLE} more`;
      more.setAttribute('tabindex', '0');
      more.setAttribute('role', 'button');
      more.setAttribute('aria-label', `${dayEvents.length - MAX_VISIBLE} more events on ${MONTHS[month]} ${day}`);
      more.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(dateStr); }
      });
      cell.appendChild(more);
    }

    cell.addEventListener('click', () => openModal(dateStr));
    cell.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(dateStr); }
    });
    calGrid.appendChild(cell);
  }

  renderMiniCalendar();
}

function createChip(ev) {
  const chip = document.createElement('button');
  chip.className = 'event-chip';
  chip.type = 'button';
  chip.dataset.id   = ev.id;
  chip.dataset.date = ev.date;
  chip.title = ev.title + (ev.startTime ? ` · ${formatTime(ev.startTime)}` : '');
  chip.setAttribute('aria-label', ev.title + (ev.startTime ? `, ${formatTime(ev.startTime)}` : ''));

  if (ev.startTime) {
    const dot = document.createElement('span');
    dot.className = 'chip-dot';
    chip.appendChild(dot);
    const timeEl = document.createElement('span');
    timeEl.className = 'chip-time';
    timeEl.textContent = formatTime(ev.startTime);
    chip.appendChild(timeEl);
  }
  const titleEl = document.createElement('span');
  titleEl.textContent = ev.title;
  chip.appendChild(titleEl);

  chip.addEventListener('click', e => {
    e.stopPropagation();
    openModal(ev.date, ev.id);
  });
  return chip;
}

// ── Mini calendar ────────────────────────────────────────────
function renderMiniCalendar() {
  miniMonthTitle.textContent = `${MONTHS[miniMonth]} ${miniYear}`;
  miniGrid.innerHTML = '';

  const today    = getToday();
  const todayStr = formatDate(today);
  const firstDay = new Date(miniYear, miniMonth, 1).getDay();
  const daysInMonth = new Date(miniYear, miniMonth + 1, 0).getDate();
  const daysInPrev  = new Date(miniYear, miniMonth, 0).getDate();

  for (let i = 0; i < 42; i++) {
    const el = document.createElement('div');
    el.className = 'mini-day';

    let day, year, month;
    if (i < firstDay) {
      day = daysInPrev - firstDay + i + 1;
      month = miniMonth === 0 ? 11 : miniMonth - 1;
      year  = miniMonth === 0 ? miniYear - 1 : miniYear;
      el.classList.add('other-month');
    } else if (i - firstDay < daysInMonth) {
      day = i - firstDay + 1;
      month = miniMonth; year = miniYear;
    } else {
      day = i - firstDay - daysInMonth + 1;
      month = miniMonth === 11 ? 0 : miniMonth + 1;
      year  = miniMonth === 11 ? miniYear + 1 : miniYear;
      el.classList.add('other-month');
    }

    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    el.textContent = day;
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', `Go to ${MONTHS[month]} ${day}, ${year}`);
    if (dateStr === todayStr) el.classList.add('today');

    // Highlight current main-calendar month
    const mainDateStr = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-01`;
    const cellMonthStr = `${year}-${String(month+1).padStart(2,'0')}-01`;
    if (cellMonthStr === mainDateStr && !el.classList.contains('other-month')) {
      el.classList.add('selected');
    }

    el.addEventListener('click', () => {
      currentYear  = year;
      currentMonth = month;
      renderCalendar();
    });
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        currentYear  = year;
        currentMonth = month;
        renderCalendar();
      }
    });
    miniGrid.appendChild(el);
  }
}

// ── Modal ────────────────────────────────────────────────────
function openModal(date, eventId = null) {
  clearErrors();
  editingId = eventId;

  if (eventId) {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;
    modalTitle.textContent = 'Edit event';
    fTitle.value = ev.title;
    fDate.value  = ev.date;
    fStart.value = ev.startTime || '';
    fEnd.value   = ev.endTime   || '';
    fDesc.value  = ev.description || '';
    btnDelete.hidden = false;
  } else {
    modalTitle.textContent = 'New event';
    form.reset();
    fDate.value = date;
    btnDelete.hidden = true;
  }

  modal.showModal();
  fTitle.focus();
}

function closeModal() {
  modal.close();
  editingId = null;
  clearErrors();
}

function clearErrors() {
  errTitle.textContent = '';
  errDate.textContent  = '';
  errTime.textContent  = '';
  fTitle.classList.remove('invalid');
}

// ── Validation ───────────────────────────────────────────────
function validate() {
  clearErrors();
  let valid = true;
  if (!fTitle.value.trim()) {
    errTitle.textContent = 'Title is required.';
    fTitle.classList.add('invalid');
    fTitle.focus();
    valid = false;
  }
  if (!fDate.value || isNaN(Date.parse(fDate.value))) {
    errDate.textContent = 'A valid date is required.';
    valid = false;
  }
  if (fStart.value && fEnd.value && fEnd.value <= fStart.value) {
    errTime.textContent = 'End time must be after start time.';
    valid = false;
  }
  return valid;
}

// ── CRUD ─────────────────────────────────────────────────────
function handleSubmit(e) {
  e.preventDefault();
  if (!validate()) return;

  const payload = {
    title:       fTitle.value.trim(),
    date:        fDate.value,
    startTime:   fStart.value || '',
    endTime:     fEnd.value   || '',
    description: fDesc.value.trim(),
  };

  if (editingId) {
    const idx = events.findIndex(ev => ev.id === editingId);
    if (idx !== -1) events[idx] = { ...events[idx], ...payload };
  } else {
    events.push({ id: generateId(), ...payload });
  }

  saveEvents();
  closeModal();
  renderCalendar();
}

function deleteEvent() {
  if (!editingId) return;
  if (!confirm('Delete this event?')) return;
  events = events.filter(ev => ev.id !== editingId);
  saveEvents();
  closeModal();
  renderCalendar();
}

// ── Event listeners ──────────────────────────────────────────
btnPrev.addEventListener('click', () => {
  if (currentMonth === 0) { currentMonth = 11; currentYear--; }
  else currentMonth--;
  miniMonth = currentMonth; miniYear = currentYear;
  renderCalendar();
});
btnNext.addEventListener('click', () => {
  if (currentMonth === 11) { currentMonth = 0; currentYear++; }
  else currentMonth++;
  miniMonth = currentMonth; miniYear = currentYear;
  renderCalendar();
});
btnToday.addEventListener('click', () => {
  const t = getToday();
  currentYear = t.getFullYear(); currentMonth = t.getMonth();
  miniYear = currentYear; miniMonth = currentMonth;
  renderCalendar();
});

miniPrev.addEventListener('click', e => {
  e.stopPropagation();
  if (miniMonth === 0) { miniMonth = 11; miniYear--; }
  else miniMonth--;
  renderMiniCalendar();
});
miniNext.addEventListener('click', e => {
  e.stopPropagation();
  if (miniMonth === 11) { miniMonth = 0; miniYear++; }
  else miniMonth++;
  renderMiniCalendar();
});

btnAdd.addEventListener('click', () => openModal(formatDate(getToday())));
btnCancel.addEventListener('click', closeModal);
btnModalClose.addEventListener('click', closeModal);
btnDelete.addEventListener('click', deleteEvent);
form.addEventListener('submit', handleSubmit);

modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

// ── Init ─────────────────────────────────────────────────────
renderCalendar();
