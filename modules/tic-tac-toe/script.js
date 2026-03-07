const cells = document.querySelectorAll('.cell');
const turnIndicator = document.getElementById('turn-indicator');
const resetButton = document.getElementById('reset-button');
const playAgainButton = document.getElementById('play-again-button');
const modal = document.getElementById('game-over-modal');
const winnerText = document.getElementById('winner-text');

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function handleCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.getAttribute('data-index'));

    if (board[index] !== '' || !gameActive) {
        return;
    }

    updateCell(cell, index);
    checkResult();
}

function updateCell(cell, index) {
    board[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    turnIndicator.textContent = `Player ${currentPlayer}'s Turn`;
    turnIndicator.style.color = currentPlayer === 'X' ? 'var(--x-color)' : 'var(--o-color)';
}

function checkResult() {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = board[winCondition[0]];
        let b = board[winCondition[1]];
        let c = board[winCondition[2]];
        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        gameActive = false;
        winnerText.textContent = `Player ${currentPlayer} Wins!`;
        winnerText.style.color = currentPlayer === 'X' ? 'var(--x-color)' : 'var(--o-color)';
        modal.style.display = 'flex';
        return;
    }

    let roundDraw = !board.includes('');
    if (roundDraw) {
        gameActive = false;
        winnerText.textContent = 'Draw!';
        winnerText.style.color = 'var(--text-color)';
        modal.style.display = 'flex';
        return;
    }

    switchPlayer();
}

function restartGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    turnIndicator.textContent = `Player X's Turn`;
    turnIndicator.style.color = 'var(--text-color)';
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x');
        cell.classList.remove('o');
    });
    modal.style.display = 'none';
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', restartGame);
playAgainButton.addEventListener('click', restartGame);
