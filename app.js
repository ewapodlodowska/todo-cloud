const SUPABASE_URL = "https://xijenfukrraduprwroam.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpamVuZnVrcnJhZHVwcndyb2FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NzU4OTQsImV4cCI6MjA5NjE1MTg5NH0.ZBHU56reQAhhts8Zco2B8ddthhbn9WkL2RbOJ6hTeIk";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const authSection = document.getElementById("authSection");
const dashboardSection = document.getElementById("dashboardSection");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");
const logoutBtn = document.getElementById("logoutBtn");

const authMessage = document.getElementById("authMessage");
const userEmail = document.getElementById("userEmail");

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const taskCounter = document.getElementById("taskCounter");

const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const fileInfo = document.getElementById("fileInfo");

let currentUser = null;
let currentTasks = [];

function setMessage(text, type = "info") {
  authMessage.textContent = text;
  authMessage.className = `hint ${type}`;
}

function isValidEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

function isStrongPassword(password) {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-ZĄĆĘŁŃÓŚŹŻ]/.test(password);
  const hasLowercase = /[a-ząćęłńóśźż]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  return minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
}

function getEmailAndPassword() {
  return {
    email: emailInput.value.trim(),
    password: passwordInput.value.trim()
  };
}

function validateEmailOnly(email) {
  if (!email) {
    setMessage("Wpisz adres e-mail.", "error");
    return false;
  }

  if (!isValidEmail(email)) {
    setMessage("Wpisz poprawny adres e-mail, np. test@test.pl.", "error");
    return false;
  }

  return true;
}

function validateLoginForm() {
  const { email, password } = getEmailAndPassword();

  if (!validateEmailOnly(email)) return null;

  if (!password) {
    setMessage("Wpisz hasło.", "error");
    return null;
  }

  return { email, password };
}

function validateRegisterForm() {
  const { email, password } = getEmailAndPassword();

  if (!validateEmailOnly(email)) return null;

  if (!password) {
    setMessage("Wpisz hasło.", "error");
    return null;
  }

  if (!isStrongPassword(password)) {
    setMessage(
      "Hasło jest zbyt słabe. Przy rejestracji hasło musi mieć minimum 8 znaków, małą literę, wielką literę, cyfrę i znak specjalny.",
      "error"
    );
    return null;
  }

  return { email, password };
}

async function showDashboard(user) {
  currentUser = user;

  authSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");

  userEmail.textContent = user.email;

  emailInput.value = "";
  passwordInput.value = "";
  setMessage("");

  await loadTasks();
}

function showAuth() {
  currentUser = null;
  currentTasks = [];

  dashboardSection.classList.add("hidden");
  authSection.classList.remove("hidden");

  taskList.innerHTML = "";
  taskCounter.textContent = "0 zadań";
  fileInfo.textContent = "";
}

registerBtn.addEventListener("click", async () => {
  const form = validateRegisterForm();
  if (!form) return;

  const { error } = await supabaseClient.auth.signUp({
    email: form.email,
    password: form.password
  });

  if (error) {
    setMessage("Błąd rejestracji: " + error.message, "error");
    return;
  }

  setMessage(
    "Konto zostało zarejestrowane. Teraz możesz się zalogować tym samym adresem e-mail i hasłem.",
    "success"
  );

  passwordInput.value = "";
});

loginBtn.addEventListener("click", async () => {
  const form = validateLoginForm();
  if (!form) return;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: form.email,
    password: form.password
  });

  if (error) {
    setMessage(
      "Nie udało się zalogować. Najpierw zarejestruj konto albo sprawdź e-mail i hasło.",
      "error"
    );
    return;
  }

  await showDashboard(data.user);
});

resetPasswordBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();

  if (!validateEmailOnly(email)) return;

  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin
  });

  if (error) {
    setMessage("Nie udało się wysłać wiadomości resetującej hasło: " + error.message, "error");
    return;
  }

  setMessage(
    "Jeśli konto istnieje, na podany adres e-mail zostanie wysłany link do resetowania hasła.",
    "success"
  );
});

logoutBtn.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  showAuth();
});

async function checkExistingSession() {
  const { data } = await supabaseClient.auth.getSession();

  if (data.session && data.session.user) {
    await showDashboard(data.session.user);
  } else {
    showAuth();
  }
}

async function loadTasks() {
  if (!currentUser) return;

  const { data, error } = await supabaseClient
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    alert("Błąd pobierania zadań: " + error.message);
    return;
  }

  currentTasks = data || [];
  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = "";

  if (currentTasks.length === 0) {
    taskList.innerHTML = `
      <li class="empty-state">
        Nie masz jeszcze żadnych zadań. Dodaj pierwsze zadanie powyżej.
      </li>
    `;
  } else {
    currentTasks.forEach((task) => {
      const li = document.createElement("li");
      li.className = task.is_done ? "task done" : "task";

      const safeTitle = escapeHtml(task.title);

      li.innerHTML = `
        <label>
          <input type="checkbox" ${task.is_done ? "checked" : ""} data-id="${task.id}" />
          <span>${safeTitle}</span>
        </label>
        <button class="delete" data-id="${task.id}">Usuń</button>
      `;

      taskList.appendChild(li);
    });
  }

  updateCounter();
}

function updateCounter() {
  const all = currentTasks.length;
  const done = currentTasks.filter(task => task.is_done).length;

  if (all === 1) {
    taskCounter.textContent = "1 zadanie";
  } else {
    taskCounter.textContent = `${all} zadań, wykonane: ${done}`;
  }
}

addTaskBtn.addEventListener("click", async () => {
  const title = taskInput.value.trim();

  if (!currentUser) {
    alert("Najpierw się zaloguj.");
    return;
  }

  if (!title) {
    alert("Wpisz treść zadania.");
    return;
  }

  const { error } = await supabaseClient
    .from("tasks")
    .insert({
      user_id: currentUser.id,
      title: title,
      is_done: false
    });

  if (error) {
    alert("Błąd dodawania zadania: " + error.message);
    return;
  }

  taskInput.value = "";
  await loadTasks();
});

taskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addTaskBtn.click();
  }
});

taskList.addEventListener("click", async (event) => {
  if (!currentUser) return;

  if (event.target.matches('input[type="checkbox"]')) {
    const taskId = event.target.dataset.id;
    const isDone = event.target.checked;

    const { error } = await supabaseClient
      .from("tasks")
      .update({ is_done: isDone })
      .eq("id", taskId);

    if (error) {
      alert("Błąd aktualizacji zadania: " + error.message);
      return;
    }

    await loadTasks();
  }

  if (event.target.classList.contains("delete")) {
    const taskId = event.target.dataset.id;

    const confirmed = confirm("Czy na pewno chcesz usunąć to zadanie?");
    if (!confirmed) return;

    const { error } = await supabaseClient
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      alert("Błąd usuwania zadania: " + error.message);
      return;
    }

    await loadTasks();
  }
});

uploadBtn.addEventListener("click", () => {
  const file = fileInput.files[0];

  if (!currentUser) {
    alert("Najpierw się zaloguj.");
    return;
  }

  if (!file) {
    alert("Najpierw wybierz plik.");
    return;
  }

  fileInfo.textContent = `Wybrano plik: ${file.name}. W kolejnym kroku podłączymy zapis do Supabase Storage.`;
});

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

checkExistingSession();
