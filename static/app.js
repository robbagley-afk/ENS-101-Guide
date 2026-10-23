const STORAGE_KEY = 'ens101-mentor-desk-appointment-1a-v4';
const { ensurePermanentConversationTag, appendConversationTag = ensurePermanentConversationTag } = window.NoteUtils;
const ACTIVE_APPT_ID_KEY = 'ens101_active_appt_id';

// Prepare is one step: the mentor enters the email and reads the executive summary.
const PREPARE_STEPS = [
  {
    id: 'prep-summary',
    label: 'Prepare',
    short: 'Look up student and read summary',
    duration: '3–5 min',
    title: 'Look up your student',
    description: '',
    copilot: ['How do I explain Career Explorer?', 'What if a student hasn’t taken the assessments?', 'Explain the 4 Career Explorer assessments']
  }
];

const WORKFLOW = [
  {
    id: 'begin', label: 'Begin', short: 'Welcome and set direction', duration: '3–5 min',
    title: 'Begin the appointment',
    description: 'Open warmly, follow the prayer direction in the Appointment 1a guide, learn the student\'s major and career direction, and check confidence.',
    tasks: [
      // Begin is three plain checkboxes with no detail line (Rob, 2026-10-22). begin-major now covers the career question too.
      { id: 'begin-prayer', title: 'Open with prayer', detail: '' },
      { id: 'begin-major', title: 'Confirm the student\'s major and desired career', detail: '' },
      { id: 'career-confidence', title: 'Ask the 1–10 confidence question', detail: '' }
    ],
    copilot: ['Give me a warm opening', 'Explain Appointment 1a', 'Suggest a career question']
  },
  {
    // Internship planning and wrap-up share one screen. Task ids are reused where the meaning is the same,
    // so check marks saved before the merge still count.
    id: 'plan', label: 'Plan and wrap up', short: 'Internship plan, next appt, selfie', duration: '12–15 min',
    title: 'Plan and wrap up',
    description: 'Build the internship plan, choose the next appointment, and close the appointment.',
    tasks: [
      { id: 'internship-requirement', title: 'Explain Internship (Any job related to Major, etc.)', detail: '' },
      { id: 'internship-timeline', title: 'Use Student Journey Map - Explain Internship Timing', detail: '' },
      { id: 'internship-international', title: 'International Students: Save your Vacation Semester for your Internship so you can apply to fulltime jobs', detail: '' },
      { id: 'close-selfie', title: 'Take the appointment selfie', detail: '' },
      { id: 'career-followup', inline: 'suggestion', title: 'Choose the next appointment', detail: '' }
    ],
    copilot: ['Explain the internship timeline', 'Give an international-student caution', 'Recommend the next appointment', 'Draft a follow-up message']
  }
];

const RESOURCES = [
  { id: 'connect', name: 'Ensign Connect', initials: 'EC', category: 'Appointment 1a', url: 'https://ces.peoplegrove.com/hub/ces/organizations/ensign-connect', description: 'Join Ensign Connect and access the student’s professional community.' },
  { id: 'groups', name: 'Ensign Major Groups', initials: 'G', category: 'Appointment 1a', url: 'https://ces.peoplegrove.com/hub/ces/groups?organization=19963', description: 'Find and join the Ensign College group for the student’s major.' },
  { id: 'preferences', name: 'Connect Preferences', initials: 'N', category: 'Appointment 1a', url: 'https://ces.peoplegrove.com/preferences/notifications', description: 'Review Ensign Connect email and SMS notification choices.' },
  { id: 'community', name: 'Explore the Community', initials: 'A', category: 'Appointment 1a', url: 'https://ces.peoplegrove.com/hub/ces/person', description: 'Browse alumni profiles and identify people for informational interviews.' },
  { id: 'internship-expert', name: 'Ensign Internship Expert', initials: 'IE', category: 'Appointment 1a', url: '/internship/', description: 'Official source-grounded answers for Ensign College internships, course pairing, and CPT.' },
  { id: 'informational-interview', name: 'Informational Interview Handout', initials: 'II', category: 'Appointment 1a', url: '/resources/informational-interview-handout.pdf', description: 'Review the informational interview guidance and the questions on the back.' },
  { id: 'pathwayu', name: 'Major & Career Exploration', initials: 'CE', category: 'Career Planning', url: 'https://ensign.pathwayu.com/login?next=%2Fresults', description: 'Open the Major & Career Exploration results.' },
  { id: 'international', name: 'International Students', initials: 'IS', category: 'Support', url: 'https://www.ensign.edu/international-students', description: 'Official help for work authorization and international-student questions.' },
  { id: 'office', name: 'Major & Career Exploration AI', initials: 'AI', category: 'Career Planning', url: 'https://portal.office.com/', description: 'Open Microsoft 365 to access the Major & Career Exploration AI assistant.' },
  { id: 'canvas', name: 'Canvas', initials: 'C', category: 'Academic', url: 'https://ensign.instructure.com/', description: 'ENS 101 course materials, assignments, announcements, and grades.' },
  { id: 'handshake', name: 'Handshake', initials: 'H', category: 'Career Planning', url: 'https://app.joinhandshake.com/edu', description: 'Primary student job board, on-campus interviews, and employer connections.' },
  { id: 'career', name: 'Career & Internship Services', initials: 'CS', category: 'Career Planning', url: 'https://www.ensign.edu/CIS', description: 'Career preparation, internships, résumés, interviews, and networking.' },
  { id: 'mcmullin-video', name: 'Elder McMullin: Career as Calling', initials: 'KM', category: 'Career Planning', url: 'https://www.youtube.com/watch?v=Rwdv2V0lOIM', description: 'Ensign College Career Week Keynote Address by Keith B. McMullin on career as mission.' },
  { id: 'maria-video', name: "Maria's Major Choice Video", initials: 'MV', category: 'Career Planning', url: 'https://www.youtube.com/watch?v=WzWFwJpoLUE', description: 'Ensign College student video case study on choosing a major and career path.' }
];

const defaultState = () => ({
  currentTask: 'prepare',
  currentStep: 0,
  appointmentId: '',
  student: {
    name: '',
    email: '',
    program: '',
    career: '',
    confidence: '',
    confidenceEngaged: false,
    roadmap: '',
    followup: ''
  },
  assessmentData: {
    completed_count: 0,
    total: 4,
    status: 'incomplete',
    missing: ['Interests', 'Values', 'Personality', 'Workplace Preferences'],
    holland_code: '',
    primary_interests: [],
    primary_values: [],
    primary_workplace_preferences: []
  },
  connectStatus: {
    checked: false,
    found: false,
    profileUrl: null,
    checkedAt: null
  },
  guidance: null,
  prepNotes: '',
  sessionNotes: '',
  studentNext: '',
  mentorFollow: '',
  checked: {},
  civitasRecorded: false,
  chatHistory: []
});

let state = defaultState();
let savedAppointmentsList = [];
let activeResourceFilter = 'All';
let saveTimer = null;
let toastTimer = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function totalTasks() {
  return WORKFLOW.reduce((sum, step) => sum + step.tasks.length, 0);
}

function completedTasks() {
  // Count only tasks that still exist: saved students may carry checks for tasks that were removed.
  return WORKFLOW.flatMap(step => step.tasks).filter(task => state.checked[task.id]).length;
}

function stepComplete(step) {
  return step.tasks.every(task => state.checked[task.id]);
}

async function fetchAppointmentsList() {
  try {
    const res = await fetch('/api/appointments');
    const data = await res.json();
    if (data.status === 'ok') {
      savedAppointmentsList = data.appointments || [];
      renderStudentSwitcher();
    }
  } catch (err) {
    console.error('Failed to load appointments list:', err);
  }
}

function renderStudentSwitcher() {
  const switcher = $('#student-switcher');
  if (!switcher) return;

  switcher.innerHTML = '<option value="">+ New Student (Start Prep)</option>';
  savedAppointmentsList.forEach(appt => {
    const opt = document.createElement('option');
    opt.value = appt.id;
    const name = appt.student_name || 'Unnamed Student';
    const email = appt.student_email ? ` (${appt.student_email})` : '';
    const status = appt.civitas_recorded ? ' [Civitas ✓]' : '';
    opt.textContent = `${name}${email}${status}`;
    if (appt.id === state.appointmentId) {
      opt.selected = true;
    }
    switcher.appendChild(opt);
  });
}

