const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let gameInterval;
let gameSpeed = 100;
let isGameOver = false;

function initGame() {
    snake = [
        { x: 10, y: 10 },
    ];
    dx = 0;
    dy = 0;
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    isGameOver = false;
    placeFood();

    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
}

function gameLoop() {
    if (isGameOver) return;

    update();
    draw();
}

function update() {
    // Only move if we have a direction
    if (dx === 0 && dy === 0) return;

    // Calculate new head position
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Check collisions
    if (
        head.x < 0 || head.x >= tileCount ||
        head.y < 0 || head.y >= tileCount ||
        snake.some(segment => segment.x === head.x && segment.y === head.y)
    ) {
        gameOver();
        return;
    }

    snake.unshift(head); // Add new head

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreDisplay.textContent = `Score: ${score}`;
        placeFood();
        // Speed up game slightly as score increases, cap at 50ms
        if (gameSpeed > 50) {
            gameSpeed -= 2;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
    } else {
        snake.pop(); // Remove tail if no food eaten
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw food
    ctx.fillStyle = '#e82127';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

    // Draw snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#4CAF50' : '#81C784'; // Head is darker green
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function placeFood() {
    let newFood;
    let validPosition = false;

    while (!validPosition) {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };

        validPosition = !snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    }

    food = newFood;
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval);
    finalScoreDisplay.textContent = `Score: ${score}`;
    gameOverScreen.classList.remove('hidden');
}

document.addEventListener('keydown', e => {
    // Prevent default scrolling
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }

    if (isGameOver) return;

    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (e.key === 'ArrowLeft' && !goingRight) {
        dx = -1;
        dy = 0;
    } else if (e.key === 'ArrowUp' && !goingDown) {
        dx = 0;
        dy = -1;
    } else if (e.key === 'ArrowRight' && !goingLeft) {
        dx = 1;
        dy = 0;
    } else if (e.key === 'ArrowDown' && !goingUp) {
        dx = 0;
        dy = 1;
    }
});

startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', () => {
    gameSpeed = 100;
    initGame();
});

// Initial draw (just background)
draw();
