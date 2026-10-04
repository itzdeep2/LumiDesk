let db;
let tasks = [];
let notes = [];
let timeLeft = 1500;
let timerId = null;
let isFocusing = false;
let focusSessions = 0;

const timeDisplay = document.getElementById('time');
const startBtn = document.getElementById('start-timer');
const plantDisplay = document.getElementById('plant');
const themeToggle = document.getElementById('theme-toggle');
const taskInput = document.getElementById('new-task');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const notesGrid = document.getElementById('notes-grid');
const addNoteBtn = document.getElementById('add-note-btn');

const request = indexedDB.open('LumiDeskDB', 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    db.createObjectStore('workspace', { keyPath: 'id' });
};

request.onsuccess = function(event) {
    db = event.target.result;
    loadData();
};

function saveData() {
    const transaction = db.transaction(['workspace'], 'readwrite');
    const store = transaction.objectStore('workspace');
    store.put({ id: 'tasks', data: tasks });
    store.put({ id: 'notes', data: notes });
    store.put({ id: 'stats', data: { focusSessions: focusSessions } });
}

function loadData() {
    const transaction = db.transaction(['workspace'], 'readonly');
    const store = transaction.objectStore('workspace');

    const getTasks = store.get('tasks');
    getTasks.onsuccess = function() {
        if (getTasks.result) {
            tasks = getTasks.result.data;
            renderTasks();
        }
    };

    const getNotes = store.get('notes');
    getNotes.onsuccess = function() {
        if (getNotes.result) {
            notes = getNotes.result.data;
            renderNotes();
        }
    };

    const getStats = store.get('stats');
    getStats.onsuccess = function() {
        if (getStats.result) {
            focusSessions = getStats.result.data.focusSessions;
            updatePlant();
        }
    };
}

function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTask(index));

        const span = document.createElement('span');
        span.innerText = task.text;
        if (task.completed) {
            span.classList.add('completed-text');
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = '×';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', () => deleteTask(index));

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });
}

function addTask() {
    const text = taskInput.value.trim();
    if (text !== '') {
        tasks.push({ text: text, completed: false });
        taskInput.value = '';
        saveData();
        renderTasks();
    }
}

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveData();
    renderTasks();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveData();
    renderTasks();
}

function renderNotes() {
    notesGrid.innerHTML = '';
    notes.forEach((note, index) => {
        const div = document.createElement('div');
        div.classList.add('note-item');
        div.style.backgroundColor = note.color;

        const textarea = document.createElement('textarea');
        textarea.value = note.text;
        textarea.addEventListener('input', function() {
            notes[index].text = this.value;
            saveData();
        });

        const footer = document.createElement('div');
        footer.classList.add('note-footer');

        const colorPicker = document.createElement('div');
        colorPicker.classList.add('color-picker');

        const colors = ['#ffb3c6', '#fff3b0', '#aed9e0', '#c8b6ff', '#a5d6a7'];
        colors.forEach(colorHex => {
            const dot = document.createElement('div');
            dot.classList.add('color-dot');
            dot.style.backgroundColor = colorHex;
            dot.addEventListener('click', function() {
                notes[index].color = colorHex;
                saveData();
                renderNotes();
            });
            colorPicker.appendChild(dot);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = '×';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', () => deleteNote(index));

        footer.appendChild(colorPicker);
        footer.appendChild(deleteBtn);

        div.appendChild(textarea);
        div.appendChild(footer);
        notesGrid.appendChild(div);
    });
}

function addNote() {
    notes.unshift({ text: '', color: '#fff3b0' });
    saveData();
    renderNotes();
}

function deleteNote(index) {
    notes.splice(index, 1);
    saveData();
    renderNotes();
}

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addTask();
});
addNoteBtn.addEventListener('click', addNote);

function updatePlant() {
    const progress = 1 - (timeLeft / 1500);
    if (focusSessions > 0) {
        plantDisplay.innerText = '🌳';
    } else if (progress > 0.8) {
        plantDisplay.innerText = '🌳';
    } else if (progress > 0.4) {
        plantDisplay.innerText = '🌿';
    } else {
        plantDisplay.innerText = '🌱';
    }
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timeDisplay.innerText = minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    updatePlant();
}

function toggleTimer() {
    if (timerId === null) {
        isFocusing = true;
        startBtn.innerText = 'PAUSE';
        timerId = setInterval(() => {
            timeLeft--;
            updateDisplay();
            
            if (timeLeft === 0) {
                clearInterval(timerId);
                timerId = null;
                isFocusing = false;
                startBtn.innerText = 'START';
                focusSessions++;
                timeLeft = 1500;
                saveData();
                updateDisplay();
                alert('Your study garden grew today! Time for a break.');
            }
        }, 1000);
    } else {
        clearInterval(timerId);
        timerId = null;
        isFocusing = false;
        startBtn.innerText = 'START';
    }
}

startBtn.addEventListener('click', toggleTimer);

themeToggle.addEventListener('click', () => {
    const html = document.documentElement;
    if (html.getAttribute('data-theme') === 'strawberry') {
        html.setAttribute('data-theme', 'matcha');
    } else {
        html.setAttribute('data-theme', 'strawberry');
    }
});

updateDisplay();