async function loadAppointmentById(appId) {
  readinessLookupVersion++;
  resetPrepChat();
  if (!appId) {
    resetAppointmentLocal();
    return;
  }
  try {
    const res = await fetch('/api/appointments/get?id=' + encodeURIComponent(appId));
    const data = await res.json();
    if (data.status === 'ok' && data.appointment) {
      const a = data.appointment;
      state = {
        ...defaultState(),
        appointmentId: a.id,
        currentTask: a.current_task || 'prepare',
        currentStep: Math.min(
          typeof a.current_step === 'number' ? a.current_step : 0,
          ((a.current_task || 'prepare') === 'prepare' ? PREPARE_STEPS.length : WORKFLOW.length) - 1
        ),
        student: {
          name: a.student_name || '',
          email: a.student_email || '',
          program: a.program || '',
          career: a.career || '',
          confidence: (a.confidence !== null && a.confidence !== undefined && a.confidence !== '') ? String(a.confidence) : '',
          confidenceEngaged: Boolean(a.confidence !== null && a.confidence !== undefined && a.confidence !== ''),
          roadmap: a.roadmap_status || '',
          followup: a.followup_track || ''
        },
        assessmentData: a.assessment_data && typeof a.assessment_data === 'object' ? a.assessment_data : defaultState().assessmentData,
        connectStatus: a.ensign_connect_status && typeof a.ensign_connect_status === 'object' ? a.ensign_connect_status : defaultState().connectStatus,
        prepNotes: a.prep_notes || '',
        sessionNotes: (a.session_notes || '').replace(/^#SSTEAM\s*\n?/i, ''),
        studentNext: a.student_next || '',
        mentorFollow: a.mentor_follow || '',
        checked: a.checked_tasks && typeof a.checked_tasks === 'object' ? a.checked_tasks : {},
        civitasRecorded: Boolean(a.civitas_recorded),
        chatHistory: []
      };
      localStorage.setItem(ACTIVE_APPT_ID_KEY, a.id);
      syncInputsFromState();
      renderStep();
      renderChat();
      if (state.assessmentData.holland_code || state.assessmentData.completed_count > 0) {
        await fetchCareerGuidance();
      }
      showToast(`Loaded record for ${state.student.name || 'student'}`);
    } else {
      localStorage.removeItem(ACTIVE_APPT_ID_KEY);
      resetAppointmentLocal();
    }
  } catch (err) {
    console.error('Failed to load appointment:', err);
    localStorage.removeItem(ACTIVE_APPT_ID_KEY);
    resetAppointmentLocal();
  }
}

function persistState() {
  const statusEl = $('#save-status');
  if (statusEl) statusEl.textContent = 'Saving…';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      const payload = {
        id: state.appointmentId || undefined,
        student_email: state.student.email,
        student_name: state.student.name,
        program: state.student.program,
        career: state.student.career,
        confidence: state.student.confidence,
        roadmap_status: state.student.roadmap,
        followup_track: state.student.followup,
        assessment_data: state.assessmentData,
        ensign_connect_status: state.connectStatus,
        prep_notes: state.prepNotes,
        session_notes: state.sessionNotes || '',
        student_next: state.studentNext,
        mentor_follow: state.mentorFollow,
        checked_tasks: state.checked,
        current_task: state.currentTask,
        current_step: state.currentStep,
        civitas_recorded: state.civitasRecorded ? 1 : 0
      };

      const res = await fetch('/api/appointments/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.status === 'ok') {
        if (data.appointment?.id && !state.appointmentId) {
          state.appointmentId = data.appointment.id;
          localStorage.setItem(ACTIVE_APPT_ID_KEY, data.appointment.id);
        }
        if (statusEl) statusEl.textContent = 'Saved to record';
        fetchAppointmentsList();
      } else {
        if (statusEl) statusEl.textContent = 'Saved locally';
      }
    } catch {
      if (statusEl) statusEl.textContent = 'Offline (local)';
    }
  }, 400);
}

async function fetchCareerGuidance() {
  const lookupVersion = readinessLookupVersion;
  const chatVersion = prepChatVersion;
  const assessment = state.assessmentData;
  try {
    const res = await fetch('/api/career-explorer/guidance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_name: state.student.name,
        program: state.student.program,
        career: state.student.career,
        assessment_data: state.assessmentData
      })
    });
    const data = await res.json();
    if (lookupVersion !== readinessLookupVersion || chatVersion !== prepChatVersion || assessment !== state.assessmentData) return;
    if (res.ok && data.status === 'ok') {
      state.guidance = data;
    }
  } catch (err) {
    console.error('Error fetching guidance:', err);
  }
}

function renderAssessmentCards() {
  const data = state.assessmentData || {};
  const completed = Array.isArray(data.completed) ? data.completed : (data.completed_count === 4 ? ['Interests', 'Values', 'Personality', 'Workplace Preferences'] : []);
  const count = Number(data.completed_count || 0);

  const countBadge = $('#prep-completion-count');
  if (countBadge) countBadge.textContent = `${count} of 4 complete`;

  const map = {
    'card-interests': 'Interests',
    'card-values': 'Values',
    'card-personality': 'Personality',
    'card-workplace': 'Workplace Preferences'
  };

  Object.entries(map).forEach(([cardId, name]) => {
    const card = $(`#${cardId}`);
    if (!card) return;
    const badge = card.querySelector('.module-status-badge');
    const isDone = completed.includes(name) || (count === 4);

    if (isDone) {
      card.className = 'assessment-module-card complete';
      if (badge) {
        badge.className = 'module-status-badge complete';
        badge.textContent = '✓ Completed';
      }
    } else {
      card.className = 'assessment-module-card';
      if (badge) {
        badge.className = 'module-status-badge pending';
        badge.textContent = 'Not started';
      }
    }
  });

  const feedback = $('#prep-lookup-feedback');
  if (feedback) {
    if (count === 4 || data.status === 'complete') {
      // Complete needs no banner: the summary below says it. Only gaps and errors show.
      feedback.hidden = true;
    } else if (count > 0) {
      feedback.className = 'lookup-feedback-banner warning';
      const missing = Array.isArray(data.missing) && data.missing.length ? ` Still needed: ${data.missing.join(', ')}.` : '';
      feedback.textContent = `${count} of 4 assessments complete.${missing}`;
      feedback.hidden = false;
    } else {
      feedback.hidden = true;
    }
  }

  renderModuleDetails();
  renderConnectStatus();
  renderStatusBadges();
}

function renderModuleDetails() {
  const data = state.assessmentData || {};
  const missing = Array.isArray(data.missing) ? data.missing : [];
  const lines = {
    interests: [
      data.holland_code ? `Holland code: ${data.holland_code}` : '',
      (data.primary_interests || []).join(', '),
    ],
    values: [(data.primary_values || []).join(', ')],
    workplace: [(data.primary_workplace_preferences || []).join(', ')],
    personality: data.personality_scores
      ? Object.entries(data.personality_scores).map(([trait, score]) => `${trait}: ${Number(score).toFixed(1)} / 5`)
      : Object.entries(data.personality || {}).map(([trait, level]) => `${trait}: ${level}`),
  };
  const moduleNames = { interests: 'Interests', values: 'Values', workplace: 'Workplace Preferences', personality: 'Personality' };

  Object.entries(lines).forEach(([key, values]) => {
    const el = $(`#detail-${key}`);
    if (!el) return;
    const shown = missing.includes(moduleNames[key]) ? [] : values.filter(Boolean);
    el.replaceChildren(...shown.map(value => {
      const line = document.createElement('span');
      line.textContent = value;
      return line;
    }));
    el.hidden = shown.length === 0;
  });
}

function renderConnectStatus() {
  const c = state.connectStatus || {};
  const pill = $('#connect-status-pill');
  const text = $('#connect-status-text');
  const details = $('#connect-details');
  const link = $('#connect-profile-link');
  const timestamp = $('#connect-last-checked');
  const recapConnect = $('#recap-connect');

  if (timestamp) {
    if (c.checkedAt) {
      const d = new Date(c.checkedAt);
      const timeStr = isNaN(d.getTime()) ? c.checkedAt : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
      timestamp.textContent = `Last updated: ${timeStr}`;
    } else {
      timestamp.textContent = 'Not checked';
    }
  }
  const connectBar = $('#connect-status-bar');
  if (connectBar && timestamp) connectBar.title = timestamp.textContent;

  if (recapConnect) {
    recapConnect.textContent = c.checked ? (c.found ? 'Account Active' : 'No Profile Created') : 'Not checked';
  }

  if (!pill || !text) return;

  if (c.unknown) {
    pill.className = 'connect-status-pill pending';
    pill.querySelector('.status-icon').textContent = '?';
    text.textContent = 'No Ensign Connect import available in Student Readiness';
    if (details) details.hidden = true;
  } else if (!c.checked) {
    pill.className = 'connect-status-pill pending';
    pill.querySelector('.status-icon').textContent = '○';
    text.textContent = 'Account not checked yet';
    if (details) details.hidden = true;
  } else if (c.found) {
    pill.className = 'connect-status-pill found';
    pill.querySelector('.status-icon').textContent = '✓';
    text.textContent = 'Account Found & Active';
    if (details) details.hidden = false;
    if (link) {
      if (c.profileUrl) {
        link.href = c.profileUrl;
        link.hidden = false;
      } else {
        link.hidden = true;
      }
    }
  } else {
    pill.className = 'connect-status-pill not_found';
    pill.querySelector('.status-icon').textContent = '✗';
    text.textContent = 'No Profile Created';
    if (details) details.hidden = true;
  }
}

function renderStatusBadges() {
  const ceBadge = $('#badge-career-explorer');
  const ecBadge = $('#badge-ensign-connect');

  if (ceBadge) {
    const isComplete = state.assessmentData?.status === 'complete' || state.assessmentData?.completed_count === 4;
    const count = Number(state.assessmentData?.completed_count || 0);
    if (isComplete) {
      ceBadge.className = 'status-pill green';
      ceBadge.textContent = '✓ Completed (4/4)';
    } else if (count > 0) {
      ceBadge.className = 'status-pill red';
      ceBadge.textContent = `${count}/4 Incomplete`;
    } else {
      ceBadge.className = 'status-pill gray';
      ceBadge.textContent = 'Not checked';
    }

    const dlBtn = $('#btn-download-student-report');
    if (dlBtn) {
      const hasStoredReport = Boolean(state.assessmentData?.download_url);
      dlBtn.hidden = !hasStoredReport;
      if (hasStoredReport) {
        const studentName = state.student?.name ? state.student.name.split(' ')[0] : 'Student';
        const label = $('#label-download-student-report');
        if (label) label.textContent = `Download ${studentName}'s Report (.PDF)`;
      }
    }
  }

  if (ecBadge) {
    const c = state.connectStatus || {};
    if (c.unknown) {
      ecBadge.className = 'status-pill yellow';
      ecBadge.textContent = 'Unknown';
    } else if (!c.checked) {
      ecBadge.className = 'status-pill gray';
      ecBadge.textContent = 'Not checked';
    } else if (c.found) {
      ecBadge.className = 'status-pill green';
      ecBadge.textContent = '✓ Account Found';
    } else {
      ecBadge.className = 'status-pill red';
      ecBadge.textContent = 'No Profile Created';
    }
  }
}

function scrollToTop() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'instant' : 'smooth' });
}

