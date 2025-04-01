// Get references to HTML elements
const startBtn = document.querySelector('.start-btn');
const popupInfo = document.querySelector('.popup-info');
const exitBtn = document.querySelector('.exit-btn');
const main = document.querySelector('.main');
const continueBtn = document.querySelector('.continue-btn');
const quizSection = document.querySelector('.quiz-section');
const quizBox = document.querySelector('.quiz-box');
const resultBox = document.querySelector('.result-box');
const tryAgainBtn = document.querySelector('.tryAgain-btn');
const goHomeBtn = document.querySelector('.goHome-btn');
const nextBtn = document.querySelector('.next-btn');
const optionList = document.querySelector('.option-list');

// Initialize global variables for quiz logic
let questionCount = 0;
let questionNumb = 1;
let userScore = 0;
let questions = [];

// Fetch questions from the API
async function fetchQuestions() {
    try {
        const response = await fetch("https://opentdb.com/api.php?amount=5&category=15&difficulty=easy&type=multiple");
        const data = await response.json();

        // Transform the API response to match our format
        questions = data.results.map((item) => ({
            question: decodeHtmlEntities(item.question),
            options: [...item.incorrect_answers.map(answer => decodeHtmlEntities(answer)), decodeHtmlEntities(item.correct_answer)].sort(() => Math.random() - 0.5), // Shuffle options
            answer: decodeHtmlEntities(item.correct_answer)
        }));

        // Shuffle questions array to randomize the order
        shuffleArray(questions);
        
        // Show the quiz UI after fetching questions
        startQuiz();
    } catch (error) {
        console.error("Error fetching quiz questions:", error);
    }
}

// Fisher-Yates shuffle function to randomize array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

// Decode HTML entities (like "&quot;") to plain text
function decodeHtmlEntities(str) {
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
}

// Start quiz function
function startQuiz() {
    startBtn.onclick = () => {
        popupInfo.classList.add('active');
        main.classList.add('active');
    };

    exitBtn.onclick = () => {
        popupInfo.classList.remove('active');
        main.classList.remove('active');
    };

    continueBtn.onclick = () => {
        quizSection.classList.add('active');
        popupInfo.classList.remove('active');
        main.classList.remove('active');
        quizBox.classList.add('active');

        // Start the first question
        showQuestions(questionCount);
        questionCounter(questionNumb);
        headerScore();
    };

    tryAgainBtn.onclick = async () => {
    quizBox.classList.add('active');
    nextBtn.classList.remove('active');
    resultBox.classList.remove('active');

    questionCount = 0;
    questionNumb = 1;
    userScore = 0;

    await fetchQuestions(); // Fetch new questions when retrying

    showQuestions(questionCount);
    questionCounter(questionNumb);
    headerScore();
    };

    goHomeBtn.onclick = () => {
        quizSection.classList.remove('active');
        nextBtn.classList.remove('active');
        resultBox.classList.remove('active');

        questionCount = 0;
        questionNumb = 1;
        userScore = 0;
        showQuestions(questionCount);
        questionCounter(questionNumb);
    };

    nextBtn.onclick = () => {
        if (questionCount < questions.length - 1) {
            questionCount++;
            showQuestions(questionCount);

            questionNumb++;
            questionCounter(questionNumb);

            nextBtn.classList.remove('active');
        } else {
            showResultBox();
        }
    };
}

// Display the question and options
function showQuestions(index) {
    const questionText = document.querySelector('.question-text');
    questionText.textContent = questions[index].question; // No numbers before the question

    let optionTag = '';
    questions[index].options.forEach(option => {
        optionTag += `<div class="option"><span>${option}</span></div>`;
    });

    optionList.innerHTML = optionTag;

    const optionElements = document.querySelectorAll('.option');
    optionElements.forEach(option => {
        option.setAttribute('onclick', 'optionSelected(this)');
    });
}

// Handle option selection
function optionSelected(answer) {
    let userAnswer = answer.textContent;
    let correctAnswer = questions[questionCount].answer;
    let allOptions = optionList.children.length;

    if (userAnswer === correctAnswer) {
        answer.classList.add('correct');
        userScore += 1;
        headerScore();
    } else {
        answer.classList.add('incorrect');

        // Auto-select correct answer if incorrect answer is selected
        for (let i = 0; i < allOptions; i++) {
            if (optionList.children[i].textContent === correctAnswer) {
                optionList.children[i].classList.add('correct');
            }
        }
    }

    // Disable all other options after selection
    for (let i = 0; i < allOptions; i++) {
        optionList.children[i].classList.add('disabled');
    }

    nextBtn.classList.add('active');
}

// Update the question counter
function questionCounter(index) {
    const questionTotal = document.querySelector('.question-total');
    questionTotal.textContent = `${index} of ${questions.length} Questions`;
}

// Update the score header
function headerScore() {
    const headerScoreText = document.querySelector('.header-score');
    headerScoreText.textContent = `Score: ${userScore} / ${questions.length}`;
}

// Show result box when quiz is finished

function showResultBox() {
    quizBox.classList.remove('active');
    resultBox.classList.add('active');

    const scoreText = document.querySelector('.score-text');
    scoreText.textContent = `Your Score ${userScore} out of ${questions.length}`;

    const circularProgress = document.querySelector('.circular-progress');
    const progressValue = document.querySelector('.progress-value');

    let progressStartValue = 0;
    let progressEndValue = (userScore / questions.length) * 100;

    // Ensure the progress bar doesn't exceed 100% and reset it properly
    progressEndValue = Math.min(progressEndValue, 100);
    progressValue.textContent = `0%`; // Reset the text value immediately

    // Clear any existing progress animation
    clearInterval(window.progressInterval);

    let speed = 20; // Speed of progress bar increment

    // Reset the circular progress before animation
    circularProgress.style.background = `conic-gradient(#ff69b4 0%, rgba(255, 255, 255, .1) 0% 100%)`;

    // Start progress animation
    window.progressInterval = setInterval(() => {
        if (progressStartValue < progressEndValue) {
            progressStartValue++;
            progressValue.textContent = `${progressStartValue}%`;

            // Update circular progress visually
            circularProgress.style.background = `conic-gradient(#ff69b4 ${progressStartValue}%, rgba(255, 255, 255, .1) ${progressStartValue}% 100%)`;
        } else {
            clearInterval(window.progressInterval);
        }
    }, speed);
}

// Fetch the questions and start the quiz
fetchQuestions();



window.addEventListener('wheel', function(event) {
    event.preventDefault(); // Stops the scroll event
}, { passive: false }); // Use passive: false to allow preventDefault

// Prevent scrolling using keyboard keys (arrow keys, space bar, etc.)
window.addEventListener('keydown', function(event) {
    if (['ArrowDown', 'ArrowUp', 'Space'].includes(event.key)) {
        event.preventDefault(); // Prevent the key from scrolling
    }
});