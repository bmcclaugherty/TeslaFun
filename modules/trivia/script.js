const questions = [
    {
        q: "In what year was Tesla Motors founded?",
        options: ["2001", "2003", "2008", "2010"],
        correct: 1
    },
    {
        q: "What was Tesla's first production car?",
        options: ["Model S", "Model X", "Roadster", "Model 3"],
        correct: 2
    },
    {
        q: "Which Tesla model has 'Falcon Wing' doors?",
        options: ["Model 3", "Model X", "Cybertruck", "Model Y"],
        correct: 1
    },
    {
        q: "Who is the CEO of Tesla?",
        options: ["Bill Gates", "Jeff Bezos", "Elon Musk", "Tim Cook"],
        correct: 2
    },
    {
        q: "What is the name of Tesla's self-driving software?",
        options: ["Autopilot", "SuperDrive", "SafeDrive", "AutoTravel"],
        correct: 0
    },
    {
        q: "Which model is known as the 'most affordable' Tesla?",
        options: ["Model S", "Model X", "Model 3", "Roadster"],
        correct: 2
    },
    {
        q: "What is the Cybertruck's body material made of?",
        options: ["Aluminum", "Carbon Fiber", "Stainless Steel", "Fiberglass"],
        correct: 2
    },
    {
        q: "Where is Tesla's 'Gigafactory Texas' located?",
        options: ["Dallas", "Austin", "Houston", "San Antonio"],
        correct: 1
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