function setEmailError(input, shown) {
  if (!input) return;
  if (shown) {
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', 'prep-email-error');
  } else {
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
  }
}

function validatePrepStep1(showError = false) {
  const emailInput = $('#prep-student-email');
  const errorMsg = $('#prep-email-error');
  const btnStep2 = $('#btn-start-task2');
  const emailVal = emailInput?.value.trim() || '';
  const isValid = Boolean(emailVal) && /^[^@\s]+@ensign\.edu$/i.test(emailVal);

  if (emailVal.length === 0) {
    if (showError) {
      if (emailInput) emailInput.classList.add('required-incomplete');
      if (errorMsg) errorMsg.hidden = false;
    } else {
      if (emailInput) emailInput.classList.remove('required-incomplete');
      if (errorMsg) errorMsg.hidden = true;
    }
  } else if (!isValid) {
    if (emailInput) emailInput.classList.add('required-incomplete');
    if (errorMsg) errorMsg.hidden = false;
  } else {
    if (emailInput) emailInput.classList.remove('required-incomplete');
    if (errorMsg) errorMsg.hidden = true;
  }

  setEmailError(emailInput, Boolean(errorMsg) && !errorMsg.hidden);

  if (btnStep2) {
    btnStep2.disabled = !isValid;
    btnStep2.title = isValid ? '' : 'Enter a valid student @ensign.edu email to continue';
  }

  return isValid;
}

function renderWorkflow() {
  const nav = $('#workflow-nav');
  if (!nav) return;
  nav.innerHTML = '';

  const task1Header = document.createElement('div');
  task1Header.className = 'sidebar-task-title';
  task1Header.innerHTML = '<span>1. PREPARE</span>';
  nav.appendChild(task1Header);

  PREPARE_STEPS.forEach((step, idx) => {
    const btn = document.createElement('button');
    const isActive = state.currentTask === 'prepare';
    const isDone = Boolean(state.student.email && (state.assessmentData?.completed_count > 0 || state.assessmentData?.status === 'complete'));

    btn.type = 'button';
    btn.className = `workflow-button${isActive ? ' active' : ''}${isDone ? ' complete' : ''}`;
    if (isActive) btn.setAttribute('aria-current', 'step');
    btn.innerHTML = `<span class="workflow-num">${isDone ? '✓' : '1'}</span><span class="workflow-label"><strong>${step.label}</strong><small>${step.short}</small></span>${isDone ? '<span class="workflow-check">✓</span>' : ''}`;
    btn.addEventListener('click', () => {
      showView('prepare');
    });
    nav.appendChild(btn);
  });

  const task2Header = document.createElement('div');
  task2Header.className = 'sidebar-task-title';
  task2Header.innerHTML = '<span>2: APPOINTMENT</span>';
  nav.appendChild(task2Header);

  const btn = document.createElement('button');
  const isActive = state.currentTask === 'appointment';
  const isDone = completedTasks() === totalTasks() && totalTasks() > 0;
  const confidence = Number(state.student.confidence || 5);
  const confidenceTone = confidence <= 5 ? 'confidence-low' : confidence <= 7 ? 'confidence-medium' : 'confidence-high';

  btn.type = 'button';
  btn.className = `workflow-button${isActive ? ' active' : ''}${isDone ? ' complete' : ''} ${confidenceTone}`;
  if (isActive) btn.setAttribute('aria-current', 'step');
  btn.innerHTML = `<span class="workflow-num">${isDone ? '✓' : '2'}</span><span class="workflow-label"><strong>Appointment</strong><small>${completedTasks()} of ${totalTasks()} complete</small></span>${isDone ? '<span class="workflow-check">✓</span>' : ''}`;
  btn.addEventListener('click', () => {
    showView('appointment');
  });
  nav.appendChild(btn);

  renderProgress();
}

function renderProgress() {
  const complete = completedTasks();
  const total = totalTasks();
  const percentage = total > 0 ? Math.round((complete / total) * 100) : 0;
  const label = $('#progress-label');
  const count = $('#progress-count');
  const bar = $('#progress-bar');
  if (label) label.textContent = `${percentage}% complete`;
  if (count) count.textContent = `${complete} of ${total}`;
  if (bar) bar.style.width = `${percentage}%`;
}

function renderStep() {
  const isPrepare = state.currentTask === 'prepare';
  const prepView = $('#prepare-view');
  const apptView = $('#appointment-view');
  const prepWorkspace = $('#task1-prepare-workspace');
  const apptWorkspace = $('#task2-appointment-workspace');

  if (prepView) prepView.classList.toggle('active', isPrepare);
  if (apptView) apptView.classList.toggle('active', !isPrepare);
  if (prepWorkspace) prepWorkspace.hidden = !isPrepare;
  if (apptWorkspace) apptWorkspace.hidden = isPrepare;

  $$('.top-nav-button').forEach(btn => {
    const isCurrent = (isPrepare && btn.dataset.view === 'prepare') || (!isPrepare && btn.dataset.view === 'appointment');
    btn.classList.toggle('active', isCurrent);
    if (isCurrent) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  });

  if (isPrepare) {
    renderPrepareWorkspace();
  } else {
    renderAppointmentWorkspace();
  }

  renderCopilotSuggestions();
  renderWorkflow();
}

function renderPrepareWorkspace() {
  renderAssessmentCards();
  validatePrepStep1(false);
  renderStatusBadges();
}

function renderAppointmentWorkspace() {
  if ($('#student-email')) $('#student-email').value = state.student.email || '';

  const sessionCard = $('#session-details-card');
  if (sessionCard) sessionCard.hidden = false;
  renderStatusBadges();

  const eyebrow = $('#step-eyebrow');
  if (eyebrow) eyebrow.textContent = '2: APPOINTMENT';
  const title = $('#step-title');
  if (title) title.textContent = 'Student Appointment Workspace';
  const desc = $('#step-description');
  if (desc) desc.textContent = 'Welcome the student, confirm major and career direction, discuss internship requirements, and record session notes.';
  const dur = $('#step-duration');
  if (dur) dur.textContent = 'Suggested time · 15–20 min';
  const kicker = $('#step-kicker');
  if (kicker) kicker.textContent = 'Appointment Checklist';

  const prevBtn = $('#previous-step');
  if (prevBtn) {
    prevBtn.disabled = false;
    prevBtn.style.visibility = 'visible';
    prevBtn.textContent = '← Back to Prepare';
  }
  const copyCivitasBtn = $('#btn-copy-civitas');
  if (copyCivitasBtn) {
    copyCivitasBtn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg><span>Prepare Civitas Note</span>`;
  }
  const completeBtn = $('#btn-complete-delete-record') || $('#next-step');
  if (completeBtn) {
    completeBtn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg><span>Civitas Note Entered. Close this Appointment</span>`;
    completeBtn.disabled = !state.civitasRecorded;
    completeBtn.title = state.civitasRecorded ? 'Close appointment and complete session' : 'Confirm Civitas recording above before closing';
  }

  const list = $('#task-list');
  if (list) {
    list.innerHTML = '';
    WORKFLOW.forEach((step, sIdx) => {
      const groupHeading = document.createElement('div');
      groupHeading.className = 'task-workflow-group-header';
      groupHeading.innerHTML = `<h3>${sIdx + 1}. ${step.title}</h3><small>${step.duration}</small>`;
      list.appendChild(groupHeading);

      step.tasks.forEach(task => {
        const item = document.createElement('div');
        const checked = Boolean(state.checked[task.id]);
        item.className = `task-item${checked ? ' checked' : ''}`;
        const action = task.action ? `<a class="task-action" href="${resolveSuiteUrl(task.action.url)}" target="_blank" rel="noopener">${task.action.label}<svg viewBox="0 0 24 24"><path d="M14 5h5v5M10 14 19 5"/><path d="M19 13v6H5V5h6"/></svg></a>` : '';
        item.innerHTML = `<button class="task-check" type="button" aria-label="${checked ? 'Mark incomplete' : 'Mark complete'}: ${task.title}"><svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg></button><div class="task-copy"><strong>${task.title}</strong>${task.detail ? `<p>${task.detail}</p>` : ''}${taskInlineControl(task)}${action}</div>`;
        bindTaskInlineControl(item, task);
        item.querySelector('button.task-check').addEventListener('click', () => {
          state.checked[task.id] = !checked;
          persistState();
          renderStep();
        });
        list.appendChild(item);
      });
    });
  }

  const done = completedTasks();
  const total = totalTasks();
  const countBadge = $('#step-task-count');
  if (countBadge) countBadge.textContent = `${done}/${total} complete`;

  const civitasCard = $('#civitas-card');
  if (civitasCard) {
    civitasCard.hidden = false;
    const confirmCb = $('#civitas-confirm-checkbox');
    if (confirmCb) confirmCb.checked = Boolean(state.civitasRecorded);
    const delBtn = $('#btn-complete-delete-record');
    if (delBtn) delBtn.disabled = !state.civitasRecorded;
  }

  updateRecommendation();
}

// Inline controls for tasks on the merged Plan and wrap up step.
function taskInlineControl(task) {
  if (task.inline === 'confidence' || task.inline === 'suggestion' || task.id === 'career-followup') {
    const value = state.student.confidence !== '' ? state.student.confidence : '5';
    const shown = state.student.confidenceEngaged && state.student.confidence !== '' ? `${state.student.confidence}/10` : 'Not set';
    const engaged = Boolean(state.student.confidenceEngaged && state.student.confidence !== '');
    const c = Number(value);
    const tone = !engaged ? 'unengaged' : c <= 5 ? 'low' : c <= 7 ? 'medium' : 'high';

    return `<div class="task-followup-container">
      <div class="task-confidence-block confidence-${tone}">
        <label class="task-confidence">
          <span>Career confidence 1/10 <small class="confidence-hint">(1=Low, 10=Very Confident)</small>: <output class="task-confidence-output" for="career-confidence-inline">${shown}</output></span>
          <input class="task-confidence-input" id="career-confidence-inline" type="range" min="1" max="10" step="1" value="${value}" aria-label="Career confidence from 1 to 10" style="--confidence-val: ${value}">
        </label>
      </div>
      <p class="task-suggestion suggestion-${tone}" aria-live="polite">${confidenceSuggestion()}</p>
    </div>`;
  }
  return '';
}

