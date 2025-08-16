class TriviaGame {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.playerName = '';
        this.gameQuestions = [];
        this.selectedAnswer = null;
        this.questionsPerGame = 10;
        
        this.initializeElements();
        this.bindEvents();
        this.loadQuestions();
        this.displayHighScores();
    }

    initializeElements() {
        // Screen elements
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.resultsScreen = document.getElementById('results-screen');
        this.highScoresScreen = document.getElementById('high-scores-screen');

        // Start screen elements
        this.playerNameInput = document.getElementById('player-name');
        this.startBtn = document.getElementById('start-btn');
        this.topScoresList = document.getElementById('top-scores-list');

        // Game screen elements
        this.questionNumber = document.getElementById('question-number');
        this.categoryElement = document.getElementById('category');
        this.questionText = document.getElementById('question-text');
        this.answersContainer = document.getElementById('answers-container');
        this.nextBtn = document.getElementById('next-btn');
        this.progressFill = document.getElementById('progress-fill');

        // Results screen elements
        this.finalScoreText = document.getElementById('final-score-text');
        this.scoreMessage = document.getElementById('score-message');
        this.correctCount = document.getElementById('correct-count');
        this.accuracy = document.getElementById('accuracy');
        this.playAgainBtn = document.getElementById('play-again-btn');
        this.viewScoresBtn = document.getElementById('view-scores-btn');

        // High scores screen elements
        this.highScoresList = document.getElementById('high-scores-list');
        this.backToStartBtn = document.getElementById('back-to-start-btn');
        this.clearScoresBtn = document.getElementById('clear-scores-btn');

        // Score display elements
        this.currentScoreDisplay = document.getElementById('current-score');
        this.highScoreDisplay = document.getElementById('high-score');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.playAgainBtn.addEventListener('click', () => this.resetGame());
        this.viewScoresBtn.addEventListener('click', () => this.showHighScores());
        this.backToStartBtn.addEventListener('click', () => this.showStartScreen());
        this.clearScoresBtn.addEventListener('click', () => this.clearHighScores());

        // Enter key support for player name input
        this.playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.startGame();
            }
        });
    }

    async loadQuestions() {
        try {
            const response = await fetch('questions.json');
            const data = await response.json();
            this.questions = data.questions;
            console.log(`Loaded ${this.questions.length} questions`);
        } catch (error) {
            console.error('Error loading questions:', error);
            // Fallback questions in case JSON fails to load
            this.questions = [
                {
                    id: 1,
                    category: "General",
                    question: "What is 2 + 2?",
                    answers: ["3", "4", "5", "6"],
                    correct: 1
                }
            ];
        }
    }

    startGame() {
        const name = this.playerNameInput.value.trim();
        if (!name) {
            alert('Please enter your name to start the game!');
            return;
        }

        this.playerName = name;
        this.score = 0;
        this.correctAnswers = 0;
        this.currentQuestionIndex = 0;
        
        // Select random questions for this game
        this.gameQuestions = this.getRandomQuestions(this.questionsPerGame);
        
        this.updateScoreDisplay();
        this.showGameScreen();
        this.displayQuestion();
    }

    getRandomQuestions(count) {
        const shuffled = [...this.questions].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    showGameScreen() {
        this.hideAllScreens();
        this.gameScreen.classList.add('active');
    }

    showStartScreen() {
        this.hideAllScreens();
        this.startScreen.classList.add('active');
        this.displayTopScores();
    }

    showResultsScreen() {
        this.hideAllScreens();
        this.resultsScreen.classList.add('active');
    }

    showHighScores() {
        this.hideAllScreens();
        this.highScoresScreen.classList.add('active');
        this.displayHighScores();
    }

    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
    }

    displayQuestion() {
        if (this.currentQuestionIndex >= this.gameQuestions.length) {
            this.endGame();
            return;
        }

        const question = this.gameQuestions[this.currentQuestionIndex];
        
        // Update question info
        this.questionNumber.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.gameQuestions.length}`;
        this.categoryElement.textContent = question.category;
        this.questionText.textContent = question.question;
        
        // Update progress bar
        const progress = ((this.currentQuestionIndex) / this.gameQuestions.length) * 100;
        this.progressFill.style.width = `${progress}%`;

        // Clear previous answers
        this.answersContainer.innerHTML = '';
        this.selectedAnswer = null;
        this.nextBtn.style.display = 'none';

        // Create answer buttons
        question.answers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = answer;
            button.addEventListener('click', () => this.selectAnswer(index, button));
            this.answersContainer.appendChild(button);
        });
    }

    selectAnswer(answerIndex, buttonElement) {
        if (this.selectedAnswer !== null) return; // Prevent multiple selections

        this.selectedAnswer = answerIndex;
        const question = this.gameQuestions[this.currentQuestionIndex];
        const isCorrect = answerIndex === question.correct;

        // Disable all buttons
        const allButtons = this.answersContainer.querySelectorAll('.answer-btn');
        allButtons.forEach(btn => btn.classList.add('disabled'));

        // Show correct/incorrect styling
        allButtons.forEach((btn, index) => {
            if (index === question.correct) {
                btn.classList.add('correct');
            } else if (index === answerIndex && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        if (isCorrect) {
            this.score += 100;
            this.correctAnswers++;
            this.updateScoreDisplay();
        }

        // Show next button after a short delay
        setTimeout(() => {
            this.nextBtn.style.display = 'block';
        }, 1000);
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        this.displayQuestion();
    }

    endGame() {
        this.saveScore();
        this.displayResults();
        this.showResultsScreen();
    }

    displayResults() {
        this.finalScoreText.textContent = `${this.score} points`;
        this.correctCount.textContent = `${this.correctAnswers}/${this.gameQuestions.length}`;
        
        const accuracyPercent = Math.round((this.correctAnswers / this.gameQuestions.length) * 100);
        this.accuracy.textContent = `${accuracyPercent}%`;

        // Score message based on performance
        let message = '';
        if (accuracyPercent >= 90) {
            message = '🎉 Outstanding! You\'re a trivia master!';
        } else if (accuracyPercent >= 70) {
            message = '👏 Great job! Well done!';
        } else if (accuracyPercent >= 50) {
            message = '👍 Good effort! Keep practicing!';
        } else {
            message = '📚 Keep learning and try again!';
        }
        
        this.scoreMessage.textContent = message;
    }

    saveScore() {
        const scores = this.getHighScores();
        const newScore = {
            name: this.playerName,
            score: this.score,
            correct: this.correctAnswers,
            total: this.gameQuestions.length,
            date: new Date().toLocaleDateString()
        };

        scores.push(newScore);
        scores.sort((a, b) => b.score - a.score);
        
        // Keep only top 10 scores
        const topScores = scores.slice(0, 10);
        
        localStorage.setItem('triviaHighScores', JSON.stringify(topScores));
        this.updateHighScoreDisplay();
    }

    getHighScores() {
        const scores = localStorage.getItem('triviaHighScores');
        return scores ? JSON.parse(scores) : [];
    }

    displayHighScores() {
        const scores = this.getHighScores();
        
        if (scores.length === 0) {
            this.highScoresList.innerHTML = '<div class="empty-scores">No high scores yet. Be the first to play!</div>';
            return;
        }

        this.highScoresList.innerHTML = scores.map((score, index) => `
            <div class="score-entry ${index === 0 ? 'top-score' : ''}">
                <div>
                    <div class="player-name">${score.name}</div>
                    <div style="font-size: 0.9em; color: #666;">
                        ${score.correct}/${score.total} correct • ${score.date}
                    </div>
                </div>
                <div class="score-value">${score.score}</div>
            </div>
        `).join('');
    }

    displayTopScores() {
        const scores = this.getHighScores().slice(0, 3);
        
        if (scores.length === 0) {
            this.topScoresList.innerHTML = '<div class="empty-scores">No scores yet!</div>';
            return;
        }

        this.topScoresList.innerHTML = scores.map((score, index) => `
            <div class="score-entry ${index === 0 ? 'top-score' : ''}">
                <div class="player-name">${score.name}</div>
                <div class="score-value">${score.score}</div>
            </div>
        `).join('');
    }

    updateScoreDisplay() {
        this.currentScoreDisplay.textContent = `Score: ${this.score}`;
    }

    updateHighScoreDisplay() {
        const scores = this.getHighScores();
        const highScore = scores.length > 0 ? scores[0].score : 0;
        this.highScoreDisplay.textContent = `High Score: ${highScore}`;
    }

    clearHighScores() {
        if (confirm('Are you sure you want to clear all high scores? This action cannot be undone.')) {
            localStorage.removeItem('triviaHighScores');
            this.displayHighScores();
            this.updateHighScoreDisplay();
            alert('High scores cleared!');
        }
    }

    resetGame() {
        this.playerNameInput.value = '';
        this.showStartScreen();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new TriviaGame();
    
    // Update high score display on page load
    game.updateHighScoreDisplay();
});
