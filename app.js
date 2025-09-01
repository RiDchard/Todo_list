// DOM refs
const input    = document.getElementById('todo-input');
const addBtn   = document.getElementById('add-todo');
const clearBtn = document.getElementById('clear-completed');
const list     = document.getElementById('todo-list');

// Filters
const filterBtns = document.querySelectorAll('.filter-btn');
const counts = {
  total: document.getElementById('count-total'),
  active: document.getElementById('count-active'),
  completed: document.getElementById('count-completed'),
};

// State
let todos = [];
let currentFilter = localStorage.getItem('filter') || 'all'; // all | active | completed

// Storage
function loadTodos() {
  const raw = localStorage.getItem('todos');
  todos = raw ? JSON.parse(raw) : [];
}
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// Counters
function updateCounts() {
  const total = todos.length;
  const completed = todos.filter(t => t.done).length;
  const active = total - completed;
  counts.total.textContent = total;
  counts.active.textContent = active;
  counts.completed.textContent = completed;
}

// Clear button visibility
function updateClearBtn() {
  const doneCount = todos.filter(t => t.done).length;
  clearBtn.hidden = doneCount === 0;
}

// Build <li>
function createTodoLi(todo) {
  const li = document.createElement('li');
  li.dataset.id = todo.id;
  if (todo.done) li.classList.add('done');

  const textSpan = document.createElement('span');
  textSpan.className = 'text';
  textSpan.textContent = todo.text;

  const delBtn = document.createElement('button');
  delBtn.className = 'delete';
  delBtn.textContent = '×';
  delBtn.setAttribute('aria-label', 'Delete task');

  li.append(textSpan, delBtn);
  return li;
}

// Initial render
function renderInitial() {
  list.innerHTML = '';
  todos.forEach(t => list.appendChild(createTodoLi(t)));
  applyFilter();        // ensure visibility matches stored filter
  updateCounts();
  updateClearBtn();
  markActiveFilterButton();
}

// Add
function addTodo() {
  const text = input.value.trim();
  if (!text) return;
  const todo = { id: Date.now(), text, done: false };
  todos.push(todo); saveTodos();

  const li = createTodoLi(todo);
  list.appendChild(li);

  addBtn.classList.add('pulse');
  setTimeout(() => addBtn.classList.remove('pulse'), 200);

  input.value = ''; input.focus();

  updateCounts(); updateClearBtn(); applyFilter();
}

// Toggle done
function toggleDone(id, li) {
  const item = todos.find(t => t.id === id);
  if (!item) return;
  item.done = !item.done; saveTodos();

  li.classList.toggle('done');
  updateCounts(); updateClearBtn(); applyFilter();
}

// Delete
function deleteTodo(id, li) {
  li.classList.add('removing');
  li.addEventListener('transitionend', () => {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    li.remove();
    updateCounts(); updateClearBtn(); applyFilter();
  }, { once: true });
}

// Clear completed
function clearCompleted() {
  const doneLis = Array.from(list.querySelectorAll('li.done'));
  if (doneLis.length === 0) return;
  clearBtn.classList.add('pulse');
  setTimeout(() => clearBtn.classList.remove('pulse'), 200);

  let processed = 0;
  doneLis.forEach(li => {
    li.classList.add('removing');
    li.addEventListener('transitionend', () => {
      li.remove();
      processed++;
      if (processed === doneLis.length) {
        todos = todos.filter(t => !t.done);
        saveTodos();
        updateCounts(); updateClearBtn(); applyFilter();
      }
    }, { once: true });
  });
}

// Filter helpers
function setFilter(name) {
  currentFilter = name;            // all | active | completed
  localStorage.setItem('filter', name);
  markActiveFilterButton();
  applyFilter();
}
function markActiveFilterButton() {
  filterBtns.forEach(btn => {
    const active = btn.dataset.filter === currentFilter;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
  });
}
function applyFilter() {
  // We don't re-render; we toggle a .hidden class per item
  const lis = list.querySelectorAll('li');
  lis.forEach(li => {
    const done = li.classList.contains('done');
    let show = true;
    if (currentFilter === 'active') show = !done;
    if (currentFilter === 'completed') show = done;
    li.classList.toggle('hidden', !show);
  });
}

// Events
addBtn.addEventListener('click', addTodo);
clearBtn.addEventListener('click', clearCompleted);

input.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTodo(); });

list.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (!li) return;
  const id = Number(li.dataset.id);
  if (e.target.classList.contains('delete')) { deleteTodo(id, li); return; }
  if (e.target.classList.contains('text') || e.target === li) { toggleDone(id, li); }
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => setFilter(btn.dataset.filter));
});

// Boot
loadTodos();
renderInitial();
// restore filter choice on load
setFilter(currentFilter);