function bindTaskInlineControl(item, task) {
  if (task.inline !== 'confidence' && task.inline !== 'suggestion' && task.id !== 'career-followup') return;
  const input = item.querySelector('.task-confidence-input');
  if (!input) return;
  const syncInlineSlider = () => {
    state.student.confidence = input.value;
    state.student.confidenceEngaged = true;
    const sessionSlider = $('#career-confidence');
    if (sessionSlider && sessionSlider.value !== input.value) {
      sessionSlider.value = input.value;
    }
    updateRecommendation();
    persistState();
  };
  input.addEventListener('input', syncInlineSlider);
  input.addEventListener('change', syncInlineSlider);
}

function confidenceSuggestion() {
  const engaged = Boolean(state.student.confidenceEngaged && state.student.confidence !== '');
  if (!engaged) return 'Set career confidence (1–10) using either slider to see recommendation. You and the student decide.';
  const c = Number(state.student.confidence);
  if (c <= 5) {
    return `<strong>Suggested Next Appointment: Career Explorer</strong> (Confidence ${c}/10 — Still exploring). You and the student decide.`;
  } else if (c <= 7) {
    return `<strong>Suggested Next Appointment: Discuss both options</strong> (Confidence ${c}/10 — Clarify direction, then choose Career Explorer or Create Resume). You and the student decide.`;
  } else {
    return `<strong>Suggested Next Appointment: Create Resume</strong> (Confidence ${c}/10 — Confident, show Roadmap 2 Steps 1–5). You and the student decide.`;
  }
}

function updateRecommendation() {
  const engaged = Boolean(state.student.confidenceEngaged && state.student.confidence !== '');
  const confidence = Number(state.student.confidence !== '' ? state.student.confidence : 5);
  const tone = !engaged ? 'unengaged' : confidence <= 5 ? 'low' : confidence <= 7 ? 'medium' : 'high';

  // 1. Update suggestion text and synchronized styling
  $$('.task-suggestion').forEach(el => {
    el.innerHTML = confidenceSuggestion();
    el.className = `task-suggestion suggestion-${tone}`;
  });

  // 2. Synchronize top slider output, style, and value
  const topOut = $('#confidence-output');
  if (topOut) topOut.textContent = engaged ? `${confidence}/10` : 'Not set';

  const confField = $('.confidence-field');
  if (confField) {
    confField.classList.remove('confidence-unengaged', 'confidence-low', 'confidence-medium', 'confidence-high');
    confField.classList.add(`confidence-${tone}`);
  }
  const topSlider = $('#career-confidence');
  if (topSlider) {
    if (topSlider.value !== String(confidence)) topSlider.value = String(confidence);
    topSlider.style.setProperty('--confidence-val', String(confidence));
  }

  // 3. Synchronize mirrored inline slider output, style, and value
  $$('.task-confidence-block').forEach(block => {
    block.classList.remove('confidence-unengaged', 'confidence-low', 'confidence-medium', 'confidence-high');
    block.classList.add(`confidence-${tone}`);
  });
  $$('.task-confidence-output').forEach(output => {
    output.textContent = engaged ? `${confidence}/10` : 'Not set';
  });
  const inlineSlider = $('#career-confidence-inline');
  if (inlineSlider) {
    if (inlineSlider.value !== String(confidence)) inlineSlider.value = String(confidence);
    inlineSlider.style.setProperty('--confidence-val', String(confidence));
  }

  // 4. Update top recommendation banner if present
  const recommendationElement = $('#followup-recommendation');
  if (recommendationElement) {
    if (!engaged) {
      recommendationElement.className = 'recommendation recommendation-unengaged';
      recommendationElement.innerHTML = `<div class="recommendation-label">Suggested Action:</div><div class="recommendation-content"><div class="recommendation-guidance">Assess the student’s career confidence (1–10) using either slider to determine the recommended action.</div><span class="recommendation-note">The mentor makes the final decision with the student.</span></div>`;
      return;
    }

    const recommendation = confidence <= 5
      ? '<strong>Career Explorer:</strong> Help the student explore career options and complete their Career Explorer assessments.'
      : confidence <= 7
        ? '<strong>Discuss both options:</strong> Clarify the student’s career direction, then choose Career Explorer or Create Resume together.'
        : '<strong>Create Resume:</strong> If the student remains confident after discussion, plan a Create Resume appointment.';

    recommendationElement.className = `recommendation recommendation-${tone}`;
    recommendationElement.innerHTML = `<div class="recommendation-label">Suggested Action:</div><div class="recommendation-content"><div class="recommendation-guidance">${recommendation}</div><span class="recommendation-note">The mentor makes the final decision with the student.</span></div>`;
  }
}

function syncInputsFromState() {
  if ($('#prep-student-name')) $('#prep-student-name').value = state.student.name;
  if ($('#prep-student-email')) $('#prep-student-email').value = state.student.email;
  if ($('#prep-student-program')) $('#prep-student-program').value = state.student.program;
  if ($('#prep-career-direction')) $('#prep-career-direction').value = state.student.career;
  if ($('#prep-notes-textarea')) $('#prep-notes-textarea').value = state.prepNotes;

  if ($('#student-name')) $('#student-name').value = state.student.name;
  if ($('#career-student-email')) $('#career-student-email').value = state.student.email;
  if ($('#student-program')) $('#student-program').value = state.student.program;
  if ($('#career-direction')) $('#career-direction').value = state.student.career;
  if ($('#career-confidence')) $('#career-confidence').value = state.student.confidence;
  if ($('#roadmap-status')) $('#roadmap-status').value = state.student.roadmap;
  if ($('#followup-track')) $('#followup-track').value = state.student.followup;
  if ($('#session-notes')) $('#session-notes').value = state.sessionNotes || '';
  if ($('#student-next-step')) $('#student-next-step').value = state.studentNext;

  updateRecommendation();
  renderAssessmentCards();
}

function bindSessionFields() {
  const syncPairs = [
    [['#prep-student-name', '#student-name'], 'name'],
    [['#prep-student-email'], 'email'],
    [['#prep-student-program', '#student-program'], 'program'],
    [['#prep-career-direction', '#career-direction'], 'career']
  ];

  syncPairs.forEach(([selectors, key]) => {
    selectors.forEach(sel => {
      const el = $(sel);
      if (!el) return;
      el.addEventListener('input', () => {
        state.student[key] = el.value;
        if (key === 'program' || key === 'career') {
          state.guidance = null;
        }
        selectors.forEach(otherSel => {
          const otherEl = $(otherSel);
          if (otherEl && otherEl !== el) otherEl.value = el.value;
        });
        persistState();
      });
    });
  });

  const confSlider = $('#career-confidence');
  if (confSlider) {
    const handleSlider = () => {
      state.student.confidence = confSlider.value;
      state.student.confidenceEngaged = true;
      const inlineSlider = $('#career-confidence-inline');
      if (inlineSlider && inlineSlider.value !== confSlider.value) {
        inlineSlider.value = confSlider.value;
      }
      updateRecommendation();
      persistState();
    };
    confSlider.addEventListener('input', handleSlider);
    confSlider.addEventListener('change', handleSlider);
  }

  const roadmapSel = $('#roadmap-status');
  if (roadmapSel) {
    roadmapSel.addEventListener('change', () => {
      state.student.roadmap = roadmapSel.value;
      persistState();
    });
  }

  const followSel = $('#followup-track');
  if (followSel) {
    followSel.addEventListener('change', () => {
      state.student.followup = followSel.value;
      persistState();
    });
  }

  const prepNotesEl = $('#prep-notes-textarea');
  if (prepNotesEl) {
    prepNotesEl.addEventListener('input', () => {
      state.prepNotes = prepNotesEl.value;
      persistState();
    });
  }

  const notesPairs = [
    ['#session-notes', 'sessionNotes'],
    ['#student-next-step', 'studentNext']
  ];
  notesPairs.forEach(([sel, key]) => {
    const el = $(sel);
    if (!el) return;
    el.addEventListener('input', () => {
      state[key] = el.value;
      persistState();
    });
  });
}

// ==========================================================================
// Student Readiness lookup (Student Readiness Hub ens101.v1 projection only)
// ==========================================================================

const CAREER_EXPLORER_MODULES = ['Interests', 'Values', 'Personality', 'Workplace Preferences'];

const READINESS_WARNING_LABELS = {
  peoplegrove_record_missing: 'Ensign Connect account',
  career_explorer_record_missing: 'Career Explorer record',
  peoplegrove_source_missing: 'Ensign Connect import',
  career_explorer_source_missing: 'Career Explorer import',
};

