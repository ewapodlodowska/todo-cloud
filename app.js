const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

addTaskBtn.addEventListener("click", () => {
  const title = taskInput.value.trim();

  if (!title) {
    alert("Wpisz treść zadania.");
    return;
  }

  const li = document.createElement("li");
  li.className = "task";

  li.innerHTML = `
    <label>
      <input type="checkbox" />
      <span>${title}</span>
    </label>
    <button class="delete">Usuń</button>
  `;

  taskList.appendChild(li);
  taskInput.value = "";
});

taskList.addEventListener("click", (event) => {
  if (event.target.matches('input[type="checkbox"]')) {
    event.target.closest(".task").classList.toggle("done");
  }

  if (event.target.classList.contains("delete")) {
    event.target.closest(".task").remove();
  }
});
