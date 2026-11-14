const studentStorageKey = "horizon.demo.students";
const teacherStorageKey = "horizon.demo.teachers";
const applicationStorageKey = "horizon.demo.applications";
const roleStorageKey = "horizon.demo.role";

const demoStudents = [
  {
    id: "student-1",
    name: "Camille Durand",
    code: "ETU-0001",
    email: "camille@example.fr",
    phone: "06 00 00 00 01",
    program: "Management & stratégie",
    grade: "15/20",
    attendance: "96 %",
    notes: "Projet de fin de semestre en cours."
  },
  {
    id: "student-2",
    name: "Yanis El Amrani",
    code: "ETU-0002",
    email: "yanis@example.fr",
    phone: "06 00 00 00 02",
    program: "Design numérique & UX",
    grade: "14/20",
    attendance: "92 %",
    notes: "À accompagner sur le prochain devoir."
  }
];

const demoTeachers = [
  {
    id: "teacher-1",
    name: "Claire Martin",
    email: "claire@example.fr",
    phone: "06 00 00 01 01",
    subject: "Management & stratégie"
  },
  {
    id: "teacher-2",
    name: "Thomas Bernard",
    email: "thomas@example.fr",
    phone: "06 00 00 01 02",
    subject: "Numérique & design"
  }
];

const loginPanel = document.querySelector("#login-panel");
const loginForm = document.querySelector("#login-form");
const loginError = document.querySelector("#login-error");
const workspace = document.querySelector("#workspace");
const studentsList = document.querySelector("#students-list");
const teachersList = document.querySelector("#teachers-list");
const applicationsList = document.querySelector("#applications-list");
const studentForm = document.querySelector("#student-form");
const teacherForm = document.querySelector("#teacher-form");
const paymentForm = document.querySelector("#payment-form");
const studentsTab = document.querySelector("#students-tab");
const teachersTab = document.querySelector("#teachers-tab");
const applicationsTab = document.querySelector("#applications-tab");
const paymentsTab = document.querySelector("#payments-tab");
const studentsPanel = document.querySelector("#students-panel");
const teachersPanel = document.querySelector("#teachers-panel");
const applicationsPanel = document.querySelector("#applications-panel");
const paymentsPanel = document.querySelector("#payments-panel");
const studentSearch = document.querySelector("#student-search");
const workspaceNotice = document.querySelector("#workspace-notice");
const defaultWorkspaceNotice =
  "Prototype local : les modifications sont enregistrées dans ce navigateur uniquement, sans contrôle d’accès réel.";

let currentRole = null;
let students = loadRecords(studentStorageKey, demoStudents);
let teachers = loadRecords(teacherStorageKey, demoTeachers);
let applications = loadRecords(applicationStorageKey, []);

function loadRecords(key, initialRecords) {
  const savedRecords = localStorage.getItem(key);
  if (savedRecords === null) {
    localStorage.setItem(key, JSON.stringify(initialRecords));
    return initialRecords;
  }

  const records = JSON.parse(savedRecords);
  if (!Array.isArray(records)) {
    throw new Error(`Les données enregistrées dans ${key} sont invalides.`);
  }
  return records;
}

function saveRecords(key, records) {
  try {
    localStorage.setItem(key, JSON.stringify(records));
  } catch (error) {
    document.querySelector("#workspace-notice").textContent =
      "Impossible d’enregistrer les changements dans ce navigateur. Vérifiez l’espace disponible et les paramètres de stockage.";
    throw error;
  }
}

function createCell(value) {
  const cell = document.createElement("td");
  cell.textContent = value || "—";
  return cell;
}

function createActionCell(recordId, recordType) {
  const cell = document.createElement("td");
  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "portal-action";
  editButton.dataset.action = "edit";
  editButton.dataset.id = recordId;
  editButton.dataset.type = recordType;
  editButton.textContent = "Modifier";

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "portal-action portal-action-danger";
  deleteButton.dataset.action = "delete";
  deleteButton.dataset.id = recordId;
  deleteButton.dataset.type = recordType;
  deleteButton.textContent = "Supprimer";

  cell.append(editButton, deleteButton);
  return cell;
}