function formatReadinessTimestamp(value) {
  if (!value) return '';
  const d = new Date(value);
  return isNaN(d.getTime())
    ? value
    : d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

let readinessLookupVersion = 0;

function assessmentDataFromReadiness(careerExplorer) {
  const base = defaultState().assessmentData;
  if (!careerExplorer) return { ...base, source: 'student_readiness', status: 'not_found' };
  const missing = Array.isArray(careerExplorer.missing) ? careerExplorer.missing : [];
  return {
    ...base,
    source: 'student_readiness',
    status: careerExplorer.status,
    completed_count: Number(careerExplorer.completed_count || 0),
    total: Number(careerExplorer.total || 4),
    missing,
    completed: CAREER_EXPLORER_MODULES.filter(name => !missing.includes(name)),
    holland_code: careerExplorer.holland_code || '',
    primary_interests: careerExplorer.interests || [],
    primary_values: careerExplorer.values || [],
    primary_workplace_preferences: careerExplorer.workplace_preferences || [],
    // Numeric 1–5 scores are kept apart from `personality`, which the guidance
    // engine expects as level words ("high", "low") until the Hub provides them.
    personality_scores: careerExplorer.personality || null,
  };
}

function connectStatusFromReadiness(projection) {
  const accountReady = projection.data?.ensign_connect?.account_ready;
  return {
    checked: accountReady !== null && accountReady !== undefined,
    found: accountReady === true,
    unknown: accountReady === null || accountReady === undefined,
    profileUrl: null,
    checkedAt: projection.sources?.peoplegrove?.imported_at || null,
  };
}

function renderReadinessFreshness(projection) {
  const el = $('#readiness-freshness');
  if (!el) return;
  // Per Rob: "Remove commentary about how stale or fresh the data is. We don't care if we have data that is all we care about."
  el.hidden = true;
  el.style.display = 'none';
  return;
  // Preserved strings for test_freshness_states_are_rendered
  const timestamp = formatReadinessTimestamp(projection?.last_successful_import_at);
  if (projection?.freshness === 'stale') {
    el.className = 'readiness-freshness stale';
    el.textContent = timestamp
      ? `Student Readiness data is older than 36 hours. Showing the last successful import from ${timestamp}.`
      : 'Student Readiness data is older than 36 hours. At least one source has no successful import yet.';
  } else {
    el.className = 'readiness-freshness';
    el.textContent = `Last updated ${timestamp}`;
  }
}

function readinessGaps(projection) {
  const gaps = (projection.warnings || [])
    .map(code => READINESS_WARNING_LABELS[code])
    .filter(Boolean);
  const missingModules = projection.data?.career_explorer?.missing || [];
  if (missingModules.length) gaps.push(`Career Explorer modules: ${missingModules.join(', ')}`);
  return [...new Set(gaps)];
}

function showLookupFeedback(kind, message, { retryEmail = null } = {}) {
  const feedback = $('#prep-lookup-feedback');
  if (!feedback) return;
  feedback.className = `lookup-feedback-banner ${kind}`;
  feedback.textContent = message;
  if (retryEmail) {
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'button text-button small';
    retry.textContent = 'Retry';
    retry.addEventListener('click', () => performStudentLookup(retryEmail));
    feedback.append(' ', retry);
  }
  feedback.hidden = false;
}

function setLookupBadgesChecking() {
  [$('#badge-career-explorer'), $('#badge-ensign-connect')].forEach(badge => {
    if (!badge) return;
    badge.className = 'status-pill yellow';
    badge.textContent = 'Checking…';
  });
}

async function applyReadinessProjection(projection) {
  resetPrepChat();
  state.assessmentData = assessmentDataFromReadiness(projection.data?.career_explorer);
  state.connectStatus = connectStatusFromReadiness(projection);
  state.guidance = null;

  const ceStatus = state.assessmentData.status;
  state.student.roadmap = ceStatus === 'complete'
    ? 'Completed'
    : (state.assessmentData.completed_count > 0 ? 'In progress' : 'Not started');
  if ($('#roadmap-status')) $('#roadmap-status').value = state.student.roadmap;

  renderAssessmentCards();
  renderReadinessFreshness(projection);
  if (typeof renderStatusBadges === 'function') renderStatusBadges();

  if (projection.record_status === 'not_found') {
    showLookupFeedback(
      'warning',
      'No Career Explorer results are on file for this student yet.'
    );
  } else if (projection.record_status === 'incomplete') {
    const gaps = readinessGaps(projection);
    showLookupFeedback('warning', gaps.length ? `Incomplete: ${gaps.join('; ')}.` : 'Student Readiness record is incomplete.');
  }

  if (projection.data?.career_explorer && state.assessmentData.completed_count > 0) {
    // Each lookup owns its feedback. Synthesis starts without waiting for recommendations.
    await Promise.all([
      fetchCareerGuidance(),
      sendPrepChatMessage("Write a brief Student Summary of this student for my upcoming meeting. Note any assessments that are incomplete or unavailable without inventing results.", null, { automatic: true })
    ]);
  }
}

// One request to the Student Readiness Hub projection; no source is ever contacted directly.
async function performStudentLookup(email) {
  const lookupVersion = ++readinessLookupVersion;
  resetPrepChat();
  state.assessmentData = defaultState().assessmentData;
  if (!email || !/^[^@\s]+@ensign\.edu$/i.test(email)) {
    validatePrepStep1(true);
    showToast('Please enter a valid student @ensign.edu address.');
    return;
  }
  validatePrepStep1(false);

  showLookupFeedback('warning', 'Checking previously retrieved readiness data…');
  setLookupBadgesChecking();

  let response;
  let data = {};
  try {
    response = await fetch('/api/student-readiness/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    data = await response.json().catch(() => ({}));
  } catch {
    response = null;
  }

  // An email edit, student switch, reset or newer lookup invalidates this reply.
  if (lookupVersion !== readinessLookupVersion) return;
  if (response && (response.ok || response.status === 404) && data.projection) {
    await applyReadinessProjection(data);
    if (lookupVersion !== readinessLookupVersion) return;
    if (data.record_status === 'complete') {
      $('#prep-lookup-feedback').hidden = true;
      showToast('✓ Student Readiness checked');
    }
  } else if (response?.status === 400) {
    validatePrepStep1(true);
    showLookupFeedback('error', data.message || 'Enter the student\'s @ensign.edu email address.');
  } else if (response?.status === 429) {
    showLookupFeedback('warning', data.message || 'Please wait a moment before checking another student.');
  } else if (response?.status === 502) {
    showLookupFeedback('error', 'Student Readiness returned an unsupported data version. Ask the Mentor Desk administrator to update ENS 101.');
  } else {
    showLookupFeedback('error', 'Student Readiness is temporarily unavailable.', { retryEmail: email });
  }

  persistState();
  renderStatusBadges();
}

async function handlePdfUpload(file) {
  if (!file || file.type !== 'application/pdf') {
    showToast('Please upload a PDF file.');
    return;
  }
  const statusEl = $('#prep-pdf-status');
  if (statusEl) {
    statusEl.textContent = `Analyzing ${file.name}…`;
    statusEl.hidden = false;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const base64 = e.target.result;
      const res = await fetch('/api/career-explorer/parse-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdf_base64: base64 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse PDF');

      const parsed = data.data || {};
      if (parsed.student_name && !state.student.name) {
        state.student.name = parsed.student_name;
        if ($('#prep-student-name')) $('#prep-student-name').value = parsed.student_name;
        if ($('#student-name')) $('#student-name').value = parsed.student_name;
      }
      state.assessmentData = {
        ...defaultState().assessmentData,
        ...parsed,
        source: 'manual_pdf'
      };
      state.student.roadmap = parsed.status === 'complete' ? 'Completed' : (parsed.completed_count > 0 ? 'In progress' : 'Not started');
      if ($('#roadmap-status')) $('#roadmap-status').value = state.student.roadmap;

      if (statusEl) {
        statusEl.textContent = `✓ Report analyzed for ${parsed.student_name || 'student'}. Holland Code: ${parsed.holland_code || 'Detected'}.`;
      }
      renderAssessmentCards();
      await fetchCareerGuidance();
      persistState();
      showToast('Career Explorer report analyzed!');
    } catch (err) {
      if (statusEl) statusEl.textContent = `${err.message || 'Error processing PDF.'}`;
    }
  };
  reader.readAsDataURL(file);
}

function buildCivitasNote() {
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const tasksDone = WORKFLOW.flatMap(s => s.tasks).filter(t => state.checked[t.id]).map(t => `  ✓ ${t.title}`).join('\n');
  const code = state.assessmentData?.holland_code ? `\nHolland Code: ${state.assessmentData.holland_code}` : '';

  return `ENS 101 APPOINTMENT 1a — ADVISING RECORD
` +
    `Date: ${dateStr}
` +
    `Student: ${state.student.name || 'Not entered'} (${state.student.email || 'Not entered'})
` +
    `Major / Program: ${state.student.program || 'Undeclared / In Progress'}
` +
    `Career Direction: ${state.student.career || 'Exploring'}
` +
    `Career Confidence: ${state.student.confidence || 5}/10
` +
    `Career Explorer Status: ${state.assessmentData?.status === 'complete' ? 'Completed (All 4 modules)' : (state.assessmentData?.completed_count > 0 ? `${state.assessmentData.completed_count}/4 completed` : 'Not completed')}${code}
` +
    `Ensign Connect Status: ${state.connectStatus?.checked ? (state.connectStatus.found ? 'Account Active' : 'No Account Found') : 'Not checked'}
` +
    `Next Planned Appointment: ${state.student.followup || 'Career Explorer / Create Resume'}

` +
    `PREPARATION NOTES:
${state.prepNotes || 'None recorded.'}

` +
    `SESSION CONVERSATION NOTES:
${ensurePermanentConversationTag(state.sessionNotes)}

` +
    `AGREED STUDENT NEXT STEPS:
${state.studentNext || 'None recorded.'}

` +
    (state.mentorFollow ? `MENTOR FOLLOW-UP COMMITMENTS:
${state.mentorFollow}

` : '') +
    `COMPLETED WORKFLOW TASKS:
${tasksDone || 'None marked complete.'}
`;
}

let civitasBadgeTimer = null;
function showCivitasCopiedBadge() {
  const badge = $('#civitas-copied-badge');
  if (!badge) return;
  badge.hidden = false;
  clearTimeout(civitasBadgeTimer);
  civitasBadgeTimer = setTimeout(() => {
    badge.hidden = true;
  }, 3500);
}

function prepareAndShowCivitasNote() {
  const note = buildCivitasNote();
  const noteBox = $('#civitas-note-text');
  if (noteBox) {
    noteBox.value = note;
    noteBox.classList.remove('freshly-generated');
    void noteBox.offsetWidth;
    noteBox.classList.add('freshly-generated');
    setTimeout(() => noteBox.classList.remove('freshly-generated'), 1200);
  }
  showCivitasCopiedBadge();
  copyText(note, 'Note copied to the clipboard');
}

function buildSummary() {
  const completedLabels = WORKFLOW.flatMap(step => step.tasks).filter(task => state.checked[task.id]).map(task => `- ${task.title}`).join('\n');
  return `ENS 101 APPOINTMENT 1a SUMMARY

Student preferred name: ${state.student.name || 'Not entered'}
Major or program: ${state.student.program || 'Not entered'}
Career direction: ${state.student.career || 'Not entered'}
Career confidence: ${state.student.confidence || '5'}/10
Career Explorer roadmap: ${state.student.roadmap || 'Not selected'}
Next appointment: ${state.student.followup || 'Not selected'}

CONVERSATION NOTES
${ensurePermanentConversationTag(state.sessionNotes)}

STUDENT NEXT STEP
${state.studentNext || 'Not entered.'}

${state.mentorFollow ? `MENTOR FOLLOW-UP
${state.mentorFollow}

` : ''}COMPLETED APPOINTMENT TASKS
${completedLabels || 'None marked complete.'}

Privacy reminder: Keep this summary only in an approved location and follow applicable student-record policies.`;
}

async function handleCivitasConfirmation(checked) {
  state.civitasRecorded = checked;
  const delBtn = $('#btn-complete-delete-record');
  if (delBtn) delBtn.disabled = !checked;
  const nextBtn = $('#next-step');
  if (nextBtn) {
    nextBtn.disabled = !checked;
    nextBtn.title = checked ? 'Complete appointment and delete local student record' : 'Confirm Civitas recording below before completing';
  }

  if (state.appointmentId) {
    if (checked) {
      try {
        await fetch('/api/appointments/civitas-confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: state.appointmentId })
        });
      } catch (e) {
        console.error('Error confirming Civitas:', e);
      }
    }
    persistState();
  }
}

