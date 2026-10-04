let db;
let tasks = [];
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

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addTask();
});

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