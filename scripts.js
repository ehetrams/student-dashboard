
let appState = {
  subjects: [],
  assignments: [],
  exams: []
};


const form = document.getElementById("sub-form");
const nameInput = document.getElementById("sub-name");
const topicsInput = document.getElementById("sub-topics");
const container = document.getElementById("sub-cards-container");

const assignForm = document.getElementById("assign-form");
const assignTitle = document.getElementById("assign-title");
const assignDue = document.getElementById("assign-due");
const assignSubject = document.getElementById("assign-subject");
const assignContainer = document.getElementById("assignments-container");

const examForm = document.getElementById("exam-form");
const examDate = document.getElementById("exam-date");
const examSubject = document.getElementById("exam-subject");
const examTopics = document.getElementById("exam-topics");
const examContainer = document.getElementById("exams-container");

const summaryContainer = document.getElementById("dashboard-summary");
const todayDateEl = document.getElementById("today-date");


function saveState() {
  localStorage.setItem("appState", JSON.stringify(appState));
}
function loadState() {
  const saved = localStorage.getItem("appState");
  if (saved) appState = JSON.parse(saved);
}


function addSubject(name, totalTopics) {
  appState.subjects.push({
    id: Date.now().toString(),
    name: name,
    totalTopics: Number(totalTopics),
    completedTopics: [],
    allTopics: [],
    attendance: { present: 0, total: 0 }
  });
  saveState();
}

function renderSubjectDropdowns() {
  [assignSubject, examSubject].forEach(function (select) {
    select.innerHTML = "";
    appState.subjects.forEach(function (subject) {
      const option = document.createElement("option");
      option.value = subject.id;
      option.textContent = subject.name;
      select.appendChild(option);
    });
  });
}

function renderSubjects() {
  container.innerHTML = "";

  appState.subjects.forEach(function (subject) {
    const card = document.createElement("div");
    card.className = "sub-card";

    const attendancePct = subject.attendance.total > 0
      ? Math.round((subject.attendance.present / subject.attendance.total) * 100)
      : 0;
    const attendanceClass = attendancePct < 75 ? "low" : "ok";

    const syllabusPct = subject.allTopics.length > 0
      ? Math.round((subject.completedTopics.length / subject.allTopics.length) * 100)
      : 0;

    const topicsHtml = subject.allTopics.map(function (topic) {
      const checked = subject.completedTopics.includes(topic) ? "checked" : "";
      return `<label><input type="checkbox" class="topic-check" data-subject-id="${subject.id}" data-topic="${topic}" ${checked}/> ${topic}</label>`;
    }).join("");

    card.innerHTML = `
      <p class="sub-name">${subject.name}</p>
      <p class="topic-count">${subject.totalTopics} topics planned</p>

      <span class="attendance-badge ${attendanceClass}">
        Attendance: ${attendancePct}% (${subject.attendance.present}/${subject.attendance.total})
      </span>
      <div>
        <button class="present-btn" data-id="${subject.id}">+ Present</button>
        <button class="absent-btn" data-id="${subject.id}">+ Absent</button>
      </div>

      <p class="topic-count">Syllabus: ${syllabusPct}%</p>
      <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${syllabusPct}%"></div></div>
      <div class="topic-list">${topicsHtml}</div>
      <div class="add-topic-row">
        <input type="text" class="new-topic-input" data-id="${subject.id}" placeholder="New topic name"/>
        <button class="add-topic-btn" data-id="${subject.id}">Add</button>
      </div>

      <button class="dlt-btn" data-id="${subject.id}" style="margin-top:12px;">Delete Subject</button>
    `;

    container.appendChild(card);
  });

  renderSubjectDropdowns();
}

container.addEventListener("click", function (event) {
  const t = event.target;
  const id = t.dataset.id;

  if (t.classList.contains("dlt-btn")) {
    appState.subjects = appState.subjects.filter(function (s) { return s.id !== id; });
    appState.assignments = appState.assignments.filter(function (a) { return a.subjectId !== id; });
    appState.exams = appState.exams.filter(function (e) { return e.subjectId !== id; });
    saveState();
    renderAll();
  }

  if (t.classList.contains("present-btn") || t.classList.contains("absent-btn")) {
    const subject = appState.subjects.find(function (s) { return s.id === id; });
    subject.attendance.total++;
    if (t.classList.contains("present-btn")) subject.attendance.present++;
    saveState();
    renderSubjects();
    renderDashboard();
  }

  if (t.classList.contains("add-topic-btn")) {
    const input = document.querySelector(`.new-topic-input[data-id="${id}"]`);
    const topicName = input.value.trim();
    if (topicName) {
      const subject = appState.subjects.find(function (s) { return s.id === id; });
      subject.allTopics.push(topicName);
      saveState();
      renderSubjects();
      renderDashboard();
    }
  }
});

container.addEventListener("change", function (event) {
  if (event.target.classList.contains("topic-check")) {
    const subjectId = event.target.dataset.subjectId;
    const topic = event.target.dataset.topic;
    const subject = appState.subjects.find(function (s) { return s.id === subjectId; });
    if (event.target.checked) {
      subject.completedTopics.push(topic);
    } else {
      subject.completedTopics = subject.completedTopics.filter(function (tp) { return tp !== topic; });
    }
    saveState();
    renderSubjects();
    renderDashboard();
  }
});

form.addEventListener("submit", function (event) {
  event.preventDefault();
  const name = nameInput.value.trim();
  const totalTopics = topicsInput.value;
  if (!name) return;
  addSubject(name, totalTopics);
  renderAll();
  nameInput.value = "";
  topicsInput.value = "";
});


