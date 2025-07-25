// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [
    {x: 10, y: 10}
];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let level = 1;
let gameRunning = false;
let gameSpeed = 150;
let isPaused = false;

// Load high score from localStorage
let highScore = localStorage.getItem('snakeHighScore') || 0;
document.getElementById('highScore').textContent = highScore;

// Generate random food position
function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // Make sure food doesn't spawn on snake
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            return;
        }
    }
}

// Draw game elements
function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // Draw snake
    ctx.fillStyle = '#4ecdc4';
    ctx.shadowColor = '#4ecdc4';
    ctx.shadowBlur = 10;
    
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head of snake
            ctx.fillStyle = '#ff6b6b';
            ctx.shadowColor = '#ff6b6b';
        } else {
            // Body of snake
            ctx.fillStyle = `hsl(${170 + index * 2}, 60%, ${60 - index}%)`;
            ctx.shadowColor = ctx.fillStyle;
        }
        
        const x = segment.x * gridSize;
        const y = segment.y * gridSize;
        
        ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
        
        // Add some shine effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x + 4, y + 4, gridSize - 12, gridSize - 12);
    });

    // Draw food
    ctx.shadowColor = '#ffeb3b';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ffeb3b';
    const foodX = food.x * gridSize;
    const foodY = food.y * gridSize;
    
    // Draw food as a circle
    ctx.beginPath();
    ctx.arc(foodX + gridSize/2, foodY + gridSize/2, gridSize/2 - 2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Add food shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(foodX + gridSize/2 - 3, foodY + gridSize/2 - 3, 3, 0, 2 * Math.PI);
    ctx.fill();

    // Reset shadow
    ctx.shadowBlur = 0;
}

// Move snake
function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    // Check self collision
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10 * level;
        updateScore();
        generateFood();
        
        // Increase level every 50 points
        if (score % 50 === 0) {
            level++;
            gameSpeed = Math.max(80, gameSpeed - 10);
            document.getElementById('level').textContent = level;
            
            // Visual feedback for level up
            document.querySelector('.game-container').classList.add('pulse');
            setTimeout(() => {
                document.querySelector('.game-container').classList.remove('pulse');
            }, 300);
        }
    } else {
        snake.pop();
    }
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = score;
    
    if (score > highScore) {
        highScore = score;
        document.getElementById('highScore').textContent = highScore;
        localStorage.setItem('snakeHighScore', highScore);
    }
}

// Game over
function gameOver() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    
    if (score >= localStorage.getItem('snakeHighScore')) {
        document.getElementById('newHighScore').style.display = 'block';
    } else {
        document.getElementById('newHighScore').style.display = 'none';
    }
    
    document.getElementById('gameOver').style.display = 'block';
}

// Restart game
function restartGame() {
    snake = [{x: 10, y: 10}];
    dx = 0;
    dy = 0;
    score = 0;
    level = 1;
    gameSpeed = 150;
    isPaused = false;
    
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('pauseOverlay').style.display = 'none';
    
    generateFood();
    gameRunning = true;
    gameLoop();
}

// Toggle pause
function togglePause() {
    if (!gameRunning) return;
    
    isPaused = !isPaused;
    if (isPaused) {
        document.getElementById('pauseOverlay').style.display = 'block';
    } else {
        document.getElementById('pauseOverlay').style.display = 'none';
        gameLoop();
    }
}

// Game loop
function gameLoop() {
    if (!gameRunning || isPaused) return;
    
    moveSnake();
    drawGame();
    
    setTimeout(gameLoop, gameSpeed);
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameRunning && e.code !== 'Space') return;
    
    switch(e.code) {
        case 'ArrowUp':
        case 'KeyW':
            if (dy !== 1) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
        case 'KeyS':
            if (dy !== -1) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
        case 'KeyA':
            if (dx !== 1) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
        case 'KeyD':
            if (dx !== -1) { dx = 1; dy = 0; }
            break;
        case 'Space':
            e.preventDefault();
            if (gameRunning) {
                togglePause();
            } else {
                restartGame();
            }
            break;
    }
});

// Touch controls for mobile
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (!gameRunning) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0 && dx !== -1) {
            dx = 1; dy = 0; // Right
        } else if (deltaX < 0 && dx !== 1) {
            dx = -1; dy = 0; // Left
        }
    } else {
        // Vertical swipe
        if (deltaY > 0 && dy !== -1) {
            dx = 0; dy = 1; // Down
        } else if (deltaY < 0 && dy !== 1) {
            dx = 0; dy = -1; // Up
        }
    }
});

// Initialize game
generateFood();
drawGame();

// Start game when any movement key is pressed
document.addEventListener('keydown', (e) => {
    if (!gameRunning && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
        gameRunning = true;
        gameLoop();
    }
});