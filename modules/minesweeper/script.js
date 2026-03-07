const boardElement = document.getElementById('game-board');
const bombsLeftElement = document.getElementById('bombs-left');
const timeElement = document.getElementById('time');
const resetButton = document.getElementById('reset-button');
const modal = document.getElementById('game-over-modal');
const modalTitle = document.getElementById('modal-title');
const modalDesc = document.getElementById('modal-desc');
const playAgainButton = document.getElementById('play-again-button');

// Settings
const rows = 10;
const cols = 10;
const totalBombs = 10;

let board = [];
let gameOver = false;
let cellsRevealed = 0;
let flagsPlaced = 0;
let timerId = null;
let timeElapsed = 0;
let firstClick = true;

function initGame() {
    boardElement.innerHTML = '';
    boardElement.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    boardElement.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    board = [];
    gameOver = false;
    cellsRevealed = 0;
    flagsPlaced = 0;
    timeElapsed = 0;
    firstClick = true;

    bombsLeftElement.textContent = totalBombs;
    timeElement.textContent = timeElapsed;

    if(timerId) clearInterval(timerId);
    timerId = null;
    modal.style.display = 'none';

    // Create board structure
    for (let r = 0; r < rows; r++) {
        let rowArray = [];
        for (let c = 0; c < cols; c++) {
            let cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.r = r;
            cell.dataset.c = c;

            // Events
            cell.addEventListener('click', handleLeftClick);
            cell.addEventListener('contextmenu', handleRightClick);

            // Touch for flag (long press)
            let touchTimeout;
            cell.addEventListener('touchstart', (e) => {
                touchTimeout = setTimeout(() => {
                    handleRightClick(e);
                }, 500); // 500ms for long press
            }, {passive: true});
            cell.addEventListener('touchend', () => clearTimeout(touchTimeout));
            cell.addEventListener('touchmove', () => clearTimeout(touchTimeout));

            boardElement.appendChild(cell);
            rowArray.push({
                element: cell,
                isBomb: false,
                isRevealed: false,
                isFlagged: false,
                adjacentBombs: 0
            });
        }
        board.push(rowArray);
    }
}

function placeBombs(firstR, firstC) {
    let bombsPlaced = 0;
    while (bombsPlaced < totalBombs) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * cols);

        // Don't place on first clicked cell or existing bomb
        if (!board[r][c].isBomb && (r !== firstR || c !== firstC)) {
            board[r][c].isBomb = true;
            bombsPlaced++;
        }
    }

    // Calculate adjacent bombs
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!board[r][c].isBomb) {
                let count = 0;
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        let nr = r + i;
                        let nc = c + j;
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isBomb) {
                            count++;
                        }
                    }
                }
                board[r][c].adjacentBombs = count;
            }
        }
    }
}

function handleLeftClick(e) {
    if (gameOver) return;

    let r = parseInt(e.target.dataset.r);
    let c = parseInt(e.target.dataset.c);
    let cellObj = board[r][c];

    if (cellObj.isRevealed || cellObj.isFlagged) return;

    if (firstClick) {
        firstClick = false;
        placeBombs(r, c);
        startTimer();
    }

    if (cellObj.isBomb) {
        // Boom
        revealAll();
        cellObj.element.style.background = 'red';
        endGame(false);
    } else {
        revealCell(r, c);
        checkWin();
    }
}

function handleRightClick(e) {
    e.preventDefault();
    if (gameOver || firstClick) return;

    let r = parseInt(e.target.dataset.r);
    let c = parseInt(e.target.dataset.c);
    let cellObj = board[r][c];

    if (cellObj.isRevealed) return;

    if (!cellObj.isFlagged) {
        if (flagsPlaced < totalBombs) {
            cellObj.isFlagged = true;
            cellObj.element.textContent = '🚩';
            cellObj.element.classList.add('flagged');
            flagsPlaced++;
        }
    } else {
        cellObj.isFlagged = false;
        cellObj.element.textContent = '';
        cellObj.element.classList.remove('flagged');
        flagsPlaced--;
    }

    bombsLeftElement.textContent = totalBombs - flagsPlaced;
}

function revealCell(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    let cellObj = board[r][c];

    if (cellObj.isRevealed || cellObj.isFlagged || cellObj.isBomb) return;

    cellObj.isRevealed = true;
    cellObj.element.classList.add('revealed');
    cellsRevealed++;

    if (cellObj.adjacentBombs > 0) {
        cellObj.element.textContent = cellObj.adjacentBombs;
        cellObj.element.classList.add(`val-${cellObj.adjacentBombs}`);
    } else {
        // Empty cell, cascade
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                revealCell(r + i, c + j);
            }
        }
    }
}

function revealAll() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let cellObj = board[r][c];
            if (cellObj.isBomb) {
                cellObj.element.classList.add('revealed');
                if(!cellObj.isFlagged) {
                    cellObj.element.textContent = '💣';
                }
            } else if (cellObj.isFlagged) {
                // Wrong flag
                cellObj.element.textContent = '❌';
            }
        }
    }
}

function checkWin() {
    if (cellsRevealed === (rows * cols) - totalBombs) {
        endGame(true);
    }
}

function endGame(won) {
    gameOver = true;
    clearInterval(timerId);

    setTimeout(() => {
        if (won) {
            modalTitle.textContent = "You Won!";
            modalTitle.style.color = "blue";
            modalDesc.textContent = `Time: ${timeElapsed}s`;
        } else {
            modalTitle.textContent = "Game Over!";
            modalTitle.style.color = "red";
            modalDesc.textContent = "You hit a bomb.";
        }
        modal.style.display = 'flex';
    }, 500);
}

function startTimer() {
    timerId = setInterval(() => {
        timeElapsed++;
        timeElement.textContent = timeElapsed;
    }, 1000);
}

resetButton.addEventListener('click', initGame);
playAgainButton.addEventListener('click', initGame);

initGame();
