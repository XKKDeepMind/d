document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalScoreElement = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-button');

    const ctx = gameBoard.getContext('2d');
    const gridSize = 20;
    let snake = [{ x: 10, y: 10 }];
    let food = {};
    let direction = 'right';
    let score = 0;
    let highScore = localStorage.getItem('highScore') || 0;
    let gameLoop;
    let isGameOver = false;

    highScoreElement.textContent = highScore;

    function generateFood() {
        food = {
            x: Math.floor(Math.random() * (gameBoard.width / gridSize)),
            y: Math.floor(Math.random() * (gameBoard.height / gridSize))
        };
    }

    function draw() {
        ctx.clearRect(0, 0, gameBoard.width, gameBoard.height);

        // Draw snake
        snake.forEach((segment, index) => {
            ctx.fillStyle = index === 0 ? 'green' : '#00a000';
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        });

        // Draw food
        ctx.fillStyle = 'red';
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    }

    function update() {
        if (isGameOver) return;

        const head = { ...snake[0] };

        switch (direction) {
            case 'up':
                head.y--;
                break;
            case 'down':
                head.y++;
                break;
            case 'left':
                head.x--;
                break;
            case 'right':
                head.x++;
                break;
        }

        // Wall collision
        if (head.x < 0 || head.x >= gameBoard.width / gridSize || head.y < 0 || head.y >= gameBoard.height / gridSize) {
            gameOver();
            return;
        }

        // Self collision
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver();
                return;
            }
        }

        snake.unshift(head);

        // Food collision
        if (head.x === food.x && head.y === food.y) {
            score++;
            scoreElement.textContent = score;
            generateFood();
        } else {
            snake.pop();
        }

        draw();
    }

    function gameOver() {
        isGameOver = true;
        clearInterval(gameLoop);
        finalScoreElement.textContent = score;
        gameOverScreen.classList.remove('hidden');

        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
            highScoreElement.textContent = highScore;
        }
    }

    function handleKeyPress(e) {
        const key = e.key;
        if (key === 'ArrowUp' && direction !== 'down') {
            direction = 'up';
        } else if (key === 'ArrowDown' && direction !== 'up') {
            direction = 'down';
        } else if (key === 'ArrowLeft' && direction !== 'right') {
            direction = 'left';
        } else if (key === 'ArrowRight' && direction !== 'left') {
            direction = 'right';
        }
    }

    function startGame() {
        snake = [{ x: 10, y: 10 }];
        direction = 'right';
        score = 0;
        scoreElement.textContent = 0;
        isGameOver = false;
        gameOverScreen.classList.add('hidden');
        generateFood();
        draw();
        gameLoop = setInterval(update, 100);
    }

    document.addEventListener('keydown', handleKeyPress);
    restartButton.addEventListener('click', startGame);

    startGame();
});