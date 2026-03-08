const fs = require('fs');
const path = require('path');

describe('Sudoku', () => {
    let boardEl, numPad, timerEl, newGameBtn;

    beforeEach(() => {
        // Set up our document body
        document.body.innerHTML = `
            <div id="sudoku-board"></div>
            <div id="number-pad">
                <button class="pad-btn" data-val="1">1</button>
                <button class="pad-btn" data-val="2">2</button>
                <button class="pad-btn" data-val="3">3</button>
                <button class="pad-btn" data-val="4">4</button>
                <button class="pad-btn" data-val="5">5</button>
                <button class="pad-btn" data-val="6">6</button>
                <button class="pad-btn" data-val="7">7</button>
                <button class="pad-btn" data-val="8">8</button>
                <button class="pad-btn" data-val="9">9</button>
                <button class="pad-btn" data-val="0">Erase</button>
            </div>
            <div id="timer">Time: 00:00</div>
            <button id="new-game-btn">New Game</button>
        `;

        boardEl = document.getElementById('sudoku-board');
        numPad = document.getElementById('number-pad');
        timerEl = document.getElementById('timer');
        newGameBtn = document.getElementById('new-game-btn');

        // Alert mock
        jest.spyOn(window, 'alert').mockImplementation(() => {});

        // Setup timers
        jest.useFakeTimers();

        // Require the script
        jest.resetModules();
        require('./script.js');
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.restoreAllMocks();
    });

    test('initializes board with 81 cells', () => {
        expect(boardEl.children.length).toBe(81);
    });

    test('new game button resets the board', () => {
        const initialBoard = Array.from(boardEl.children).map(c => c.textContent).join('');

        newGameBtn.click();

        const newBoard = Array.from(boardEl.children).map(c => c.textContent).join('');

        expect(boardEl.children.length).toBe(81);
    });

    test('timer updates', () => {
        expect(timerEl.textContent).toBe('Time: 00:00');

        jest.advanceTimersByTime(1000);
        expect(timerEl.textContent).toBe('Time: 00:01');

        jest.advanceTimersByTime(59000);
        expect(timerEl.textContent).toBe('Time: 01:00');
    });

    test('clicking a fixed cell does not select it', () => {
        const fixedCell = Array.from(boardEl.children).find(c => c.classList.contains('fixed'));
        fixedCell.click();
        expect(fixedCell.classList.contains('selected')).toBe(false);
    });

    test('clicking an empty cell selects it', () => {
        const emptyCell = Array.from(boardEl.children).find(c => !c.classList.contains('fixed'));
        emptyCell.click();
        expect(emptyCell.classList.contains('selected')).toBe(true);

        const anotherEmptyCell = Array.from(boardEl.children).find(c => !c.classList.contains('fixed') && c !== emptyCell);
        anotherEmptyCell.click();
        expect(emptyCell.classList.contains('selected')).toBe(false);
        expect(anotherEmptyCell.classList.contains('selected')).toBe(true);
    });

    test('entering a number via numpad', () => {
        const emptyCell = Array.from(boardEl.children).find(c => !c.classList.contains('fixed'));
        emptyCell.click();

        const btn1 = Array.from(numPad.children).find(b => b.dataset.val === '1');
        btn1.click();

        expect(emptyCell.textContent).toBe('1');
    });

    test('erasing a number', () => {
        const emptyCell = Array.from(boardEl.children).find(c => !c.classList.contains('fixed'));
        emptyCell.click();

        const btn1 = Array.from(numPad.children).find(b => b.dataset.val === '1');
        btn1.click();
        expect(emptyCell.textContent).toBe('1');

        const btn0 = Array.from(numPad.children).find(b => b.dataset.val === '0');
        btn0.click();
        expect(emptyCell.textContent).toBe('');
    });

    test('entering wrong number adds wrong class', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0);
        newGameBtn.click();

        const emptyCell = Array.from(boardEl.children).find(c => !c.classList.contains('fixed'));
        emptyCell.click();

        const btn9 = Array.from(numPad.children).find(b => b.dataset.val === '9');
        btn9.click();

        expect(emptyCell.classList.contains('wrong')).toBe(true);
    });

    test('entering correct number removes wrong class', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0);
        newGameBtn.click();

        const emptyCell = Array.from(boardEl.children).find(c => !c.classList.contains('fixed'));
        emptyCell.click();

        const btn9 = Array.from(numPad.children).find(b => b.dataset.val === '9');
        btn9.click();
        expect(emptyCell.classList.contains('wrong')).toBe(true);

        const btn4 = Array.from(numPad.children).find(b => b.dataset.val === '4');
        btn4.click();
        expect(emptyCell.classList.contains('wrong')).toBe(false);
    });

    test('checkWin is called and triggers alert when game is complete', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0);
        newGameBtn.click();

        const solution0 = [
            5, 3, 4, 6, 7, 8, 9, 1, 2,
            6, 7, 2, 1, 9, 5, 3, 4, 8,
            1, 9, 8, 3, 4, 2, 5, 6, 7,
            8, 5, 9, 7, 6, 1, 4, 2, 3,
            4, 2, 6, 8, 5, 3, 7, 9, 1,
            7, 1, 3, 9, 2, 4, 8, 5, 6,
            9, 6, 1, 5, 3, 7, 2, 8, 4,
            2, 8, 7, 4, 1, 9, 6, 3, 5,
            3, 4, 5, 2, 8, 6, 1, 7, 9
        ];

        Array.from(boardEl.children).forEach((cell, index) => {
            if (!cell.classList.contains('fixed')) {
                cell.click();
                const btn = Array.from(numPad.children).find(b => b.dataset.val === String(solution0[index]));
                btn.click();
            }
        });

        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Congratulations'));
    });

    test('clicking numpad without selecting cell does nothing', () => {
        const btn1 = Array.from(numPad.children).find(b => b.dataset.val === '1');
        btn1.click();

        const selectedCells = Array.from(boardEl.children).filter(c => c.classList.contains('selected'));
        expect(selectedCells.length).toBe(0);
    });

    test('clicking outside pad buttons does nothing', () => {
        const emptyCell = Array.from(boardEl.children).find(c => !c.classList.contains('fixed'));
        emptyCell.click();

        numPad.click();

        expect(emptyCell.textContent).toBe('');
    });
});
