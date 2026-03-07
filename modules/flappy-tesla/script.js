const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const startMsg = document.getElementById('start-msg');

let width, height;
let score = 0;
let gameActive = false;
let frameCount = 0;

// Game constants
const GRAVITY = 0.25;
const JUMP_STRENGTH = -6;
const PIPE_SPEED = 3.5;
const PIPE_SPAWN_RATE = 100; // frames
const PIPE_WIDTH = 80;
const PIPE_GAP = 220;

let car = {
    x: 100,
    y: 0,
    velocity: 0,
    width: 60,
    height: 35,
    emoji: '🚗'
};

let pipes = [];

function init() {
    resize();
    resetGame();
    animate();
}

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    car.x = width * 0.2;
    car.y = height / 2;
}

function resetGame() {
    score = 0;
    scoreEl.textContent = score;
    car.y = height / 2;
    car.velocity = 0;
    pipes = [];
    frameCount = 0;
    gameActive = false;
    startMsg.style.display = 'block';
}

function jump() {
    if (!gameActive) {
        gameActive = true;
        startMsg.style.display = 'none';
    }
    car.velocity = JUMP_STRENGTH;
}

window.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
}, { passive: false });

window.addEventListener('mousedown', (e) => {
    jump();
});

function createPipe() {
    const minHeight = 100;
    const maxHeight = height - PIPE_GAP - minHeight;
    const pipeHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    
    pipes.push({
        x: width,
        topHeight: pipeHeight,
        bottomY: pipeHeight + PIPE_GAP,
        passed: false
    });
}

function drawCar() {
    ctx.font = `${car.height * 1.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Slight rotation based on velocity
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(Math.min(Math.PI/4, Math.max(-Math.PI/4, car.velocity * 0.1)));
    ctx.fillText(car.emoji, 0, 0);
    ctx.restore();
}

function drawPipes() {
    pipes.forEach(pipe => {
        // Draw Superchargers
        ctx.fillStyle = '#e82127'; // Tesla Red
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;

        // Top pipe
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);

        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, PIPE_WIDTH, height - pipe.bottomY);
        ctx.strokeRect(pipe.x, pipe.bottomY, PIPE_WIDTH, height - pipe.bottomY);

        // Decoration (Charging cable look)
        ctx.fillStyle = '#fff';
        ctx.fillRect(pipe.x + 10, pipe.topHeight - 30, PIPE_WIDTH - 20, 10);
        ctx.fillRect(pipe.x + 10, pipe.bottomY + 20, PIPE_WIDTH - 20, 10);
    });
}

function update() {
    if (!gameActive) return;

    car.velocity += GRAVITY;
    car.y += car.velocity;

    // Boundary check
    if (car.y + car.height/2 > height || car.y - car.height/2 < 0) {
        resetGame();
    }

    // Pipes update
    if (frameCount % PIPE_SPAWN_RATE === 0) {
        createPipe();
    }

    pipes.forEach((pipe, index) => {
        pipe.x -= PIPE_SPEED;

        // Collision detection
        if (car.x + car.width/2 > pipe.x && car.x - car.width/2 < pipe.x + PIPE_WIDTH) {
            if (car.y - car.height/2 < pipe.topHeight || car.y + car.height/2 > pipe.bottomY) {
                resetGame();
            }
        }

        // Score update
        if (!pipe.passed && car.x > pipe.x + PIPE_WIDTH) {
            pipe.passed = true;
            score++;
            scoreEl.textContent = score;
        }

        // Remove off-screen pipes
        if (pipe.x + PIPE_WIDTH < 0) {
            pipes.splice(index, 1);
        }
    });

    frameCount++;
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw background gradient (already in CSS, but can add clouds)
    update();
    drawPipes();
    drawCar();

    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
init();
