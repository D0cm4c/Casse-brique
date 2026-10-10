// Configuration du jeu
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');

// Paramètres du jeu
const config = {
    paddleWidth: 100,
    paddleHeight: 15,
    ballRadius: 10,
    brickWidth: 75,
    brickHeight: 20,
    brickRows: 5,
    brickColumns: 10,
    brickPadding: 10,
    brickOffsetTop: 60,
    brickOffsetLeft: 30,
    paddleSpeed: 8,
    ballSpeed: 5,
    initialLives: 3
};

// État du jeu
let gameState = {
    score: 0,
    lives: config.initialLives,
    gameRunning: false,
    gameOver: false,
    gameWon: false
};

// Raquette
const paddle = {
    x: canvas.width / 2 - config.paddleWidth / 2,
    y: canvas.height - config.paddleHeight - 20,
    width: config.paddleWidth,
    height: config.paddleHeight,
    speed: config.paddleSpeed,
    movingRight: false,
    movingLeft: false
};

// Balle
const ball = {
    x: canvas.width / 2,
    y: canvas.height - config.paddleHeight - 40,
    radius: config.ballRadius,
    speed: config.ballSpeed,
    dx: 0,
    dy: 0,
    launched: false
};

// Briques
const bricks = [];

// Initialisation des briques
function initBricks() {
    bricks.length = 0;
    for (let row = 0; row < config.brickRows; row++) {
        bricks[row] = [];
        for (let col = 0; col < config.brickColumns; col++) {
            bricks[row][col] = {
                x: col * (config.brickWidth + config.brickPadding) + config.brickOffsetLeft,
                y: row * (config.brickHeight + config.brickPadding) + config.brickOffsetTop,
                width: config.brickWidth,
                height: config.brickHeight,
                visible: true,
                color: getBrickColor(row)
            };
        }
    }
}

// Couleur des briques selon la ligne
function getBrickColor(row) {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3'];
    return colors[row % colors.length];
}

// Dessiner la raquette
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

// Dessiner la balle
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.closePath();
}

