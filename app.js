// =========================
// Grab references to DOM elements
// =========================
const input = document.getElementById("todo-input"); // text box
const addBtn = document.getElementById("add-todo"); // Add button
const clearBtn = document.getElementById("clear-completed"); // Clear completed
const list = document.getElementById("todo-list"); // <ul> container

// =========================
// State (single source of truth)
// Each todo item: { id, text, done }
// =========================
let todos = [];

/* Load previously saved tasks from localStorage.
 * localStorage stores strings only, so we parse JSON.
 */
function loadTodos() {
  try {
    const raw = localStorage.getItem("todos");
    todos = raw ? JSON.parse(raw) : [];
  } catch {
    todos = [];
  }
}

/* Save tasks to localStorage.
 * We stringify (serialize) our array into JSON-formatted text.
 */
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

/* Show or hide the Clear Completed button depending on how many tasks are done. */
function updateClearBtn() {
  const doneCount = todos.filter((t) => t.done).length;
  if (doneCount > 0) {
    clearBtn.hidden = false;
    clearBtn.removeAttribute("disabled");
    clearBtn.classList.remove("is-disabled");
  } else {
    clearBtn.hidden = true; // hide when nothing to clear
    // If you want to show but disable instead:
    // clearBtn.hidden = false;
    // clearBtn.setAttribute('disabled', 'true');
    // clearBtn.classList.add('is-disabled');
  }
}

/* Build a single <li> element for a todo.
 * We wrap the text in a <span class="text"> so only the text gets struck through.
 * We also add a delete button.
 */
function createTodoLi(todo) {
  const li = document.createElement("li");
  li.dataset.id = todo.id;
  if (todo.done) li.classList.add("done");

  // text element
  const textSpan = document.createElement("span");
  textSpan.className = "text";
  textSpan.textContent = todo.text;

  // delete button
  const delBtn = document.createElement("button");
  delBtn.className = "delete";
  delBtn.textContent = "×";
  delBtn.setAttribute("aria-label", "Delete task");

  li.appendChild(textSpan);
  li.appendChild(delBtn);
  return li;
}

/* Render all tasks (used only at initial load). */
function renderInitial() {
  list.innerHTML = "";
  todos.forEach((t) => list.appendChild(createTodoLi(t)));
}

/* Add a new task from the input field. */
function addTodo() {
  const text = input.value.trim();
  if (!text) return;

  const todo = { id: Date.now(), text, done: false };
  todos.push(todo);
  saveTodos();

  // Append only the new element (no full re-render).
  list.appendChild(createTodoLi(todo));

  // Button pulse effect.
  addBtn.classList.add("pulse");
  setTimeout(() => addBtn.classList.remove("pulse"), 200);

  input.value = "";
  input.focus();
  updateClearBtn();
}

/* Toggle the done state of a task (by id).
 * We also update the DOM node directly (without re-render).
 */
function toggleDone(id, li) {
  const item = todos.find((t) => t.id === id);
  if (!item) return;
  item.done = !item.done;
  saveTodos();

  li.classList.toggle("done");
  updateClearBtn();
}

/* Delete a task (smooth collapse animation). */
function deleteTodo(id, li) {
  li.classList.add("removing");
  li.addEventListener(
    "transitionend",
    () => {
      todos = todos.filter((t) => t.id !== id);
      saveTodos();
      li.remove();
      updateClearBtn();
    },
    { once: true }
  );
}

/* Remove all completed tasks. */
function clearCompleted() {
  const doneLis = Array.from(list.querySelectorAll("li.done"));
  if (doneLis.length === 0) return;

  // Visual feedback on the button
  clearBtn.classList.add("pulse");
  setTimeout(() => clearBtn.classList.remove("pulse"), 200);

  let finished = 0;
  doneLis.forEach((li) => {
    li.classList.add("removing");
    li.addEventListener(
      "transitionend",
      () => {
        li.remove();
        finished++;
        if (finished === doneLis.length) {
          todos = todos.filter((t) => !t.done);
          saveTodos();
          updateClearBtn();
        }
      },
      { once: true }
    );
  });
}

/* Event handlers */
// Add via click
addBtn.addEventListener("click", addTodo);
// Add via Enter key
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTodo();
});
// Clear completed
clearBtn.addEventListener("click", clearCompleted);
// Delegated click: toggle done or delete
list.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;
  const id = Number(li.dataset.id);

  if (e.target.classList.contains("delete")) {
    deleteTodo(id, li);
    return;
  }
  if (e.target.classList.contains("text") || e.target === li) {
    toggleDone(id, li);
  }
});

/* Boot: load & render */
loadTodos();
renderInitial();
updateClearBtn();

// Add this near other DOM references
const itemsLeftEl = document.getElementById("items-left"); // counter element

function updateItemsLeft() {
  // Count active (not done) todos
  const left = todos.filter((t) => !t.done).length;
  itemsLeftEl.textContent = `${left} item${left === 1 ? "" : "s"} left`;
}

function addTodo() {
  const text = input.value.trim();
  if (!text) return;

  const todo = { id: Date.now(), text, done: false };
  todos.push(todo);
  saveTodos();
  list.appendChild(createTodoLi(todo));
  addBtn.classList.add("pulse");
  setTimeout(() => addBtn.classList.remove("pulse"), 200);
  input.value = "";
  input.focus();
  updateClearBtn();
  updateItemsLeft(); // NEW
}

function toggleDone(id, li) {
  const item = todos.find((t) => t.id === id);
  if (!item) return;
  item.done = !item.done;
  saveTodos();
  li.classList.toggle("done");
  updateClearBtn();
  updateItemsLeft(); // NEW
}

function deleteTodo(id, li) {
  li.classList.add("removing");
  li.addEventListener(
    "transitionend",
    () => {
      todos = todos.filter((t) => t.id !== id);
      saveTodos();
      li.remove();
      updateClearBtn();
      updateItemsLeft(); // NEW
    },
    { once: true }
  );
}

function clearCompleted() {
  const doneLis = Array.from(list.querySelectorAll("li.done"));
  if (doneLis.length === 0) return;

  clearBtn.classList.add("pulse");
  setTimeout(() => clearBtn.classList.remove("pulse"), 200);

  let finished = 0;
  doneLis.forEach((li) => {
    li.classList.add("removing");
    li.addEventListener(
      "transitionend",
      () => {
        li.remove();
        finished++;
        if (finished === doneLis.length) {
          todos = todos.filter((t) => !t.done);
          saveTodos();
          updateClearBtn();
          updateItemsLeft(); // NEW
        }
      },
      { once: true }
    );
  });
}

// After initial render:
loadTodos();
renderInitial();
updateClearBtn();
updateItemsLeft(); // NEW

// Esc clears the input
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") input.value = "";
});