function renderStudents() {
  const query = studentSearch.value.trim().toLocaleLowerCase("fr");
  const visibleStudents = students.filter((student) =>
    [student.name, student.code, student.email, student.phone, student.program, student.notes]
      .some((value) => (value || "").toLocaleLowerCase("fr").includes(query))
  );
  studentsList.replaceChildren();

  visibleStudents.forEach((student) => {
    const row = document.createElement("tr");
    [
      student.name,
      student.code,
      student.email,
      student.phone,
      student.birthDate,
      student.level,
      student.address,
      student.program,
      student.grade,
      student.attendance,
      student.applicationMessage,
      student.notes
    ].forEach((value) => row.append(createCell(value)));
    if (currentRole === "admin") {
      row.append(createActionCell(student.id, "student"));
    }
    studentsList.append(row);
  });

  document.querySelector("#students-empty").hidden = visibleStudents.length > 0;
}

function renderTeachers() {
  teachersList.replaceChildren();
  teachers.forEach((teacher) => {
    const row = document.createElement("tr");
    [teacher.name, teacher.email, teacher.phone, teacher.subject]
      .forEach((value) => row.append(createCell(value)));
    if (currentRole === "admin") {
      row.append(createActionCell(teacher.id, "teacher"));
    }
    teachersList.append(row);
  });
  document.querySelector("#teachers-empty").hidden = teachers.length > 0;
}

function renderApplications() {
  applicationsList.replaceChildren();
  applications.forEach((application) => {
    const row = document.createElement("tr");
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    const detailsText = document.createElement("p");
    summary.textContent = "Voir les détails";
    detailsText.textContent = [
      application.birthDate ? `Naissance : ${application.birthDate}` : "",
      application.address ? `Adresse : ${application.address}` : "",
      application.message ? `Projet : ${application.message}` : ""
    ].filter(Boolean).join(" — ") || "Aucun détail supplémentaire.";
    details.append(summary, detailsText);
    const detailsCell = document.createElement("td");
    detailsCell.append(details);

    row.append(
      createCell(application.name),
      createCell([application.email, application.phone].filter(Boolean).join(" · ")),
      createCell(application.program),
      createCell(application.level),
      createCell(new Date(application.submittedAt).toLocaleDateString("fr-FR")),
      detailsCell
    );
    row.append(createCell(
      application.status === "enrolled" ? "Inscrit" :
        application.status === "rejected" ? "Refusée" : "En attente"
    ));

    const actions = document.createElement("td");
    if (application.status === "pending") {
      const enrollButton = document.createElement("button");
      enrollButton.type = "button";
      enrollButton.className = "portal-action";
      enrollButton.dataset.action = "enroll";
      enrollButton.dataset.type = "application";
      enrollButton.dataset.id = application.id;
      enrollButton.textContent = "Inscrire";

      const rejectButton = document.createElement("button");
      rejectButton.type = "button";
      rejectButton.className = "portal-action portal-action-danger";
      rejectButton.dataset.action = "reject";
      rejectButton.dataset.type = "application";
      rejectButton.dataset.id = application.id;
      rejectButton.textContent = "Refuser";
      actions.append(enrollButton, rejectButton);
    }
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "portal-action portal-action-danger";
    deleteButton.dataset.action = "delete";
    deleteButton.dataset.type = "application";
    deleteButton.dataset.id = application.id;
    deleteButton.textContent = "Supprimer";
    actions.append(deleteButton);
    row.append(actions);
    applicationsList.append(row);
  });
  document.querySelector("#applications-empty").hidden = applications.length > 0;
}

function formatMad(amount) {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD"
  }).format(Number(amount) || 0);
}