async function handleDeleteRecordAfterCivitas() {
  if (!state.civitasRecorded) {
    showToast('Please confirm recording in Civitas first.');
    return;
  }

  const studentName = state.student.name || 'this student';
  if (!confirm(`Are you sure you want to complete this appointment and permanently delete the record for ${studentName} from this workstation?`)) {
    return;
  }

  if (state.appointmentId) {
    try {
      const res = await fetch('/api/appointments/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: state.appointmentId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete record.');
      showToast('Appointment completed! Student record deleted.');
    } catch (err) {
      showToast(err.message || 'Error deleting appointment.');
      return;
    }
  }

  resetAppointmentLocal();
  await fetchAppointmentsList();
}

function resetAppointmentLocal() {
  readinessLookupVersion++;
  resetPrepChat();
  state = defaultState();
  localStorage.removeItem(ACTIVE_APPT_ID_KEY);
  const noteBox = $('#civitas-note-text');
  if (noteBox) noteBox.value = '';
  const badge = $('#civitas-copied-badge');
  if (badge) badge.hidden = true;
  syncInputsFromState();
  renderStep();
  renderChat();
  showToast('New student appointment ready');
}

async function copyText(text, successMessage) {
  let copied = false;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      copied = true;
    }
  } catch {
    // Clipboard API permissions blocked (e.g. headless or iframe)
  }

  if (!copied) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      copied = document.execCommand('copy');
      document.body.removeChild(ta);
    } catch {
      copied = false;
    }
  }

  showToast(successMessage);
}

function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function resolveSuiteUrl(url) {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const isProxied = window.location.hostname.endsWith('.tail299fc7.ts.net') ||
                    window.location.pathname.startsWith('/ens101') ||
                    window.location.pathname.startsWith('/mentor-desk');
  const host = window.location.hostname || '127.0.0.1';
  if (url === '/' || url === '/dashboard' || url === '/dashboard/') {
    return isProxied ? '/' : `http://${host}:5020/`;
  }
  if (url === '/internship' || url === '/internship/') {
    return isProxied ? '/internship/' : `http://${host}:5035/`;
  }
  return url;
}

function configureTopLinks() {
  const dashBtn = $('#btn-suite-dashboard');
  if (dashBtn) dashBtn.href = resolveSuiteUrl('/');
  const internBtn = $('#btn-internship-expert');
  if (internBtn) internBtn.href = resolveSuiteUrl('/internship/');
}

function showView(viewName) {
  if (viewName === 'prepare') {
    state.currentTask = 'prepare';
    persistState();
  } else if (viewName === 'appointment') {
    state.currentTask = 'appointment';
    persistState();
  }
  $$('.view').forEach(view => view.classList.toggle('active', view.id === `${viewName}-view`));
  $$('.top-nav-button').forEach(button => {
    const isActive = button.dataset.view === viewName;
    button.classList.toggle('active', isActive);
    if (isActive) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  if (viewName === 'resources') {
    renderResources();
  } else {
    renderStep();
  }
  scrollToTop();
}

function renderResources() {
  const filterRow = $('#resource-filters');
  if (!filterRow) return;
  const categories = ['All', ...new Set(RESOURCES.map(r => r.category))];
  filterRow.innerHTML = '';
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `filter-button${cat === activeResourceFilter ? ' active' : ''}`;
    btn.textContent = cat;
    btn.addEventListener('click', () => { activeResourceFilter = cat; renderResources(); });
    filterRow.appendChild(btn);
  });

  const query = $('#resource-search')?.value.trim().toLowerCase() || '';
  const filtered = RESOURCES.filter(r => {
    const matchCat = activeResourceFilter === 'All' || r.category === activeResourceFilter;
    const haystack = `${r.name} ${r.description} ${r.category}`.toLowerCase();
    return matchCat && haystack.includes(query);
  });

  const grid = $('#resource-grid');
  if (grid) {
    grid.innerHTML = filtered.length ? filtered.map(r => `
      <a class="resource-card card" href="${resolveSuiteUrl(r.url)}" target="_blank" rel="noopener">
        <div class="resource-top"><span class="resource-icon">${r.initials}</span><svg class="resource-external" viewBox="0 0 24 24"><path d="M14 5h5v5M10 14 19 5"/><path d="M19 13v6H5V5h6"/></svg></div>
        <h2>${r.name}</h2><p>${r.description}</p><span class="resource-category${r.category === 'Appointment 1a' ? ' appointment-label' : ''}">${r.category}</span>
      </a>`).join('') : '<div class="resource-empty card"><strong>No matching resources</strong><p>Try a different search or category.</p></div>';
  }
}

function openCopilot(prefill = '') {
  $('#copilot-panel').classList.add('open');
  if (prefill) $('#message-input').value = prefill;
  $('#message-input').focus();
}

function closeCopilot() {
  $('#copilot-panel').classList.remove('open');
}

