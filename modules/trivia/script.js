const questions = [
    {
        q: "What is the capital of France?",
        options: ["Berlin", "London", "Paris", "Rome"],
        correct: 2
    },
    {
        q: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correct: 1
    },
    {
        q: "Who painted the Mona Lisa?",
        options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
        correct: 2
    },
    {
        q: "What is the largest ocean on Earth?",
        options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
        correct: 3
    },
    {
        q: "In what year did the Titanic sink?",
        options: ["1912", "1905", "1915", "1920"],
        correct: 0
    },
    {
        q: "What is the chemical symbol for gold?",
        options: ["Go", "Gd", "Au", "Ag"],
        correct: 2
    },
    {
        q: "Which animal is known as the King of the Jungle?",
        options: ["Tiger", "Elephant", "Lion", "Gorilla"],
        correct: 2
    },
    {
        q: "What is the hardest natural substance on Earth?",
        options: ["Gold", "Iron", "Diamond", "Quartz"],
        correct: 2
    }
];

let currentQuestionIndex = 0;
let score = 0;

const questionEl = document.getElementById('question');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');
const resultMsg = document.getElementById('result-msg');
const scoreDisplay = document.getElementById('score-display');

function loadQuestion() {
    const question = questions[currentQuestionIndex];
    questionEl.textContent = question.q;
    optionsContainer.innerHTML = '';
    optionsContainer.className = 'options-grid';
    resultMsg.textContent = '';
    nextBtn.classList.add('hidden');

    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('option-btn');
        button.addEventListener('click', () => selectOption(index));
        optionsContainer.appendChild(button);
    });
}

function selectOption(index) {
    const question = questions[currentQuestionIndex];
    const buttons = optionsContainer.querySelectorAll('.option-btn');
    
    // Disable all buttons
    buttons.forEach(btn => btn.disabled = true);

    if (index === question.correct) {
        buttons[index].classList.add('correct');
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
        resultMsg.textContent = "Correct! 🎉";
        resultMsg.style.color = "#2ecc71";
    } else {
        buttons[index].classList.add('wrong');
        buttons[question.correct].classList.add('correct');
        resultMsg.textContent = "Wrong! ⚡";
        resultMsg.style.color = "#e74c3c";
    }

    nextBtn.classList.remove('hidden');
}

nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        showFinalResult();
    }
});

function showFinalResult() {
    questionEl.textContent = "Trivia Finished!";
    optionsContainer.innerHTML = '';
    resultMsg.textContent = `Final Score: ${score} / ${questions.length}`;
    resultMsg.style.color = "white";
    nextBtn.textContent = "Play Again";
    nextBtn.classList.remove('hidden');
    nextBtn.onclick = () => location.reload();
}

loadQuestion();
