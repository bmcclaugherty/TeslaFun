const boardEl = document.getElementById('sudoku-board');
const numPad = document.getElementById('number-pad');
const timerEl = document.getElementById('timer');
const newGameBtn = document.getElementById('new-game-btn');

let board = [];
let solution = [];
let selectedCell = null;
let startTime;
let timerInterval;

const puzzles = [
    [
        5, 3, 0, 0, 7, 0, 0, 0, 0,
        6, 0, 0, 1, 9, 5, 0, 0, 0,
        0, 9, 8, 0, 0, 0, 0, 6, 0,
        8, 0, 0, 0, 6, 0, 0, 0, 3,
        4, 0, 0, 8, 0, 3, 0, 0, 1,
        7, 0, 0, 0, 2, 0, 0, 0, 6,
        0, 6, 0, 0, 0, 0, 2, 8, 0,
        0, 0, 0, 4, 1, 9, 0, 0, 5,
        0, 0, 0, 0, 8, 0, 0, 7, 9
    ],
    [
        0, 0, 0, 2, 6, 0, 7, 0, 1,
        6, 8, 0, 0, 7, 0, 0, 9, 0,
        1, 9, 0, 0, 0, 4, 5, 0, 0,
        8, 2, 0, 1, 0, 0, 0, 4, 0,
        0, 0, 4, 6, 0, 2, 9, 0, 0,
        0, 5, 0, 0, 0, 3, 0, 2, 8,
        0, 0, 9, 3, 0, 0, 0, 7, 4,
        0, 4, 0, 0, 5, 0, 0, 3, 6,
        7, 0, 3, 0, 1, 8, 0, 0, 0
    ]
];

// Simplified solutions (for real app, we'd use a solver)
const solutions = [
    [
        5, 3, 4, 6, 7, 8, 9, 1, 2,
        6, 7, 2, 1, 9, 5, 3, 4, 8,
        1, 9, 8, 3, 4, 2, 5, 6, 7,
        8, 5, 9, 7, 6, 1, 4, 2, 3,
        4, 2, 6, 8, 5, 3, 7, 9, 1,
        7, 1, 3, 9, 2, 4, 8, 5, 6,
        9, 6, 1, 5, 3, 7, 2, 8, 4,
        2, 8, 7, 4, 1, 9, 6, 3, 5,
        3, 4, 5, 2, 8, 6, 1, 7, 9
    ],
    [
        4, 3, 5, 2, 6, 9, 7, 8, 1,
        6, 8, 2, 5, 7, 1, 4, 9, 3,
        1, 9, 7, 8, 3, 4, 5, 6, 2,
        8, 2, 6, 1, 9, 5, 3, 4, 7,
        3, 7, 4, 6, 8, 2, 9, 1, 5,
        9, 5, 1, 7, 4, 3, 6, 2, 8,
        5, 1, 9, 3, 2, 6, 8, 7, 4,
        2, 4, 8, 9, 5, 7, 1, 3, 6,
        7, 6, 3, 4, 1, 8, 2, 5, 9
    ]
];

function initGame() {
    const pIdx = Math.floor(Math.random() * puzzles.length);
    board = [...puzzles[pIdx]];
    solution = [...solutions[pIdx]];
    
    renderBoard();
    startTimer();
}

function renderBoard() {
    boardEl.innerHTML = '';
    board.forEach((val, i) => {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        if (val !== 0) {
            cell.textContent = val;
            cell.classList.add('fixed');
        }
        cell.dataset.index = i;
        cell.addEventListener('click', () => selectCell(cell));
        boardEl.appendChild(cell);
    });
}

function selectCell(cell) {
    if (cell.classList.contains('fixed')) return;

    if (selectedCell) {
        selectedCell.classList.remove('selected');
    }
    selectedCell = cell;
    selectedCell.classList.add('selected');
}

numPad.addEventListener('click', (e) => {
    if (!selectedCell) return;
    if (!e.target.classList.contains('pad-btn')) return;

    const val = parseInt(e.target.dataset.val);
    const idx = parseInt(selectedCell.dataset.index);

    if (val === 0) {
        selectedCell.textContent = '';
        board[idx] = 0;
        selectedCell.classList.remove('wrong');
    } else {
        selectedCell.textContent = val;
        board[idx] = val;
        
        // Instant check
        if (val !== solution[idx]) {
            selectedCell.classList.add('wrong');
        } else {
            selectedCell.classList.remove('wrong');
            checkWin();
        }
    }
});

function checkWin() {
    if (board.every((v, i) => v === solution[i])) {
        clearInterval(timerInterval);
        alert(`Congratulations! You completed it in ${timerEl.textContent}`);
    }
}

function startTimer() {
    clearInterval(timerInterval);
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const diff = Date.now() - startTime;
        const mins = Math.floor(diff / 60000).toString().padStart(2, '0');
        const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        timerEl.textContent = `Time: ${mins}:${secs}`;
    }, 1000);
}

newGameBtn.addEventListener('click', initGame);

initGame();
