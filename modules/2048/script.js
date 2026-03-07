const gridContainer = document.getElementById('grid-container');
const tileContainer = document.getElementById('tile-container');
const scoreDisplay = document.getElementById('score');
const bestScoreDisplay = document.getElementById('best-score');
const messageDisplay = document.getElementById('game-message');
const retryButton = document.getElementById('retry-button');

let grid = [];
let score = 0;
let bestScore = localStorage.getItem('2048BestScore') || 0;
bestScoreDisplay.textContent = bestScore;

// Setup grid
function init() {
    grid = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    score = 0;
    updateScore();
    messageDisplay.style.display = 'none';

    // Clear containers
    gridContainer.innerHTML = '';
    tileContainer.innerHTML = '';

    // Create grid cells
    for (let i = 0; i < 16; i++) {
        let cell = document.createElement('div');
        cell.classList.add('grid-cell');
        gridContainer.appendChild(cell);
    }

    addRandomTile();
    addRandomTile();
    renderGrid();
}

function addRandomTile() {
    let emptyCells = [];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (grid[r][c] === 0) {
                emptyCells.push({r, c});
            }
        }
    }

    if (emptyCells.length > 0) {
        let randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
    }
}

function renderGrid() {
    tileContainer.innerHTML = '';

    // Calculate size dynamically
    const containerWidth = tileContainer.offsetWidth;
    // 15px gap, 4 columns -> 3 gaps * 15px = 45px
    const tileSize = (containerWidth - 45) / 4;

    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (grid[r][c] !== 0) {
                let tile = document.createElement('div');
                let value = grid[r][c];
                tile.classList.add('tile', `tile-${value > 2048 ? 'super' : value}`);
                tile.textContent = value;

                // Position calculations
                tile.style.width = `${tileSize}px`;
                tile.style.height = `${tileSize}px`;
                tile.style.top = `${r * (tileSize + 15)}px`;
                tile.style.left = `${c * (tileSize + 15)}px`;

                // Font sizing
                if (value < 100) tile.style.fontSize = `${tileSize * 0.5}px`;
                else if (value < 1000) tile.style.fontSize = `${tileSize * 0.4}px`;
                else tile.style.fontSize = `${tileSize * 0.3}px`;

                tileContainer.appendChild(tile);
            }
        }
    }
}

function updateScore() {
    scoreDisplay.textContent = score;
    if (score > bestScore) {
        bestScore = score;
        bestScoreDisplay.textContent = bestScore;
        localStorage.setItem('2048BestScore', bestScore);
    }
}

// Logic
function slideLine(line) {
    // Remove zeros
    let arr = line.filter(val => val);
    // Merge
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i+1]) {
            arr[i] *= 2;
            score += arr[i];
            arr[i+1] = 0;
        }
    }
    // Remove zeros again
    arr = arr.filter(val => val);
    // Pad with zeros
    while (arr.length < 4) {
        arr.push(0);
    }
    return arr;
}

function move(direction) {
    let oldGrid = JSON.stringify(grid);
    let moved = false;

    if (direction === 'left' || direction === 'right') {
        for (let r = 0; r < 4; r++) {
            let row = grid[r];
            if (direction === 'right') row.reverse();
            let newRow = slideLine(row);
            if (direction === 'right') newRow.reverse();
            grid[r] = newRow;
        }
    } else if (direction === 'up' || direction === 'down') {
        for (let c = 0; c < 4; c++) {
            let col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
            if (direction === 'down') col.reverse();
            let newCol = slideLine(col);
            if (direction === 'down') newCol.reverse();
            for (let r = 0; r < 4; r++) {
                grid[r][c] = newCol[r];
            }
        }
    }

    if (oldGrid !== JSON.stringify(grid)) {
        addRandomTile();
        updateScore();
        renderGrid();
        checkGameOver();
    }
}

function checkGameOver() {
    // Check for win
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (grid[r][c] === 2048) {
                // To keep it simple, we won't stop play after 2048, just show message
            }
        }
    }

    // Check for loss (no empty cells and no adjacent equal cells)
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (grid[r][c] === 0) return; // Still empty spaces
            if (r !== 3 && grid[r][c] === grid[r+1][c]) return; // Can merge down
            if (c !== 3 && grid[r][c] === grid[r][c+1]) return; // Can merge right
        }
    }

    // If we get here, game over
    messageDisplay.querySelector('p').textContent = 'Game Over!';
    messageDisplay.style.display = 'flex';
}

// Input handling
document.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowLeft': move('left'); break;
        case 'ArrowRight': move('right'); break;
        case 'ArrowUp': move('up'); break;
        case 'ArrowDown': move('down'); break;
    }
});

// Touch handling
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, {passive: false});

document.addEventListener('touchend', e => {
    if(!touchStartX || !touchStartY) return;

    let touchEndX = e.changedTouches[0].clientX;
    let touchEndY = e.changedTouches[0].clientY;

    let dx = touchEndX - touchStartX;
    let dy = touchEndY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal
        if (dx > 30) move('right');
        else if (dx < -30) move('left');
    } else {
        // Vertical
        if (dy > 30) move('down');
        else if (dy < -30) move('up');
    }

    touchStartX = 0;
    touchStartY = 0;
});

// Resize handling
window.addEventListener('resize', renderGrid);

retryButton.addEventListener('click', init);

// Start game
setTimeout(init, 100); // Small delay to let CSS load/calculate
