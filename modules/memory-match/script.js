const gameBoard = document.getElementById('game-board');
const movesDisplay = document.getElementById('moves');
const resetButton = document.getElementById('reset-button');
const playAgainButton = document.getElementById('play-again-button');
const modal = document.getElementById('game-over-modal');
const finalMovesDisplay = document.getElementById('final-moves');

const emojis = ['⚡', '🚗', '🔋', '🔌', '🛣️', '🚀', '🌌', '🛑'];
let cards = [...emojis, ...emojis]; // Duplicate for pairs
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let isLocked = false;

function initGame() {
    gameBoard.innerHTML = '';
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    movesDisplay.textContent = moves;
    isLocked = false;
    modal.style.display = 'none';

    // Shuffle
    cards.sort(() => Math.random() - 0.5);

    // Create cards
    cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.emoji = emoji;

        const cardInner = document.createElement('div');
        cardInner.classList.add('card-inner');

        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front');

        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');
        cardBack.textContent = emoji;

        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);

        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

function flipCard() {
    if (isLocked) return;
    if (this.classList.contains('flipped') || this.classList.contains('matched')) return;

    this.classList.add('flipped');
    flippedCards.push(this);

    if (flippedCards.length === 2) {
        moves++;
        movesDisplay.textContent = moves;
        checkMatch();
    }
}

function checkMatch() {
    const card1 = flippedCards[0];
    const card2 = flippedCards[1];

    if (card1.dataset.emoji === card2.dataset.emoji) {
        // Match
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        flippedCards = [];

        if (matchedPairs === emojis.length) {
            setTimeout(() => {
                finalMovesDisplay.textContent = moves;
                modal.style.display = 'flex';
            }, 500);
        }
    } else {
        // No match
        isLocked = true;
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
            isLocked = false;
        }, 1000);
    }
}

resetButton.addEventListener('click', initGame);
playAgainButton.addEventListener('click', initGame);

initGame();
