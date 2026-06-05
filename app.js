const authSection = document.getElementById("authSection");
const dashboardSection = document.getElementById("dashboardSection");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");

const userEmail = document.getElementById("userEmail");

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const taskCounter = document.getElementById("taskCounter");

const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const fileInfo = document.getElementById("fileInfo");

let tasks = [];

function showDashboard(email) {
  authSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");
  userEmail.textContent = email;

  tasks = [
    { title: "Przygotować dokument", done: false },
    { title: "Sprawdzić Supabase", done: true },
    { title: "Wysłać projekt", done: false }
  ];

  renderTasks();
}

function showAuth() {
  dashboardSection.classList.add("hidden");
  authSection.classList.remove("hidden");

  emailInput.value = "";
  passwordInput.value = "";
  tasks = [];
  renderTasks();
}

function validateAuthForm() {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert("Wpisz e-mail i hasło.");
    return null;
  }

  if (password.length < 6) {
    alert("Hasło powinno mieć co najmniej 6 znaków.");
    return null;
  }

  return email;
}

loginBtn.addEventListener("click", () => {
  const email = validateAuthForm();

  if (!email) return;

  showDashboard(email);
});

registerBtn.addEventListener("click", () => {
  const email = validateAuthForm();

  if (!email) return;

  alert("Konto demonstracyjne zostało utworzone.");
  showDashboard(email);
});

logoutBtn.addEventListener("click", () => {
  showAuth();
});

function renderTasks() {
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    taskList.innerHTML = `
      <li class="empty-state">
        Nie masz jeszcze żadnych zadań. Dodaj pierwsze zadanie powyżej.
      </li>
    `;
  } else {
    tasks.forEach((task, index) => {
      const li = document.createElement("li");
      li.className = task.done ? "task done" : "task";

      li.innerHTML = `
        <label>
          <input type="checkbox" ${task.done ? "checked" : ""} data-index="${index}" />
          <span>${task.title}</span>
        </label>
        <button class="delete" data-index="${index}">Usuń</button>
      `;

      taskList.appendChild(li);
    });
  }

  updateCounter();
}

function updateCounter() {
  const all = tasks.length;
  const done = tasks.filter(task => task.done).length;

  if (all === 1) {
    taskCounter.textContent = "1 zadanie";
  } else {
    taskCounter.textContent = `${all} zadań, wykonane: ${done}`;
  }
}

addTaskBtn.addEventListener("click", () => {
  const title = taskInput.value.trim();

  if (!title) {
    alert("Wpisz treść zadania.");
    return;
  }

  tasks.push({
    title: title,
    done: false
  });

  taskInput.value = "";
  renderTasks();
});

taskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addTaskBtn.click();
  }
});

taskList.addEventListener("click", (event) => {
  if (event.target.matches('input[type="checkbox"]')) {
    const index = Number(event.target.dataset.index);
    tasks[index].done = event.target.checked;
    renderTasks();
  }

  if (event.target.classList.contains("delete")) {
    const index = Number(event.target.dataset.index);
    tasks.splice(index, 1);
    renderTasks();
  }
});

uploadBtn.addEventListener("click", () => {
  const file = fileInput.files[0];

  if (!file) {
    alert("Najpierw wybierz plik.");
    return;
  }

  fileInfo.textContent = `Wybrano plik: ${file.name}. W docelowej wersji zostanie zapisany w Supabase Storage.`;
});
