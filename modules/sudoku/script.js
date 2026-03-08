const boardEl = document.getElementById('sudoku-board');
const numPad = document.getElementById('number-pad');
const timerEl = document.getElementById('timer');
const newGameBtn = document.getElementById('new-game-btn');

let board = [];
let solution = [];
let selectedCell = null;
let startTime;
let timerInterval;

// Sudoku generation functions
function fillDiagonal(board) {
    for (let i = 0; i < 9; i += 3) {
        let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        nums.sort(() => Math.random() - 0.5);
        let idx = 0;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                board[(i + r) * 9 + (i + c)] = nums[idx++];
            }
        }
    }
}

function fillBoard(board) {
    let emptyIdx = board.indexOf(0);
    if (emptyIdx === -1) return true;
    let row = Math.floor(emptyIdx / 9);
    let col = emptyIdx % 9;
    let startRow = Math.floor(row / 3) * 3;
    let startCol = Math.floor(col / 3) * 3;

    let used = new Array(10).fill(false);
    for (let j = 0; j < 9; j++) {
        used[board[row * 9 + j]] = true;
        used[board[j * 9 + col]] = true;
    }
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            used[board[(startRow + r) * 9 + (startCol + c)]] = true;
        }
    }

    let nums = [];
    for (let v = 1; v <= 9; v++) {
        if (!used[v]) nums.push(v);
    }
    nums.sort(() => Math.random() - 0.5);

    for (let num of nums) {
        board[emptyIdx] = num;
        if (fillBoard(board)) return true;
        board[emptyIdx] = 0;
    }
    return false;
}

function solveMRV(board, count) {
    let minIdx = -1;
    let minVals = null;
    let minLen = 10;

    for (let i = 0; i < 81; i++) {
        if (board[i] === 0) {
            let row = Math.floor(i / 9);
            let col = i % 9;
            let startRow = Math.floor(row / 3) * 3;
            let startCol = Math.floor(col / 3) * 3;

            let used = new Array(10).fill(false);
            for (let j = 0; j < 9; j++) {
                used[board[row * 9 + j]] = true;
                used[board[j * 9 + col]] = true;
            }
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    used[board[(startRow + r) * 9 + (startCol + c)]] = true;
                }
            }

            let vals = [];
            for (let v = 1; v <= 9; v++) {
                if (!used[v]) vals.push(v);
            }

            if (vals.length === 0) return; // Unsolvable branch
            if (vals.length < minLen) {
                minLen = vals.length;
                minIdx = i;
                minVals = vals;
            }
        }
    }

    if (minIdx === -1) {
        count.n++;
        return;
    }

    for (let num of minVals) {
        board[minIdx] = num;
        solveMRV(board, count);
        if (count.n > 1) {
            board[minIdx] = 0;
            return;
        }
        board[minIdx] = 0;
    }
}

function generateSudoku(difficulty) {
    let board = new Array(81).fill(0);
    fillDiagonal(board);
    fillBoard(board);

    let solution = [...board];

    let cellsToRemove = 30; // easy
    if (difficulty === 'medium') cellsToRemove = 45;
    if (difficulty === 'hard') cellsToRemove = 55;

    let indices = Array.from({length: 81}, (_, i) => i);
    indices.sort(() => Math.random() - 0.5);

    let removed = 0;
    for (let i = 0; i < 81; i++) {
        if (removed >= cellsToRemove) break;
        let idx = indices[i];
        let backup = board[idx];
        board[idx] = 0;

        let count = { n: 0 };
        solveMRV([...board], count);

        if (count.n !== 1) {
            board[idx] = backup; // Cannot remove
        } else {
            removed++;
        }
    }

    return { board, solution };
}

function initGame() {
    const diffSelect = document.getElementById('difficulty');
    const difficulty = diffSelect ? diffSelect.value : 'easy';

    const generated = generateSudoku(difficulty);
    board = generated.board;
    solution = generated.solution;

    // Store globally for tests if needed
    window.currentSolution = solution;
    
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