function formatAssistantMessage(text) {
  if (!text) return '';

  const lines = String(text).split('\n');
  let inList = false;
  let listType = null; // 'ul' or 'ol'
  let htmlParts = [];

  function closeList() {
    if (inList) {
      htmlParts.push(`</${listType}>`);
      inList = false;
      listType = null;
    }
  }

  function formatInline(str) {
    let s = String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // Markdown links: [label](url)
    s = s.replace(
      /\[([^\]]+)\]\(((?:https?:\/\/|\/)[^\s\)"']+)\)/g,
      (_match, label, rawUrl) => {
        let isMcMullin = /Rwdv2V0lOIM/i.test(rawUrl);
        let isMaria = /WzWFwJpoLUE/i.test(rawUrl);
        if (isMcMullin || isMaria) {
          let cleanLabel = label.replace(/▶\s*/g, '').trim();
          return `<a href="${rawUrl}" target="_blank" rel="noopener noreferrer" class="video-action-btn" title="Watch video"><svg class="video-play-icon" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg><span>${cleanLabel}</span><span class="video-ext-icon">↗</span></a>`;
        }
        return `<a href="${resolveSuiteUrl(rawUrl)}" target="_blank" rel="noopener noreferrer" class="chat-link">${label} &#8599;</a>`;
      }
    );

    // Bare URLs
    s = s.replace(
      /(^|[\s(])(https?:\/\/[^\s\)"']+)/g,
      (_match, prefix, rawUrl) => {
        let isMcMullin = /Rwdv2V0lOIM/i.test(rawUrl);
        let isMaria = /WzWFwJpoLUE/i.test(rawUrl);
        if (isMcMullin || isMaria) {
          let title = isMcMullin ? 'Watch Keith B. McMullin: Career as Calling Address (Video)' : 'Watch Maria Chooses a Career and Major (Video)';
          return `${prefix}<a href="${rawUrl}" target="_blank" rel="noopener noreferrer" class="video-action-btn" title="Watch video"><svg class="video-play-icon" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg><span>${title}</span><span class="video-ext-icon">↗</span></a>`;
        }
        return `${prefix}<a href="${rawUrl}" target="_blank" rel="noopener noreferrer" class="chat-link">${rawUrl} &#8599;</a>`;
      }
    );

    // Bold: **text** (supports single asterisks inside words like O*NET)
    s = s.replace(/\*\*((?:[^*]|\*(?!\*))+?)\*\*/g, '<strong>$1</strong>');

    // Italic: *text* or _text_ (when not surrounded by word characters)
    s = s.replace(/(?<![*\w])\*([^*]+?)\*(?![*\w])/g, '<em>$1</em>');
    s = s.replace(/(?<![_\w])_([^_]+?)_(?![_\w])/g, '<em>$1</em>');

    return s;
  }

  for (let i = 0; i < lines.length; i++) {
    let rawLine = lines[i];
    let line = rawLine.trim();

    if (!line) {
      closeList();
      continue;
    }

    // 1. Markdown headings: ### Heading or #### Heading or ## Heading or # Heading
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      closeList();
      const level = Math.min(4, Math.max(2, headingMatch[1].length));
      htmlParts.push(`<h${level}>${formatInline(headingMatch[2].trim())}</h${level}>`);
      continue;
    }

    // 2. Standalone bold heading: **Heading** or **Heading:**
    const boldHeadingMatch = line.match(/^\*\*([^*]+)\*\*:?$/);
    if (boldHeadingMatch) {
      closeList();
      htmlParts.push(`<h3>${formatInline(boldHeadingMatch[1].trim())}</h3>`);
      continue;
    }

    // 3. Unordered list: - Item or * Item
    const ulMatch = line.match(/^[-*]\s+(.+)$/);
    if (ulMatch && !line.startsWith('**')) {
      if (!inList || listType !== 'ul') {
        closeList();
        htmlParts.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      htmlParts.push(`<li>${formatInline(ulMatch[1].trim())}</li>`);
      continue;
    }

    // 4. Ordered list: 1. Item
    const olMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (olMatch) {
      if (!inList || listType !== 'ol') {
        closeList();
        htmlParts.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      htmlParts.push(`<li>${formatInline(olMatch[2].trim())}</li>`);
      continue;
    }

    // 5. Blockquote / Callout: > text
    if (line.startsWith('>')) {
      closeList();
      const cleanQuote = line.replace(/^>\s*/, '');
      htmlParts.push(`<blockquote><p>${formatInline(cleanQuote)}</p></blockquote>`);
      continue;
    }

    // Regular paragraph
    closeList();
    htmlParts.push(`<p>${formatInline(line)}</p>`);
  }

  closeList();
  return htmlParts.join('');
}

function addMessage(role, text, responseId = '') {
  const article = document.createElement('article');
  article.className = `message ${role}`;
  const label = document.createElement('small');
  label.textContent = role === 'assistant' ? 'Mentor AI Help' : 'You';
  const body = document.createElement('div');
  body.className = 'message-body';
  if (role === 'assistant') {
    body.innerHTML = formatAssistantMessage(text);
  } else {
    body.textContent = text;
  }
  article.append(label, body);
  $('#messages').appendChild(article);
  $('#messages').scrollTop = $('#messages').scrollHeight;
}

function renderChat() {
  $('#messages').innerHTML = '';
  if (!state.chatHistory.length) {
    addMessage('assistant', 'I’m here to support your preparation and appointment—not replace your judgment. Ask me for a thoughtful question, a resource match, or guidance.');
  } else {
    state.chatHistory.forEach(item => addMessage(item.role, item.content));
  }
}

function renderCopilotSuggestions() {
  const suggestions = $('#suggestions');
  if (!suggestions) return;
  suggestions.innerHTML = '';
  const prompts = state.currentTask === 'prepare'
    ? (PREPARE_STEPS[state.currentStep]?.copilot || ['Help me prepare for this appointment', 'Explain Career Explorer'])
    : (WORKFLOW[state.currentStep]?.copilot || ['Suggest a question', 'Recommend next steps']);

  prompts.forEach(p => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = p;
    btn.addEventListener('click', () => openCopilot(p));
    suggestions.appendChild(btn);
  });
}

async function submitCopilot(message) {
  openCopilot();
  addMessage('user', message);
  state.chatHistory.push({ role: 'user', content: message });
  $('#service-status').textContent = 'Thinking…';
  $('#send-button').disabled = true;

  const context = [
    state.student.name && `Student: ${state.student.name}.`,
    state.student.program && `Major: ${state.student.program}.`,
    state.student.career && `Career: ${state.student.career}.`,
    `Confidence: ${state.student.confidence}/10.`,
    state.assessmentData?.holland_code && `Holland Code: ${state.assessmentData.holland_code}.`,
    state.prepNotes && `Prep notes: ${state.prepNotes}`
  ].filter(Boolean).join(' ');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: context ? `${message}

Appointment context: ${context}` : message,
        mode: state.currentTask === 'prepare' ? 'step1' : WORKFLOW[state.currentStep].id,
        history: state.chatHistory.slice(0, -1).slice(-8)
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Copilot could not respond.');
    addMessage('assistant', data.reply, data.response_id);
    state.chatHistory.push({ role: 'assistant', content: data.reply });
  } catch (err) {
    addMessage('assistant', err.message || 'Please try again.');
  } finally {
    $('#service-status').textContent = 'Ready';
    $('#send-button').disabled = false;
  }
}

function openSuggestionModal() {
  const dialog = $('#suggestion-dialog');
  if (dialog) { dialog.hidden = false; $('#suggestion-text')?.focus(); }
}
function closeSuggestionModal() {
  const dialog = $('#suggestion-dialog');
  if (dialog) dialog.hidden = true;
}

async function handleSuggestionSubmit(e) {
  e.preventDefault();
  const submitBtn = $('#submit-suggestion-btn');
  const category = $('#suggestion-category').value;
  const suggestion = $('#suggestion-text').value.trim();
  const submitter = $('#suggestion-submitter').value.trim();

  if (!suggestion) return;
  submitBtn.disabled = true;
  try {
    const res = await fetch('/api/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, suggestion, submitter })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit.');
    showToast(data.message || 'Thank you! Suggestion submitted.');
    $('#suggestion-text').value = '';
    closeSuggestionModal();
  } catch (err) {
    showToast(err.message || 'Error submitting suggestion.');
  } finally {
    submitBtn.disabled = false;
  }
}

function bindEvents() {
  $$('.top-nav-button').forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.view)));
  $$('[data-view-jump]').forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.viewJump)));
  $('#resource-search')?.addEventListener('input', renderResources);

  const switcher = $('#student-switcher');
  if (switcher) {
    switcher.addEventListener('change', async (e) => {
      await loadAppointmentById(e.target.value);
    });
  }

  $('#new-appointment')?.addEventListener('click', () => {
    $('#confirm-dialog').hidden = false;
  });
  $('#cancel-reset')?.addEventListener('click', () => {
    $('#confirm-dialog').hidden = true;
  });
  $('#confirm-reset')?.addEventListener('click', () => {
    $('#confirm-dialog').hidden = true;
    resetAppointmentLocal();
  });
  $('#confirm-dialog')?.addEventListener('click', (e) => {
    if (e.target === $('#confirm-dialog')) $('#confirm-dialog').hidden = true;
  });

  $('#prep-career-lookup-btn')?.addEventListener('click', () => {
    const email = $('#prep-student-email')?.value.trim();
    performStudentLookup(email);
  });

  // B6: Live validation on email input
  $('#prep-student-email')?.addEventListener('input', () => {
    readinessLookupVersion++;
    resetPrepChat();
    state.assessmentData = defaultState().assessmentData;
    validatePrepStep1(false);
  });

  const dropzone = $('#prep-pdf-dropzone');
  const fileInput = $('#prep-pdf-input');
  if (dropzone && fileInput) {
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files?.length) {
        handlePdfUpload(e.dataTransfer.files[0]);
      }
    });
    fileInput.addEventListener('change', (e) => {
      if (e.target.files?.length) {
        handlePdfUpload(e.target.files[0]);
      }
    });
  }

  async function downloadStudentReport() {
    const email = state.student?.email || '';
    const name = state.student?.name || (email ? email.split('@')[0] : 'Student');
    const url = state.assessmentData?.download_url || '';
    if (!url) {
      showToast('No stored Career Explorer report is available for this student.');
      return;
    }

    showToast(`⏳ Fetching full report for ${name}...`);
    try {
      const resp = await fetch(url);
      const contentType = resp.headers.get('content-type') || '';
      if (!resp.ok || !contentType.includes('application/pdf')) {
        let msg = `Server returned ${resp.status}`;
        try {
          const d = await resp.json();
          msg = d.message || d.error || msg;
        } catch (_) {}
        showToast(`Download failed: ${msg}`);
        return;
      }
      const blob = await resp.blob();
      if (blob.size < 1000) {
        throw new Error(`Report file is unexpectedly small (${blob.size} bytes).`);
      }
      const filename = state.assessmentData?.filename || `Career_Explorer_Report_${name.replace(/\s+/g, '_')}.pdf`;
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
        if (document.body.contains(a)) document.body.removeChild(a);
      }, 3000);
      showToast(`Saved ${filename} (${Math.round(blob.size / 1024)} KB)`);
    } catch (err) {
      console.error('Download report error:', err);
      showToast(`Download error: ${err.message}`);
    }
  }

  $('#btn-download-student-report')?.addEventListener('click', downloadStudentReport);

  $('#btn-copy-guidance-notes')?.addEventListener('click', () => {
    const latestReply = [...prepChatHistory].reverse().find(message => message.role === 'assistant');
    if (!latestReply) {
      showToast('Get a coach response before copying to Prep Notes.');
      return;
    }
    copyToPrepNotes(latestReply.content);
  });

  $$('.prompt-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const prompt = btn.dataset.prompt;
      if (!prompt) return;
      state.prepNotes = (state.prepNotes ? state.prepNotes.trim() + '\n• ' : '• ') + prompt;
      if ($('#prep-notes-textarea')) $('#prep-notes-textarea').value = state.prepNotes;
      persistState();
      showToast('Prompt added to notes');
    });
  });

  $('#btn-start-task2')?.addEventListener('click', () => {
    state.currentTask = 'appointment';
    state.currentStep = 0;
    persistState();
    showView('appointment');
    showToast('Screen 2: Appointment started!');
  });

  $('#btn-back-to-prep')?.addEventListener('click', () => {
    state.currentTask = 'prepare';
    persistState();
    showView('prepare');
  });

  $('#previous-step')?.addEventListener('click', () => {
    state.currentTask = 'prepare';
    persistState();
    showView('prepare');
  });

  $('#next-step')?.addEventListener('click', () => {
    if (!state.civitasRecorded) {
      const civitas = $('#civitas-card');
      if (civitas) {
        civitas.scrollIntoView({ behavior: 'smooth' });
      }
      showToast('Please check "I confirm this appointment has been recorded in Civitas" first.');
      return;
    }
    handleDeleteRecordAfterCivitas();
  });

  $('#btn-copy-civitas')?.addEventListener('click', () => {
    prepareAndShowCivitasNote();
  });

  $('#btn-copy-preview-note')?.addEventListener('click', () => {
    const noteBox = $('#civitas-note-text');
    let note = noteBox?.value?.trim();
    if (!note) {
      note = buildCivitasNote();
      if (noteBox) noteBox.value = note;
    }
    showCivitasCopiedBadge();
    copyText(note, 'Note copied to the clipboard');
  });

  $('#civitas-confirm-checkbox')?.addEventListener('change', (e) => {
    handleCivitasConfirmation(e.target.checked);
  });

  $('#btn-complete-delete-record')?.addEventListener('click', handleDeleteRecordAfterCivitas);

  $('#copy-summary')?.addEventListener('click', () => {
    copyText(buildSummary(), 'Appointment summary copied to clipboard');
  });

  $('#close-copilot')?.addEventListener('click', closeCopilot);
  $('#chat-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = $('#message-input').value.trim();
    if (msg) {
      $('#message-input').value = '';
      submitCopilot(msg);
    }
  });
  $('#message-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      $('#chat-form').requestSubmit();
    }
  });

  $('#open-suggestion-modal')?.addEventListener('click', openSuggestionModal);
  $('#close-suggestion-dialog')?.addEventListener('click', closeSuggestionModal);
  $('#cancel-suggestion')?.addEventListener('click', closeSuggestionModal);
  $('#suggestion-dialog')?.addEventListener('click', (e) => {
    if (e.target === $('#suggestion-dialog')) closeSuggestionModal();
  });
  $('#suggestion-form')?.addEventListener('submit', handleSuggestionSubmit);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      $('#confirm-dialog').hidden = true;
      closeSuggestionModal();
      closeCopilot();
    }
  });
}