// Dessiner les briques
function drawBricks() {
    for (let row = 0; row < bricks.length; row++) {
        for (let col = 0; col < bricks[row].length; col++) {
            const brick = bricks[row][col];
            if (brick.visible) {
                ctx.beginPath();
                ctx.rect(brick.x, brick.y, brick.width, brick.height);
                ctx.fillStyle = brick.color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// Dessiner le jeu
function draw() {
    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dessiner les éléments
    drawBricks();
    drawPaddle();
    drawBall();
    
    // Afficher le message de victoire/défaite
    if (gameState.gameOver) {
        ctx.font = '32px Arial';
        ctx.fillStyle = '#FF0000';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over! Appuyez sur R pour recommencer', canvas.width / 2, canvas.height / 2);
    }
    
    if (gameState.gameWon) {
        ctx.font = '32px Arial';
        ctx.fillStyle = '#00FF00';
        ctx.textAlign = 'center';
        ctx.fillText('Vous avez gagné! Appuyez sur R pour recommencer', canvas.width / 2, canvas.height / 2);
    }
    
    if (!gameState.gameRunning && !gameState.gameOver && !gameState.gameWon) {
        ctx.font = '24px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText('Appuyez sur Espace pour lancer la balle', canvas.width / 2, canvas.height / 2);
    }
}

// Mettre à jour le jeu
function update() {
    if (gameState.gameOver || gameState.gameWon) return;
    
    // Déplacer la raquette
    if (paddle.movingRight && paddle.x < canvas.width - paddle.width) {
        paddle.x += paddle.speed;
    }
    if (paddle.movingLeft && paddle.x > 0) {
        paddle.x -= paddle.speed;
    }
    
    // Si la balle n'est pas lancée, la placer sur la raquette
    if (!ball.launched) {
        ball.x = paddle.x + paddle.width / 2;
        ball.y = paddle.y - ball.radius - 5;
        return;
    }
    
    // Déplacer la balle
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Collision avec les murs
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }
    
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }
    
    // Collision avec la raquette (seulement quand la balle descend,
    // sinon le rebond se rejoue à chaque image tant que la balle traverse la raquette)
    if (
        ball.dy > 0 &&
        ball.y + ball.radius > paddle.y &&
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width
    ) {
        // Calculer l'angle de rebond en fonction de l'endroit où la balle touche la raquette
        const hitPosition = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
        ball.dx = hitPosition * ball.speed;
        ball.dy = -Math.sqrt(ball.speed * ball.speed - ball.dx * ball.dx);
        // Replacer la balle au-dessus de la raquette pour éviter qu'elle reste coincée
        ball.y = paddle.y - ball.radius;
    }
    
    // Collision avec les briques
    for (let row = 0; row < bricks.length; row++) {
        for (let col = 0; col < bricks[row].length; col++) {
            const brick = bricks[row][col];
            if (brick.visible) {
                if (
                    ball.x + ball.radius > brick.x &&
                    ball.x - ball.radius < brick.x + brick.width &&
                    ball.y + ball.radius > brick.y &&
                    ball.y - ball.radius < brick.y + brick.height
                ) {
                    brick.visible = false;
                    gameState.score += 10;
                    scoreElement.textContent = gameState.score;
                    
                    // Déterminer le côté de la collision
                    const ballCenterX = ball.x;
                    const ballCenterY = ball.y;
                    const brickCenterX = brick.x + brick.width / 2;
                    const brickCenterY = brick.y + brick.height / 2;
                    
                    const dx = ballCenterX - brickCenterX;
                    const dy = ballCenterY - brickCenterY;
                    
                    if (Math.abs(dx) > Math.abs(dy)) {
                        ball.dx = -ball.dx;
                    } else {
                        ball.dy = -ball.dy;
                    }
                    
                    // Vérifier si toutes les briques sont cassées
                    if (areAllBricksBroken()) {
                        gameState.gameWon = true;
                        gameState.gameRunning = false;
                    }
                }
            }
        }
    }
    
    // Balle tombe en bas
    if (ball.y + ball.radius > canvas.height) {
        gameState.lives--;
        livesElement.textContent = gameState.lives;
        
        if (gameState.lives <= 0) {
            gameState.gameOver = true;
            gameState.gameRunning = false;
        } else {
            // Réinitialiser la balle
            ball.x = paddle.x + paddle.width / 2;
            ball.y = paddle.y - ball.radius - 5;
            ball.dx = 0;
            ball.dy = 0;
            ball.launched = false;
            gameState.gameRunning = false;
        }
    }
}

// Vérifier si toutes les briques sont cassées
function areAllBricksBroken() {
    for (let row = 0; row < bricks.length; row++) {
        for (let col = 0; col < bricks[row].length; col++) {
            if (bricks[row][col].visible) {
                return false;
            }
        }
    }
    return true;
}

// Lancer la balle
function launchBall() {
    if (!ball.launched && !gameState.gameOver && !gameState.gameWon) {
        // Angle aléatoire entre 30° et 60° de chaque côté de la verticale :
        // ni quasi vertical (ennuyeux), ni quasi horizontal (balle qui n'avance plus)
        const angle = (Math.PI / 6) + Math.random() * (Math.PI / 6);
        const direction = Math.random() < 0.5 ? -1 : 1;
        ball.dx = direction * config.ballSpeed * Math.sin(angle);
        ball.dy = -config.ballSpeed * Math.cos(angle);
        ball.launched = true;
        gameState.gameRunning = true;
    }
}

// Réinitialiser le jeu
function resetGame() {
    gameState.score = 0;
    gameState.lives = config.initialLives;
    gameState.gameRunning = false;
    gameState.gameOver = false;
    gameState.gameWon = false;
    
    scoreElement.textContent = gameState.score;
    livesElement.textContent = gameState.lives;
    
    paddle.x = canvas.width / 2 - config.paddleWidth / 2;
    paddle.y = canvas.height - config.paddleHeight - 20;
    
    ball.x = paddle.x + paddle.width / 2;
    ball.y = paddle.y - ball.radius - 5;
    ball.dx = 0;
    ball.dy = 0;
    ball.launched = false;
    
    initBricks();
}

// Gestion des touches
function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        paddle.movingRight = true;
    }
    if (e.key === 'Left' || e.key === 'ArrowLeft') {
        paddle.movingLeft = true;
    }
    if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault(); // sinon la page défile
        launchBall();
    }
    if ((e.key === 'r' || e.key === 'R') && (gameState.gameOver || gameState.gameWon)) {
        resetGame();
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        paddle.movingRight = false;
    }
    if (e.key === 'Left' || e.key === 'ArrowLeft') {
        paddle.movingLeft = false;
    }
}

// Écouteurs d'événements
window.addEventListener('keydown', keyDownHandler);
window.addEventListener('keyup', keyUpHandler);

// Boucle principale du jeu
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Initialisation
initBricks();
resetGame();
gameLoop();