function renderPayments() {
  const paymentStudentSelect = document.querySelector("#payment-student");
  const selectedStudentId = paymentStudentSelect.value;
  paymentStudentSelect.replaceChildren();
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Choisir un élève";
  paymentStudentSelect.append(defaultOption);
  students.forEach((student) => {
    const option = document.createElement("option");
    option.value = student.id;
    option.textContent = `${student.name} (${student.code})`;
    paymentStudentSelect.append(option);
  });
  paymentStudentSelect.value = selectedStudentId;

  const paymentsList = document.querySelector("#payments-list");
  paymentsList.replaceChildren();
  students.forEach((student) => {
    const payments = Array.isArray(student.payments) ? student.payments : [];
    const totalPaid = payments.reduce((total, payment) => total + (Number(payment.amount) || 0), 0);
    const amountDue = Number(student.feeDue) || 0;
    const history = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = `${payments.length} versement${payments.length > 1 ? "s" : ""}`;
    history.append(summary);
    if (payments.length) {
      const list = document.createElement("ul");
      list.className = "payment-history";
      payments.forEach((payment) => {
        const item = document.createElement("li");
        item.textContent = [
          payment.date,
          formatMad(payment.amount),
          payment.method,
          payment.reference
        ].filter(Boolean).join(" · ");
        list.append(item);
      });
      history.append(list);
    }

    const row = document.createElement("tr");
    row.append(
      createCell(student.name),
      createCell(student.code),
      createCell(formatMad(amountDue)),
      createCell(formatMad(totalPaid)),
      createCell(formatMad(amountDue - totalPaid))
    );
    const historyCell = document.createElement("td");
    historyCell.append(history);
    row.append(historyCell);

    const actionCell = document.createElement("td");
    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "portal-action";
    addButton.dataset.action = "add-payment";
    addButton.dataset.type = "payment";
    addButton.dataset.id = student.id;
    addButton.textContent = "Ajouter";
    actionCell.append(addButton);
    const feeButton = document.createElement("button");
    feeButton.type = "button";
    feeButton.className = "portal-action";
    feeButton.dataset.action = "edit-student";
    feeButton.dataset.type = "payment";
    feeButton.dataset.id = student.id;
    feeButton.textContent = "Modifier frais";
    actionCell.append(feeButton);
    row.append(actionCell);
    paymentsList.append(row);
  });
  document.querySelector("#payments-empty").hidden = students.length > 0;
}

