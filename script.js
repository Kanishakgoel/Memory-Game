document.addEventListener('DOMContentLoaded', () => {
    // Game variables
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let timer = 0;
    let timerInterval;
    let gameStarted = false;
    let difficulty = 'easy';
    
    // DOM elements
    const gameBoard = document.getElementById('game-board');
    const newGameBtn = document.getElementById('new-game-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const difficultySelect = document.getElementById('difficulty');
    const movesDisplay = document.getElementById('moves');
    const timeDisplay = document.getElementById('time');
    const scoreDisplay = document.getElementById('score');
    const congratsModal = document.getElementById('congrats-modal');
    const finalTimeDisplay = document.getElementById('final-time');
    const finalMovesDisplay = document.getElementById('final-moves');
    const finalScoreDisplay = document.getElementById('final-score');
    
    // Icon options for cards (Font Awesome icons)
    const iconOptions = [
        'fa-heart', 'fa-star', 'fa-cloud', 'fa-bolt',
        'fa-bell', 'fa-flag', 'fa-key', 'fa-music',
        'fa-gem', 'fa-camera', 'fa-globe', 'fa-paper-plane',
        'fa-leaf', 'fa-umbrella', 'fa-snowflake', 'fa-football-ball',
        'fa-basketball-ball', 'fa-baseball-ball', 'fa-volleyball-ball'
    ];
    
    // Initialize game
    function initGame() {
        // Clear previous game
        clearInterval(timerInterval);
        gameBoard.innerHTML = '';
        flippedCards = [];
        matchedPairs = 0;
        moves = 0;
        timer = 0;
        gameStarted = false;
        
        movesDisplay.textContent = moves;
        timeDisplay.textContent = timer;
        scoreDisplay.textContent = 0;
        
        difficulty = difficultySelect.value;
        
        // Determine grid size based on difficulty
        let rows, cols, totalPairs;
        switch(difficulty) {
            case 'easy':
                rows = 4;
                cols = 4;
                totalPairs = 8;
                gameBoard.className = 'game-board easy';
                break;
            case 'medium':
                rows = 4;
                cols = 5;
                totalPairs = 10;
                gameBoard.className = 'game-board medium';
                break;
            case 'hard':
                rows = 6;
                cols = 6;
                totalPairs = 18;
                gameBoard.className = 'game-board hard';
                break;
        }
        
        // Select icons for this game
        const selectedIcons = [];
        while (selectedIcons.length < totalPairs) {
            const randomIndex = Math.floor(Math.random() * iconOptions.length);
            const icon = iconOptions[randomIndex];
            if (!selectedIcons.includes(icon)) {
                selectedIcons.push(icon);
            }
        }
        
        // Create pairs of cards
        cards = [];
        selectedIcons.forEach(icon => {
            cards.push({ icon, matched: false });
            cards.push({ icon, matched: false });
        });
        
        // Shuffle cards
        shuffleCards(cards);
        
        // Create card elements
        cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.index = index;
            
            const cardInner = document.createElement('div');
            cardInner.className = 'card-inner';
            
            const cardFront = document.createElement('div');
            cardFront.className = 'card-front';
            
            const cardBack = document.createElement('div');
            cardBack.className = 'card-back';
            
            const iconElement = document.createElement('i');
            iconElement.className = `fas ${card.icon}`;
            cardBack.appendChild(iconElement);
            
            cardInner.appendChild(cardFront);
            cardInner.appendChild(cardBack);
            cardElement.appendChild(cardInner);
            
            // Modified click handler to ensure it works
            cardElement.addEventListener('click', function() {
                // Only proceed if card isn't already flipped/matched
                if (!this.classList.contains('flipped') && 
                    !this.classList.contains('matched') && 
                    flippedCards.length < 2) {
                    flipCard(this, index);
                }
            });
            
            gameBoard.appendChild(cardElement);
        });
    }
    
    // Shuffle cards using Fisher-Yates algorithm
    function shuffleCards(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // Flip a card
    function flipCard(cardElement, index) {
        // Don't allow flipping if:
        // - Game hasn't started (start timer on first flip)
        // - Card is already flipped or matched
        // - Two cards are already flipped
        if (!gameStarted) {
            startTimer();
            gameStarted = true;
        }
        
        // Flip the card
        cardElement.classList.add('flipped');
        flippedCards.push({ element: cardElement, index });
        
        // Check for match if two cards are flipped
        if (flippedCards.length === 2) {
            moves++;
            movesDisplay.textContent = moves;
            updateScore();
            
            const card1 = cards[flippedCards[0].index];
            const card2 = cards[flippedCards[1].index];
            
            if (card1.icon === card2.icon) {
                // Match found
                card1.matched = true;
                card2.matched = true;
                
                flippedCards[0].element.classList.add('matched');
                flippedCards[1].element.classList.add('matched');
                
                flippedCards = [];
                matchedPairs++;
                
                if (matchedPairs === cards.length / 2) {
                    endGame();
                }
            } else {
                // No match - flip back after delay
                setTimeout(() => {
                    flippedCards.forEach(card => {
                        card.element.classList.remove('flipped');
                    });
                    flippedCards = [];
                }, 1000);
            }
        }
    }

    
    // Start game timer
    function startTimer() {
        timerInterval = setInterval(() => {
            timer++;
            timeDisplay.textContent = timer;
            updateScore();
        }, 1000);
    }
    
    // Update score based on moves and time
    function updateScore() {
        let score = 0;
        const baseScore = 1000;
        const timePenalty = timer * 5;
        const movesPenalty = moves * 10;
        
        score = Math.max(0, baseScore - timePenalty - movesPenalty);
        scoreDisplay.textContent = score;
        return score;
    }
    
    // End the game
    function endGame() {
        clearInterval(timerInterval);
        
        // Calculate final score
        const finalScore = updateScore();
        
        // Show congratulations modal
        finalTimeDisplay.textContent = timer;
        finalMovesDisplay.textContent = moves;
        finalScoreDisplay.textContent = finalScore;
        congratsModal.style.display = 'flex';
    }
    
    // Event listeners
    newGameBtn.addEventListener('click', initGame);
    playAgainBtn.addEventListener('click', () => {
        congratsModal.style.display = 'none';
        initGame();
    });
    
    difficultySelect.addEventListener('change', initGame);
    
    // Initialize first game
    initGame();
});