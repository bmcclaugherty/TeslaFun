const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');

// Game states
let isPlaying = false;
let score = 0;
let animationId;

// Paddle
const paddle = {
    width: 100,
    height: 15,
    x: canvas.width / 2 - 50,
    y: canvas.height - 30,
    color: '#0ff',
    speed: 8,
    dx: 0
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    radius: 8,
    speed: 5,
    dx: 5 * (Math.random() > 0.5 ? 1 : -1),
    dy: -5,
    color: '#ff0'
};

// Bricks
const brickRowCount = 5;
const brickColumnCount = 9;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 60;
const brickOffsetLeft = 20;

let bricks = [];
const brickColors = ['#f00', '#f80', '#ff0', '#0f0', '#00f'];

function initBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1, color: brickColors[r] };
        }
    }
}

// Draw functions
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = paddle.color;
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = bricks[c][r].color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// Logic
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (
                    ball.x + ball.radius > b.x &&
                    ball.x - ball.radius < b.x + brickWidth &&
                    ball.y + ball.radius > b.y &&
                    ball.y - ball.radius < b.y + brickHeight
                ) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score += 10;
                    scoreDisplay.textContent = score;

                    // Check win
                    if (score === brickRowCount * brickColumnCount * 10) {
                        // Win game, speed up and reset bricks for next level
                        ball.speed *= 1.2;
                        initBricks();
                    }
                }
            }
        }
    }
}

function movePaddle() {
    paddle.x += paddle.dx;

    // Wall detection
    if (paddle.x < 0) {
        paddle.x = 0;
    } else if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (right/left)
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }

    // Wall collision (top)
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    // Paddle collision
    if (
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width &&
        ball.y + ball.radius > paddle.y &&
        ball.y - ball.radius < paddle.y + paddle.height
    ) {
        // Calculate hit position
        let hitPos = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);

        // Change angle based on hit position
        ball.dx = hitPos * ball.speed;
        ball.dy = -Math.sqrt(ball.speed * ball.speed - ball.dx * ball.dx);
    }

    // Bottom collision (lose)
    if (ball.y + ball.radius > canvas.height) {
        gameOver();
    }
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawBall();
    drawPaddle();
}

function update() {
    if (!isPlaying) return;

    movePaddle();
    moveBall();
    collisionDetection();
    draw();

    animationId = requestAnimationFrame(update);
}

// Game Flow
function startGame() {
    initBricks();
    paddle.x = canvas.width / 2 - paddle.width / 2;
    ball.x = canvas.width / 2;
    ball.y = paddle.y - 20;
    ball.dx = ball.speed * (Math.random() > 0.5 ? 1 : -1) * 0.7; // Angle slightly
    ball.dy = -ball.speed;
    score = 0;
    scoreDisplay.textContent = score;
    isPlaying = true;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    draw();
    update();
}

function gameOver() {
    isPlaying = false;
    cancelAnimationFrame(animationId);
    finalScoreDisplay.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// Inputs
function keyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right') paddle.dx = paddle.speed;
    else if (e.key === 'ArrowLeft' || e.key === 'Left') paddle.dx = -paddle.speed;
}

function keyUp(e) {
    if (
        e.key === 'ArrowRight' ||
        e.key === 'Right' ||
        e.key === 'ArrowLeft' ||
        e.key === 'Left'
    ) {
        paddle.dx = 0;
    }
}

// Touch/Mouse handling
function handleInteraction(x) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const canvasX = (x - rect.left) * scaleX;

    // Center paddle on interaction
    paddle.x = canvasX - paddle.width / 2;

    // Bounds check
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
}

canvas.addEventListener('mousemove', e => handleInteraction(e.clientX));

canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    handleInteraction(e.touches[0].clientX);
}, {passive: false});

startScreen.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

// Initial draw
initBricks();
draw();
