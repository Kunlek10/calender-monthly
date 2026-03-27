'use strict';

// ── Constants ────────────────────────────────────────────────
const STORAGE_KEY = 'calendar-events';
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

// ── State ────────────────────────────────────────────────────
const today = new Date();
let currentYear  = today.getFullYear();
let currentMonth = today.getMonth();   // 0-indexed
let editingId    = null;               // null = add mode
let events       = loadEvents();

// ── DOM refs ─────────────────────────────────────────────────
const monthTitle  = document.getElementById('month-title');
const calGrid     = document.getElementById('calendar-grid');
const modal       = document.getElementById('event-modal');
const form        = document.getElementById('event-form');
const modalTitle  = document.getElementById('modal-heading');
const fTitle      = document.getElementById('f-title');
const fDate       = document.getElementById('f-date');
const fStart      = document.getElementById('f-start');
const fEnd        = document.getElementById('f-end');
const fDesc       = document.getElementById('f-desc');
const errTitle    = document.getElementById('err-title');
const errDate     = document.getElementById('err-date');
const errTime     = document.getElementById('err-time');
const btnDelete   = document.getElementById('btn-delete');
const btnCancel   = document.getElementById('btn-cancel');
const btnAdd      = document.getElementById('btn-add');
const btnPrev     = document.getElementById('btn-prev');
const btnNext     = document.getElementById('btn-next');

// ── Storage ──────────────────────────────────────────────────
function loadEvents() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveEvents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function generateId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now()) + Math.random().toString(36).slice(2);
}

// ── Render calendar ──────────────────────────────────────────
function renderCalendar() {
  monthTitle.textContent = `${MONTHS[currentMonth]} ${currentYear}`;
  calGrid.innerHTML = '';

  // Day-of-week headers
  DAYS.forEach(d => {
    const h = document.createElement('div');
    h.className = 'dow-header';
    h.textContent = d;
    calGrid.appendChild(h);
  });

  const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrev  = new Date(currentYear, currentMonth, 0).getDate();

  const todayStr = formatDate(today);

  // Build 6-row grid (42 cells)
  for (let i = 0; i < 42; i++) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';

    let day, year, month, isCurrentMonth;

    if (i < firstDay) {
      // Leading days from previous month
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
      // Trailing days from next month
      day = i - firstDay - daysInMonth + 1;
      month = currentMonth === 11 ? 0 : currentMonth + 1;
      year  = currentMonth === 11 ? currentYear + 1 : currentYear;
      isCurrentMonth = false;
    }

    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

    if (!isCurrentMonth) cell.classList.add('other-month');
    if (dateStr === todayStr) cell.classList.add('today');

    // Day number
    const numEl = document.createElement('div');
    numEl.className = 'day-num';
    numEl.textContent = day;
    cell.appendChild(numEl);

    // Events for this day
    const dayEvents = events
      .filter(e => e.date === dateStr)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

    const MAX_VISIBLE = 3;
    dayEvents.slice(0, MAX_VISIBLE).forEach(ev => {
      const chip = createChip(ev);
      cell.appendChild(chip);
    });

    if (dayEvents.length > MAX_VISIBLE) {
      const more = document.createElement('div');
      more.className = 'more-events';
      more.textContent = `+${dayEvents.length - MAX_VISIBLE} more`;
      cell.appendChild(more);
    }

    // Click cell → add event on that date
    cell.addEventListener('click', () => openModal(dateStr));
    calGrid.appendChild(cell);
  }
}

function createChip(ev) {
  const chip = document.createElement('button');
  chip.className = 'event-chip';
  chip.type = 'button';
  chip.title = ev.title + (ev.startTime ? ` · ${ev.startTime}` : '');

  if (ev.startTime) {
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

// ── Modal ────────────────────────────────────────────────────
function openModal(date, eventId = null) {
  clearErrors();
  editingId = eventId;

  if (eventId) {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return;
    modalTitle.textContent = 'Edit Event';
    fTitle.value = ev.title;
    fDate.value  = ev.date;
    fStart.value = ev.startTime || '';
    fEnd.value   = ev.endTime   || '';
    fDesc.value  = ev.description || '';
    btnDelete.hidden = false;
  } else {
    modalTitle.textContent = 'Add Event';
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
  fDate.classList.remove('invalid');
  fStart.classList.remove('invalid');
  fEnd.classList.remove('invalid');
}

// ── Validation ───────────────────────────────────────────────
function validate() {
  clearErrors();
  let valid = true;

  const title = fTitle.value.trim();
  if (!title) {
    errTitle.textContent = 'Title is required.';
    fTitle.classList.add('invalid');
    valid = false;
  }

  const date = fDate.value;
  if (!date || isNaN(Date.parse(date))) {
    errDate.textContent = 'A valid date is required.';
    fDate.classList.add('invalid');
    valid = false;
  }

  const start = fStart.value;
  const end   = fEnd.value;
  if (start && end && end <= start) {
    errTime.textContent = 'End time must be after start time.';
    fStart.classList.add('invalid');
    fEnd.classList.add('invalid');
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
  events = events.filter(ev => ev.id !== editingId);
  saveEvents();
  closeModal();
  renderCalendar();
}

// ── Helpers ──────────────────────────────────────────────────
function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12  = h % 12 || 12;
  return `${h12}:${String(m).padStart(2,'0')}${ampm}`;
}

// ── Event listeners ──────────────────────────────────────────
btnPrev.addEventListener('click', () => {
  if (currentMonth === 0) { currentMonth = 11; currentYear--; }
  else currentMonth--;
  renderCalendar();
});

btnNext.addEventListener('click', () => {
  if (currentMonth === 11) { currentMonth = 0; currentYear++; }
  else currentMonth++;
  renderCalendar();
});

btnAdd.addEventListener('click', () => openModal(formatDate(today)));
btnCancel.addEventListener('click', closeModal);
btnDelete.addEventListener('click', deleteEvent);
form.addEventListener('submit', handleSubmit);

// Close on backdrop click
modal.addEventListener('click', e => {
  const rect = modal.getBoundingClientRect();
  const outside = e.clientX < rect.left || e.clientX > rect.right ||
                  e.clientY < rect.top  || e.clientY > rect.bottom;
  if (outside) closeModal();
});

// ── Init ─────────────────────────────────────────────────────
renderCalendar();