function renderAssignments() {
  assignContainer.innerHTML = "";
  const today = new Date().toISOString().split("T")[0];

  const sorted = [...appState.assignments].sort(function (a, b) {
    return a.dueDate.localeCompare(b.dueDate);
  });

  sorted.forEach(function (a) {
    const subject = appState.subjects.find(function (s) { return s.id === a.subjectId; });
    const isOverdue = a.dueDate < today && a.status !== "done";
    const item = document.createElement("div");
    item.className = "list-item" + (isOverdue ? " overdue" : "") + (a.status === "done" ? " done" : "");
    item.innerHTML = `
      <div>
        <strong>${a.title}</strong> — ${subject ? subject.name : "Unknown"}<br/>
        <span class="topic-count">Due: ${a.dueDate}</span>
      </div>
      <div class="list-item-actions">
        <button class="done-btn" data-id="${a.id}">${a.status === "done" ? "Undo" : "Mark Done"}</button>
        <button class="dlt-assign-btn" data-id="${a.id}">Delete</button>
      </div>
    `;
    assignContainer.appendChild(item);
  });
}

assignContainer.addEventListener("click", function (event) {
  const id = event.target.dataset.id;
  if (event.target.classList.contains("done-btn")) {
    const a = appState.assignments.find(function (x) { return x.id === id; });
    a.status = a.status === "done" ? "pending" : "done";
    saveState();
    renderAssignments();
    renderDashboard();
  }
  if (event.target.classList.contains("dlt-assign-btn")) {
    appState.assignments = appState.assignments.filter(function (x) { return x.id !== id; });
    saveState();
    renderAssignments();
    renderDashboard();
  }
});

assignForm.addEventListener("submit", function (event) {
  event.preventDefault();
  if (!assignTitle.value.trim() || !assignDue.value || !assignSubject.value) return;
  appState.assignments.push({
    id: Date.now().toString(),
    subjectId: assignSubject.value,
    title: assignTitle.value.trim(),
    dueDate: assignDue.value,
    status: "pending"
  });
  saveState();
  renderAssignments();
  renderDashboard();
  assignTitle.value = "";
  assignDue.value = "";
});


function renderExams() {
  examContainer.innerHTML = "";
  const today = new Date();

  const sorted = [...appState.exams].sort(function (a, b) {
    return a.date.localeCompare(b.date);
  });

  sorted.forEach(function (e) {
    const subject = appState.subjects.find(function (s) { return s.id === e.subjectId; });
    const daysLeft = Math.ceil((new Date(e.date) - today) / (1000 * 60 * 60 * 24));
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `
      <div>
        <strong>${subject ? subject.name : "Unknown"}</strong> — ${e.date} (${daysLeft} days left)<br/>
        <span class="topic-count">Revise: ${e.topicsToRevise.join(", ") || "—"}</span>
      </div>
      <div class="list-item-actions">
        <button class="dlt-exam-btn" data-id="${e.id}">Delete</button>
      </div>
    `;
    examContainer.appendChild(item);
  });
}

examContainer.addEventListener("click", function (event) {
  if (event.target.classList.contains("dlt-exam-btn")) {
    const id = event.target.dataset.id;
    appState.exams = appState.exams.filter(function (x) { return x.id !== id; });
    saveState();
    renderExams();
    renderDashboard();
  }
});

examForm.addEventListener("submit", function (event) {
  event.preventDefault();
  if (!examDate.value || !examSubject.value) return;
  const topics = examTopics.value.split(",").map(function (t) { return t.trim(); }).filter(Boolean);
  appState.exams.push({
    id: Date.now().toString(),
    subjectId: examSubject.value,
    date: examDate.value,
    topicsToRevise: topics
  });
  saveState();
  renderExams();
  renderDashboard();
  examDate.value = "";
  examTopics.value = "";
});


function renderDashboard() {
  const today = new Date();
  const weekFromNow = new Date();
  weekFromNow.setDate(today.getDate() + 7);

  const dueThisWeek = appState.assignments.filter(function (a) {
    const d = new Date(a.dueDate);
    return a.status !== "done" && d >= today && d <= weekFromNow;
  }).length;

  const lowAttendanceSubjects = appState.subjects.filter(function (s) {
    if (s.attendance.total === 0) return false;
    return (s.attendance.present / s.attendance.total) * 100 < 75;
  });

  const upcomingExams = [...appState.exams].sort(function (a, b) {
    return a.date.localeCompare(b.date);
  });
  const nextExam = upcomingExams[0];
  const nextExamDays = nextExam
    ? Math.ceil((new Date(nextExam.date) - today) / (1000 * 60 * 60 * 24))
    : null;

  let avgSyllabus = 0;
  if (appState.subjects.length > 0) {
    const total = appState.subjects.reduce(function (sum, s) {
      const pct = s.allTopics.length > 0 ? (s.completedTopics.length / s.allTopics.length) * 100 : 0;
      return sum + pct;
    }, 0);
    avgSyllabus = Math.round(total / appState.subjects.length);
  }

  summaryContainer.innerHTML = `
    <div class="summary-card"><h4>Due This Week</h4><p>${dueThisWeek}</p></div>
    <div class="summary-card"><h4>Low Attendance Subjects</h4><p>${lowAttendanceSubjects.length}</p>${lowAttendanceSubjects.map(function(s){return s.name;}).join(", ")}</div>
    <div class="summary-card"><h4>Next Exam</h4><p>${nextExam ? nextExamDays + " days" : "None"}</p></div>
    <div class="summary-card"><h4>Avg Syllabus Progress</h4><p>${avgSyllabus}%</p></div>
  `;
}


function renderAll() {
  renderSubjects();
  renderAssignments();
  renderExams();
  renderDashboard();
}


todayDateEl.textContent = "Today: " + new Date().toLocaleDateString();
loadState();
renderAll();