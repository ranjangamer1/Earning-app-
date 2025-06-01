document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const modeSelectionScreen = document.getElementById('mode-selection-screen');
    const gameScreen = document.getElementById('game-screen');
    const cells = document.querySelectorAll('.cell');
    const statusText = document.getElementById('status-text');
    const currentScoreDisplay = document.getElementById('current-score-display');
    const totalScoreDisplay = document.getElementById('total-score-display');
    const restartButton = document.getElementById('restart-button');
    const mainMenuButton = document.getElementById('main-menu-button');
    const watchAdButton = document.getElementById('watch-ad-button');
    const hvhButton = document.getElementById('hvh-button');
    const hvaButton = document.getElementById('hva-button');
    const quitButtonMain = document.getElementById('quit-button-main');

    const gameOverModal = document.getElementById('game-over-modal');
    const gameOverMessage = document.getElementById('game-over-message');
    const playAgainModalButton = document.getElementById('play-again-modal-button');
    const mainMenuModalButton = document.getElementById('main-menu-modal-button');

    // Ad Placeholders
    const appOpenAdPlaceholder = document.getElementById('app-open-ad-placeholder');
    const bannerAdPlaceholder = document.getElementById('banner-ad-placeholder');
    const fullScreenAdModal = document.getElementById('full-screen-ad-modal');
    const fullScreenAdText = document.getElementById('full-screen-ad-text');
    const closeAdModalButton = document.getElementById('close-ad-modal-button');

    // --- Game State & Constants ---
    const PLAYER_X = 'X';
    const PLAYER_O = 'O';
    const AI_PLAYER = PLAYER_O; // AI will play as O
    const HUMAN_PLAYER_VS_AI = PLAYER_X;
    const SCORE_KEY = 'ticTacToeDeluxeScore';
    const WINNING_COMBINATIONS = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    const PERIODIC_AD_INTERVAL_MS = 120 * 1000; // 2 minutes

    let boardState = Array(9).fill(null);
    let currentPlayer;
    let gameMode; // 'hvh' or 'hva'
    let gameIsOver = false;
    let totalScore = 0;
    let periodicAdTimer = null;

    // --- Ad Simulation Functions ---
    function showSimulatedInterstitial(reason) {
        console.log(`AD: Showing Interstitial - Reason: ${reason}`);
        fullScreenAdText.textContent = `Interstitial Ad (${reason})`;
        fullScreenAdModal.style.display = 'flex';
        // In a real scenario, ad SDK would take over.
    }

    function showSimulatedRewarded(callback) {
        console.log("AD: Showing Rewarded Ad");
        fullScreenAdText.textContent = 'Rewarded Ad (Watch to earn!)';
        fullScreenAdModal.style.display = 'flex';
        // Simulate ad completion after a delay
        // In a real scenario, ad SDK callbacks would handle this.
        // For now, we'll assume the user "closes" it.
        // The actual reward is tied to the close button in this simulation.
        closeAdModalButton.onclick = () => {
            fullScreenAdModal.style.display = 'none';
            console.log("AD: Rewarded Ad 'watched' (simulated).");
            callback(true); // Simulate success
            closeAdModalButton.onclick = closeFullScreenAdModal; // Reset to default
        };
    }
    
    function closeFullScreenAdModal() {
        fullScreenAdModal.style.display = 'none';
    }

    function showSimulatedBanner() {
        console.log("AD: Showing Banner Ad");
        bannerAdPlaceholder.style.display = 'flex';
    }

    function hideSimulatedBanner() {
        console.log("AD: Hiding Banner Ad");
        bannerAdPlaceholder.style.display = 'none';
    }

    function startPeriodicAdTimer() {
        stopPeriodicAdTimer(); // Clear existing timer
        periodicAdTimer = setTimeout(() => {
            if (!gameIsOver && gameScreen.classList.contains('active')) {
                showSimulatedInterstitial('2_min_timer');
            }
            startPeriodicAdTimer(); // Restart timer for next interval
        }, PERIODIC_AD_INTERVAL_MS);
    }

    function stopPeriodicAdTimer() {
        if (periodicAdTimer) {
            clearTimeout(periodicAdTimer);
            periodicAdTimer = null;
        }
    }


    // --- Game Logic Functions ---
    function startGame() {
        gameIsOver = false;
        boardState.fill(null);
        currentPlayer = PLAYER_X; // X always starts
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove(PLAYER_X.toLowerCase(), PLAYER_O.toLowerCase());
            cell.style.cursor = 'pointer';
        });
        statusText.textContent = `Player ${currentPlayer}'s Turn`;
        gameOverModal.style.display = 'none';
        showSimulatedBanner();
        startPeriodicAdTimer();

        if (gameMode === 'hva' && currentPlayer === AI_PLAYER) {
            setTimeout(aiTurn, 500); // AI makes first move if it's 'O' and starts
        }
    }

    function handleCellClick(event) {
        if (gameIsOver) return;
        const cell = event.target;
        const cellIndex = parseInt(cell.dataset.index);

        if (boardState[cellIndex] !== null) return; // Cell already played
        if (gameMode === 'hva' && currentPlayer === AI_PLAYER) return; // Not AI's turn

        makeMove(cellIndex, currentPlayer);
        checkGameStatus();
    }

    function makeMove(index, player) {
        boardState[index] = player;
        cells[index].textContent = player;
        cells[index].classList.add(player.toLowerCase());
        cells[index].style.cursor = 'default';
    }

    function switchPlayer() {
        currentPlayer = (currentPlayer === PLAYER_X) ? PLAYER_O : PLAYER_X;
        statusText.textContent = `Player ${currentPlayer}'s Turn`;
    }

    function checkGameStatus() {
        const winner = checkWin();
        if (winner) {
            endGame(false, winner);
        } else if (boardState.every(cell => cell !== null)) {
            endGame(true); // Draw
        } else {
            switchPlayer();
            if (gameMode === 'hva' && currentPlayer === AI_PLAYER && !gameIsOver) {
                statusText.textContent = `AI (${AI_PLAYER}) is thinking...`;
                setTimeout(aiTurn, Math.random() * 1000 + 500); // AI thinks for 0.5-1.5s
            }
        }
    }

    function checkWin() {
        for (const combination of WINNING_COMBINATIONS) {
            const [a, b, c] = combination;
            if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
                return boardState[a]; // Return 'X' or 'O'
            }
        }
        return null; // No winner
    }

    function endGame(isDraw, winner = null) {
        gameIsOver = true;
        stopPeriodicAdTimer();
        hideSimulatedBanner(); // Hide banner on game over, or keep it, your choice
        
        cells.forEach(cell => cell.style.cursor = 'default');

        let message = '';
        if (isDraw) {
            message = "It's a Draw!";
        } else {
            message = `Player ${winner} Wins!`;
            if (winner === HUMAN_PLAYER_VS_AI || (gameMode === 'hvh' && (winner === PLAYER_X || winner === PLAYER_O ))) {
                 // Award points if human wins (vs AI or in PvP)
                addPoints(10);
            }
        }
        gameOverMessage.textContent = message;
        gameOverModal.style.display = 'flex';
        showSimulatedInterstitial('game_end');
    }

    // --- AI Logic ---
    function aiTurn() {
        if (gameIsOver) return;

        let bestMove = -1;

        // 1. Check if AI can win
        for (let i = 0; i < 9; i++) {
            if (boardState[i] === null) {
                boardState[i] = AI_PLAYER;
                if (checkWinConditionForPlayer(AI_PLAYER)) {
                    bestMove = i;
                }
                boardState[i] = null; // Undo test move
                if (bestMove !== -1) break;
            }
        }

        // 2. Check if AI needs to block human
        if (bestMove === -1) {
            const human = (AI_PLAYER === PLAYER_X) ? PLAYER_O : PLAYER_X;
            for (let i = 0; i < 9; i++) {
                if (boardState[i] === null) {
                    boardState[i] = human;
                    if (checkWinConditionForPlayer(human)) {
                        bestMove = i; // Block here
                    }
                    boardState[i] = null; // Undo
                    if (bestMove !== -1) break;
                }
            }
        }
        
        // 3. Try to take center
        if (bestMove === -1 && boardState[4] === null) {
            bestMove = 4;
        }

        // 4. Try to take a random available corner
        if (bestMove === -1) {
            const corners = [0, 2, 6, 8].filter(i => boardState[i] === null);
            if (corners.length > 0) {
                bestMove = corners[Math.floor(Math.random() * corners.length)];
            }
        }
        
        // 5. Try to take a random available side
        if (bestMove === -1) {
            const sides = [1, 3, 5, 7].filter(i => boardState[i] === null);
            if (sides.length > 0) {
                bestMove = sides[Math.floor(Math.random() * sides.length)];
            }
        }
        
        // 6. Fallback (should be rare if logic above is complete)
         if (bestMove === -1) {
            const available = [];
            for(let i=0; i<9; i++) if(boardState[i] === null) available.push(i);
            if(available.length > 0) bestMove = available[Math.floor(Math.random() * available.length)];
        }


        if (bestMove !== -1) {
            makeMove(bestMove, AI_PLAYER);
            checkGameStatus();
        } else {
             // This case should ideally not happen if there are empty cells
            console.error("AI couldn't find a move, but game not over?");
        }
    }

    // Helper for AI to check win without full game state update
    function checkWinConditionForPlayer(player) {
         for (const combination of WINNING_COMBINATIONS) {
            const [a, b, c] = combination;
            if (boardState[a] === player && boardState[b] === player && boardState[c] === player) {
                return true;
            }
        }
        return false;
    }


    // --- Score Management ---
    function loadScore() {
        const savedScore = localStorage.getItem(SCORE_KEY);
        totalScore = savedScore ? parseInt(savedScore) : 0;
        updateScoreDisplays();
    }

    function saveScore() {
        localStorage.setItem(SCORE_KEY, totalScore.toString());
    }

    function addPoints(points) {
        totalScore += points;
        saveScore();
        updateScoreDisplays();
    }

    function updateScoreDisplays() {
        totalScoreDisplay.textContent = `Total Score: ${totalScore}`;
        currentScoreDisplay.textContent = `Score: ${totalScore}`; // Or track session score separately
    }

    // --- UI Navigation ---
    function showModeSelection() {
        modeSelectionScreen.classList.add('active');
        gameScreen.classList.remove('active');
        gameOverModal.style.display = 'none';
        hideSimulatedBanner();
        stopPeriodicAdTimer();
        loadScore(); // Update score display on main menu
    }

    function showGameScreen() {
        modeSelectionScreen.classList.remove('active');
        gameScreen.classList.add('active');
        startGame();
    }

    // --- Event Listeners Setup ---
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));

    hvhButton.addEventListener('click', () => {
        gameMode = 'hvh';
        showGameScreen();
    });

    hvaButton.addEventListener('click', () => {
        gameMode = 'hva';
        showGameScreen();
    });
    
    quitButtonMain.addEventListener('click', () => {
        // In a web browser, you can't truly "quit" the app like a native app.
        // You can close the tab/window, or navigate away.
        alert("To quit, please close this browser tab/window.");
        // Or: window.close(); // May not work depending on how the window was opened.
    });

    restartButton.addEventListener('click', startGame); // Restart current game
    mainMenuButton.addEventListener('click', showModeSelection);

    playAgainModalButton.addEventListener('click', () => {
        gameOverModal.style.display = 'none';
        startGame(); // Restart with same mode
    });
    mainMenuModalButton.addEventListener('click', () => {
        gameOverModal.style.display = 'none';
        showModeSelection();
    });

    watchAdButton.addEventListener('click', () => {
        showSimulatedRewarded((success) => {
            if (success) {
                addPoints(5); // Grant 5 points for "watching"
                alert("You earned 5 points for watching the ad!");
            } else {
                alert("Ad not completed. No points earned.");
            }
        });
    });

    closeAdModalButton.addEventListener('click', closeFullScreenAdModal);


    // --- Initial Setup ---
    showModeSelection(); // Start with mode selection
    // Simulate App Open Ad
    setTimeout(() => {
        // showSimulatedInterstitial('app_open'); // This will show the modal
        // Or just the placeholder text if you don't want an immediate modal
        appOpenAdPlaceholder.style.display = 'block';
        setTimeout(() => appOpenAdPlaceholder.style.display = 'none', 3000); // Hide after 3s
    }, 1000); // Show app open ad placeholder after 1 second
});