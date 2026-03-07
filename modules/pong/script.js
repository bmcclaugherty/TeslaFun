const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerScoreDisplay = document.getElementById('player-score');
const computerScoreDisplay = document.getElementById('computer-score');

// Game objects
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speed: 5,
    velocityX: 5,
    velocityY: 5,
    color: "#0f0"
};

const user = {
    x: 0, // left side
    y: (canvas.height - 100) / 2, // -100 the height of paddle
    width: 10,
    height: 100,
    score: 0,
    color: "#fff"
};

const com = {
    x: canvas.width - 10, // right side
    y: (canvas.height - 100) / 2,
    width: 10,
    height: 100,
    score: 0,
    color: "#fff",
    speed: 4
};

const net = {
    x: (canvas.width - 2) / 2,
    y: 0,
    height: 10,
    width: 2,
    color: "#fff"
};

// Draw functions
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawArc(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

function drawNet() {
    for (let i = 0; i <= canvas.height; i += 15) {
        drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
}

// Reset ball
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = -ball.velocityX;
    ball.speed = 5;
}

// Collision detection
function collision(b, p) {
    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;

    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;

    return p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top;
}

// Update loop
function update() {
    // Move ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Simple AI
    let computerLevel = 0.1;
    com.y += (ball.y - (com.y + com.height / 2)) * computerLevel;

    // Ball wall collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY = -ball.velocityY;
    }

    // Check paddle collision
    let player = (ball.x + ball.radius < canvas.width / 2) ? user : com;

    if (collision(ball, player)) {
        // Where the ball hit the paddle
        let collidePoint = (ball.y - (player.y + player.height / 2));
        // Normalize the value between -1 and 1
        collidePoint = collidePoint / (player.height / 2);

        // Calculate angle in Radian
        let angleRad = (Math.PI / 4) * collidePoint;

        // Direction of the ball
        let direction = (ball.x + ball.radius < canvas.width / 2) ? 1 : -1;

        // Change vel X and Y
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);

        // Speed up
        ball.speed += 0.5;
    }

    // Score update
    if (ball.x - ball.radius < 0) {
        com.score++;
        computerScoreDisplay.textContent = com.score;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        user.score++;
        playerScoreDisplay.textContent = user.score;
        resetBall();
    }
}

// Render loop
function render() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, "rgba(0,0,0,0)"); // Transparent to let CSS bg show
    ctx.clearRect(0, 0, canvas.width, canvas.height); // actually clear it

    drawNet();
    drawRect(user.x, user.y, user.width, user.height, user.color);
    drawRect(com.x, com.y, com.width, com.height, com.color);
    drawArc(ball.x, ball.y, ball.radius, ball.color);
}

// Game loop
function game() {
    update();
    render();
    requestAnimationFrame(game);
}

// Controls
function getMousePos(evt) {
    let rect = canvas.getBoundingClientRect();
    // Calculate the scale factor since canvas might be scaled down by CSS
    let scaleY = canvas.height / rect.height;
    return {
        y: (evt.clientY - rect.top) * scaleY
    };
}

canvas.addEventListener("mousemove", evt => {
    let mousePos = getMousePos(evt);
    user.y = mousePos.y - user.height / 2;
});

canvas.addEventListener("touchmove", evt => {
    evt.preventDefault();
    let touch = evt.touches[0];
    let mousePos = getMousePos(touch);
    user.y = mousePos.y - user.height / 2;
}, {passive: false});

// Start game
game();