function showPanel(panelName) {
  const panels = {
    students: [studentsPanel, studentsTab],
    teachers: [teachersPanel, teachersTab],
    applications: [applicationsPanel, applicationsTab],
    payments: [paymentsPanel, paymentsTab]
  };
  Object.entries(panels).forEach(([name, [panel, tab]]) => {
    const isActive = name === panelName;
    panel.hidden = !isActive;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
}

function showWorkspace(role) {
  currentRole = role;
  loginPanel.hidden = true;
  workspace.hidden = false;
  document.querySelector("#workspace-title").textContent =
    role === "admin" ? "Espace administrateur" : "Espace enseignant";

  document.querySelectorAll(".admin-only").forEach((element) => {
    element.hidden = role !== "admin";
  });
  teachersTab.hidden = role !== "admin";
  applicationsTab.hidden = role !== "admin";
  paymentsTab.hidden = role !== "admin";
  if (role === "teacher") {
    workspaceNotice.textContent = defaultWorkspaceNotice;
    showPanel("students");
    teachersList.replaceChildren();
    applicationsList.replaceChildren();
    document.querySelector("#payments-list").replaceChildren();
  } else {
    renderTeachers();
    renderApplications();
    renderPayments();
  }
  renderStudents();
}

function resetForm(form, title, defaultTitle) {
  form.reset();
  form.elements.recordId.value = "";
  document.querySelector(title).textContent = defaultTitle;
  form.hidden = true;
  form.querySelector('[role="alert"]').hidden = true;
}

function openForm(form, record, title, addTitle, editTitle) {
  form.reset();
  form.elements.recordId.value = record ? record.id : "";
  if (record) {
    Object.entries(record).forEach(([key, value]) => {
      if (key !== "id" && form.elements.namedItem(key)) {
        form.elements.namedItem(key).value = value;
      }
    });
  }
  document.querySelector(title).textContent = record ? editTitle : addTitle;
  form.querySelector('[role="alert"]').hidden = true;
  form.hidden = false;
  form.querySelector("input:not([type=hidden])").focus();
}

function openPaymentForm(studentId) {
  if (!students.length) {
    document.querySelector("#workspace-notice").textContent =
      "Ajoutez d’abord un élève avant d’enregistrer un versement.";
    return;
  }
  paymentForm.reset();
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  document.querySelector("#payment-date").value = date.toISOString().slice(0, 10);
  renderPayments();
  if (studentId) {
    document.querySelector("#payment-student").value = studentId;
  }
  document.querySelector("#payment-error").hidden = true;
  paymentForm.hidden = false;
  document.querySelector("#payment-amount").focus();
}

function getFormValues(form, fields) {
  const values = Object.fromEntries(new FormData(form).entries());
  const recordId = values.recordId;
  const record = { id: recordId || `${Date.now()}-${Math.random().toString(16).slice(2)}` };
  fields.forEach((field) => {
    record[field] = typeof values[field] === "string" ? values[field].trim() : "";
  });
  return record;
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = loginForm.elements.email.value.trim().toLowerCase();
  const password = loginForm.elements.password.value;
  const role = loginForm.elements.role.value;
  const isAdmin = role === "admin" && email === "admin@demo.fr" && password === "admin123";
  const isTeacher = role === "teacher" && email === "enseignant@demo.fr" && password === "prof123";

  if (!isAdmin && !isTeacher) {
    loginError.textContent = "Identifiants incorrects pour le rôle sélectionné.";
    loginError.hidden = false;
    return;
  }

  loginError.hidden = true;
  sessionStorage.setItem(roleStorageKey, role);
  showWorkspace(role);
});

document.querySelector("#logout-button").addEventListener("click", () => {
  sessionStorage.removeItem(roleStorageKey);
  currentRole = null;
  workspace.hidden = true;
  loginPanel.hidden = false;
  loginForm.reset();
  resetForm(studentForm, "#student-form-title", "Ajouter un élève");
  resetForm(teacherForm, "#teacher-form-title", "Ajouter un enseignant");
  paymentForm.reset();
  paymentForm.hidden = true;
  document.querySelector("#payment-error").hidden = true;
  workspaceNotice.textContent = defaultWorkspaceNotice;
});

studentsTab.addEventListener("click", () => showPanel("students"));
teachersTab.addEventListener("click", () => showPanel("teachers"));
applicationsTab.addEventListener("click", () => showPanel("applications"));
paymentsTab.addEventListener("click", () => showPanel("payments"));
studentSearch.addEventListener("input", renderStudents);
document.querySelector("#add-payment-button").addEventListener("click", () => openPaymentForm());
document.querySelector("#cancel-payment").addEventListener("click", () => {
  paymentForm.reset();
  paymentForm.hidden = true;
  document.querySelector("#payment-error").hidden = true;
});

document.querySelector("#add-student-button").addEventListener("click", () =>
  openForm(studentForm, null, "#student-form-title", "Ajouter un élève", "Modifier un élève")
);
document.querySelector("#add-teacher-button").addEventListener("click", () =>
  openForm(teacherForm, null, "#teacher-form-title", "Ajouter un enseignant", "Modifier un enseignant")
);
document.querySelector("#cancel-student-edit").addEventListener("click", () =>
  resetForm(studentForm, "#student-form-title", "Ajouter un élève")
);
document.querySelector("#cancel-teacher-edit").addEventListener("click", () =>
  resetForm(teacherForm, "#teacher-form-title", "Ajouter un enseignant")
);

studentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const student = getFormValues(studentForm, [
    "name", "code", "email", "phone", "birthDate", "level", "address", "program",
    "feeDue", "grade", "attendance", "applicationMessage", "notes"
  ]);
  const existingStudent = students.find((item) => item.id === student.id);
  student.feeDue = Number(student.feeDue) || 0;
  student.payments = existingStudent && Array.isArray(existingStudent.payments)
    ? existingStudent.payments
    : [];
  const duplicateCode = students.some((item) =>
    item.code.toLocaleLowerCase("fr") === student.code.toLocaleLowerCase("fr") && item.id !== student.id
  );
  if (duplicateCode) {
    const error = document.querySelector("#student-error");
    error.textContent = "Cet identifiant élève est déjà utilisé.";
    error.hidden = false;
    return;
  }

  students = studentForm.elements.recordId.value
    ? students.map((item) => item.id === student.id ? student : item)
    : [...students, student];
  saveRecords(studentStorageKey, students);
  resetForm(studentForm, "#student-form-title", "Ajouter un élève");
  renderStudents();
  if (currentRole === "admin") {
    renderPayments();
  }
});

teacherForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const teacher = getFormValues(teacherForm, ["name", "email", "phone", "subject"]);
  teachers = teacherForm.elements.recordId.value
    ? teachers.map((item) => item.id === teacher.id ? teacher : item)
    : [...teachers, teacher];
  saveRecords(teacherStorageKey, teachers);
  resetForm(teacherForm, "#teacher-form-title", "Ajouter un enseignant");
  renderTeachers();
});

paymentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (currentRole !== "admin") {
    return;
  }
  const formValues = Object.fromEntries(new FormData(paymentForm).entries());
  const student = students.find((item) => item.id === formValues.studentId);
  const amount = Number(formValues.amount);
  const error = document.querySelector("#payment-error");
  if (!student || !Number.isFinite(amount) || amount <= 0 || !formValues.date) {
    error.textContent = "Sélectionnez un élève et saisissez un montant et une date valides.";
    error.hidden = false;
    return;
  }

  const payment = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    amount,
    date: formValues.date,
    method: formValues.method,
    reference: formValues.reference.trim()
  };
  student.payments = Array.isArray(student.payments) ? [...student.payments, payment] : [payment];
  saveRecords(studentStorageKey, students);
  paymentForm.reset();
  paymentForm.hidden = true;
  error.hidden = true;
  document.querySelector("#workspace-notice").textContent =
    `Versement de ${formatMad(amount)} enregistré pour ${student.name}.`;
  renderPayments();
});

workspace.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button || currentRole !== "admin") {
    return;
  }

  if (button.dataset.type === "application") {
    const application = applications.find((item) => item.id === button.dataset.id);
    if (!application) {
      return;
    }

    const feedback = document.querySelector("#applications-feedback");
    if (button.dataset.action === "delete" &&
        window.confirm(`Supprimer la demande de ${application.name} ?`)) {
      applications = applications.filter((item) => item.id !== application.id);
      saveRecords(applicationStorageKey, applications);
      feedback.hidden = true;
      renderApplications();
      return;
    }
    if (application.status !== "pending") {
      return;
    }

    if (button.dataset.action === "enroll") {
      const duplicateEmail = students.some((item) =>
        item.email && item.email.toLowerCase() === application.email.toLowerCase()
      );
      if (duplicateEmail) {
        feedback.textContent = "Un dossier élève utilise déjà cette adresse e-mail.";
        feedback.hidden = false;
        return;
      }

      let nextCode = students.length + 1;
      let code = `ETU-${String(nextCode).padStart(4, "0")}`;
      while (students.some((item) => item.code.toLowerCase() === code.toLowerCase())) {
        nextCode += 1;
        code = `ETU-${String(nextCode).padStart(4, "0")}`;
      }
      const student = {
        id: `application-${application.id}`,
        name: application.name,
        code,
        email: application.email,
        phone: application.phone,
        birthDate: application.birthDate,
        level: application.level,
        address: application.address,
        program: application.program,
        grade: "",
        attendance: "",
        applicationMessage: application.message,
        notes: ""
      };
      students = [...students, student];
      saveRecords(studentStorageKey, students);
      application.status = "enrolled";
      application.studentId = student.id;
      saveRecords(applicationStorageKey, applications);
      feedback.textContent = `${application.name} a été inscrit(e) sous l’identifiant ${code}.`;
      feedback.hidden = false;
      renderStudents();
      renderPayments();
    } else if (button.dataset.action === "reject") {
      application.status = "rejected";
      saveRecords(applicationStorageKey, applications);
      feedback.hidden = true;
    }
    renderApplications();
    return;
  }

  if (button.dataset.type === "payment") {
    if (button.dataset.action === "add-payment") {
      openPaymentForm(button.dataset.id);
    } else if (button.dataset.action === "edit-student") {
      const student = students.find((item) => item.id === button.dataset.id);
      if (student) {
        showPanel("students");
        openForm(studentForm, student, "#student-form-title", "Ajouter un élève", "Modifier un élève");
      }
    }
    return;
  }

  const isStudent = button.dataset.type === "student";
  const records = isStudent ? students : teachers;
  const record = records.find((item) => item.id === button.dataset.id);
  if (!record) {
    return;
  }

  if (button.dataset.action === "edit") {
    if (isStudent) {
      openForm(studentForm, record, "#student-form-title", "Ajouter un élève", "Modifier un élève");
    } else {
      openForm(teacherForm, record, "#teacher-form-title", "Ajouter un enseignant", "Modifier un enseignant");
    }
    return;
  }

  if (button.dataset.action === "delete" && window.confirm(`Supprimer le dossier de ${record.name} ?`)) {
    if (isStudent) {
      students = students.filter((item) => item.id !== record.id);
      saveRecords(studentStorageKey, students);
      renderStudents();
      renderPayments();
    } else {
      teachers = teachers.filter((item) => item.id !== record.id);
      saveRecords(teacherStorageKey, teachers);
      renderTeachers();
    }
  }
});

const activeRole = sessionStorage.getItem(roleStorageKey);
if (activeRole === "admin" || activeRole === "teacher") {
  showWorkspace(activeRole);
}