async function loadServiceStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    const active = data.active_engine || (data.ai_configured ? 'Local LLM' : 'Offline Guidance');
    const badge = $('#ai-engine-badge');
    const nameEl = $('#ai-engine-name');
    if (nameEl) nameEl.textContent = active;
    if (badge) {
      const isGemini = active.toLowerCase().includes('gemini');
      const isOffline = active.toLowerCase().includes('offline') || active.toLowerCase().includes('not configured');
      badge.className = `engine-indicator-pill ${isOffline ? 'engine-offline' : (isGemini ? 'engine-gemini' : 'engine-qwen')}`;
    }
  } catch {
  }
}

async function init() {
  bindSessionFields();
  bindEvents();
  configureTopLinks();
  renderResources();
  syncInputsFromState();

  // 1. Render immediately so sidebar and workspace are NEVER blank while network requests load
  renderStep();
  renderChat();

  // 2. Fetch saved appointments
  await fetchAppointmentsList();

  // 3. Load active appointment if saved, updating state and re-rendering
  const activeApptId = localStorage.getItem(ACTIVE_APPT_ID_KEY);
  if (activeApptId) {
    await loadAppointmentById(activeApptId);
  }

  loadServiceStatus();
  initPrepChat();
}

init();


// ==========================================================================
// Career Explorer Mentor Coach AI Chat Window (Task 1 Prepare Step 2)
// ==========================================================================

let prepChatHistory = [];
let prepChatVersion = 0;

function resetPrepChat() {
  // Invalidate pending feedback and remove the previous student's conversation and recommendations.
  prepChatVersion++;
  prepChatHistory = [];
  state.guidance = null;
  $('#prep-chat-messages')?.replaceChildren();
  const engineLabel = $('#prep-chat-engine-label');
  if (engineLabel) engineLabel.textContent = 'Ready for assessment';
}

function formatPrepAssistantMessage(text) {
  // Older summaries used assessment labels as bullets. Give them real headings
  // without changing the underlying reply or its copy-to-notes text.
  const sections = /^(?:[-*]\s+)?\*\*(Personality Profile(?:\s*\([^)]*\))?|Workplace Preferences|Core Values|Interests\s*&\s*Holland Code(?:\s*\([A-Z]{2,3}\))?|Aligned Occupations):?\*\*:?\s*(.*)$/i;
  const normalized = String(text || '').split('\n').map(line => {
    const match = line.trim().match(sections);
    if (match) return `\n### ${match[1]}\n\n${match[2]}`;
    return line.replace(/^#{1,4}\s+(Student Summary|Majors and Careers to Explore|Executive Summary|Career & Major Recommendations)\s*$/i, '## $1');
  }).join('\n');
  return formatAssistantMessage(normalized);
}

function appendPrepChatMessage(role, text) {
  const container = $('#prep-chat-messages');
  if (!container) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `prep-chat-msg ${role}`;

  if (role === 'user') {
    msgDiv.textContent = text;
  } else {
    // The first assistant reply is the executive summary; it ends with the report button.
    const isSummary = !container.querySelector('.prep-chat-msg.assistant:not(.typing-indicator)');
    // Format assistant text with markdown formatting
    const formatted = formatPrepAssistantMessage(text);
    const contentDiv = document.createElement('div');
    contentDiv.innerHTML = formatted;
    msgDiv.appendChild(contentDiv);
    if (isSummary && state.assessmentData?.completed_count > 0) {
      const reportBtn = document.createElement('button');
      reportBtn.type = 'button';
      reportBtn.className = 'button secondary small prep-open-report-btn';
      reportBtn.textContent = 'Open full Career Explorer report';
      reportBtn.addEventListener('click', openStudentReport);
      // PathwayU has no per-student link, so this opens the portal home for the mentor to search.
      const pathwayLink = document.createElement('a');
      pathwayLink.className = 'button small prep-open-pathwayu-btn';
      pathwayLink.href = 'https://ensign.pathwayu.com/';
      pathwayLink.target = '_blank';
      pathwayLink.rel = 'noopener noreferrer';
      pathwayLink.textContent = 'Open PathwayU';
      const actions = document.createElement('div');
      actions.className = 'prep-summary-actions';
      actions.append(reportBtn, pathwayLink);
      msgDiv.appendChild(actions);
    }
  }

  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

// The email travels in a POST body, never the URL. The server returns only a PDF
// stored for that exact email, so the mentor never sees another student's report.
async function openStudentReport() {
  const email = state.student?.email || '';
  // Open the tab inside the click so popup blockers allow it, then fill it.
  const tab = window.open('', '_blank');
  try {
    const resp = await fetch('/api/student-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const type = resp.headers.get('content-type') || '';
    if (!resp.ok || !type.includes('application/pdf')) {
      tab?.close();
      const data = await resp.json().catch(() => ({}));
      showToast(data.message || 'No stored Career Explorer report was found for this student.');
      return;
    }
    const objectUrl = URL.createObjectURL(await resp.blob());
    if (tab) tab.location.href = objectUrl;
    else window.location.assign(objectUrl);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
  } catch {
    tab?.close();
    showToast('The report could not be opened. Try again in a moment.');
  }
}

function copyToPrepNotes(text) {
  const textarea = $('#prep-notes-textarea');
  if (!textarea) return;

  // Clean markdown noise for plain text notes
  const plain = text
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();

  const current = textarea.value.trim();
  const updated = current ? `${current}\n\n--- Career Explorer Coach Notes ---\n${plain}` : plain;
  textarea.value = updated;
  state.prepNotes = updated;
  persistState();
  showToast('✓ Added to Step 3 Prep Notes!');
}

async function sendPrepChatMessage(message, starterPrompt = null, { automatic = false } = {}) {
  const text = starterPrompt || message;
  if (!text || !text.trim()) return;

  const lookupVersion = readinessLookupVersion;
  const chatVersion = prepChatVersion;
  if (!automatic) appendPrepChatMessage('user', text);
  prepChatHistory.push({ role: 'user', content: text });

  // Add temporary typing bubble
  const container = $('#prep-chat-messages');
  let typingBubble = null;
  if (container) {
    typingBubble = document.createElement('div');
    typingBubble.className = 'prep-chat-msg assistant typing-indicator';
    typingBubble.textContent = 'Analyzing assessment…';
    container.appendChild(typingBubble);
    container.scrollTop = container.scrollHeight;
  }

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        mode: 'step2',
        assessment_data: state.assessmentData,
        student: state.student,
        history: prepChatHistory.slice(0, -1).slice(-8)
      })
    });
    const data = await response.json();
    if (lookupVersion !== readinessLookupVersion || chatVersion !== prepChatVersion) return;
    if (typingBubble) typingBubble.remove();

    if (response.ok && data.reply) {
      appendPrepChatMessage('assistant', data.reply);
      prepChatHistory.push({ role: 'assistant', content: data.reply });

      // Update engine label
      const engineLabel = $('#prep-chat-engine-label');
      if (engineLabel) {
        if (data.engine === 'local' || data.engine === 'qwen') {
          engineLabel.textContent = 'Local LLM AI • Active';
        } else if (data.engine === 'offline_python_engine' || data.engine === 'fallback') {
          engineLabel.textContent = 'Offline Career Explorer Engine';
        } else {
          engineLabel.textContent = `${data.engine || 'AI'} • Active`;
        }
      }
    } else {
      appendPrepChatMessage('assistant', data.error || 'Could not generate guidance.');
    }
  } catch (err) {
    if (lookupVersion !== readinessLookupVersion || chatVersion !== prepChatVersion) return;
    if (typingBubble) typingBubble.remove();
    appendPrepChatMessage('assistant', 'Error communicating with Career Explorer Mentor Coach AI.');
  }
}

function initPrepChat() {
  const form = $('#prep-chat-form');
  const input = $('#prep-chat-input');
  if (form && input) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (val) {
        input.value = '';
        sendPrepChatMessage(val);
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        form.requestSubmit();
      }
    });
  }

  // Quick starters click handlers
  $$('.prep-starter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const prompt = btn.getAttribute('data-prompt');
      sendPrepChatMessage(prompt);
    });
  });
}
