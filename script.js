let timeLeft = 25 * 60; // 25 minutes in seconds
let timerId = null;
let isFocusing = false;

const timeDisplay = document.getElementById('time');
const startBtn = document.getElementById('start-timer');
const plantDisplay = document.getElementById('plant');
const themeToggle = document.getElementById('theme-toggle');

// Plant growth stages based on time remaining
function updatePlant() {
    const progress = 1 - (timeLeft / (25 * 60));
    if (progress > 0.8) plantDisplay.innerText = '🌳';
    else if (progress > 0.4) plantDisplay.innerText = '🌿';
    else plantDisplay.innerText = '🌱';
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timeDisplay.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    updatePlant();
}

function toggleTimer() {
    if (timerId === null) {
        // Start timer
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
                plantDisplay.innerText = '🌳';
                alert('Your study garden grew today! Time for a break.');
            }
        }, 1000);
    } else {
        // Pause timer
        clearInterval(timerId);
        timerId = null;
        isFocusing = false;
        startBtn.innerText = 'START';
    }
}

startBtn.addEventListener('click', toggleTimer);

// Simple Theme Switcher (Strawberry <-> Matcha)
themeToggle.addEventListener('click', () => {
    const html = document.documentElement;
    if (html.getAttribute('data-theme') === 'strawberry') {
        html.setAttribute('data-theme', 'matcha');
    } else {
        html.setAttribute('data-theme', 'strawberry');
    }
});

updateDisplay();
