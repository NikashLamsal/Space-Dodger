const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const playBtn = document.getElementById("playBtn");
const restartBtn = document.getElementById("restartBtn");
const exitBtn = document.getElementById("exitBtn");
const leftBtn = document.getElementById("left-btn");
const rightBtn = document.getElementById("right-btn");
const shootbtn = document.getElementById("shoot-btn");

canvas.width = 600;
canvas.height = 700;

const player = {
    x: 275,
    y: 600,
    width: 50,
    height: 50,
    color: "cyan",
    speed: 50,  
    name: "Fighter"
};

const asteroids = [];
const coins = [];
const obstacles = [];
const bullets = [];
let asteroidSpeed = 4; 
let coinSpeed = 4; 
let obstacleSpeed = 4; 
const asteroidSize = 50;
let score = 0;
let collectedCoins = 0;
let gameOver = false;
let difficultyLevel = ""; 
const stars = [];

for (let i = 0; i < 150; i++) {  
    stars.push({ 
        x: Math.random() * canvas.width, 
        y: Math.random() * canvas.height, 
        size: Math.random() * 3 + 1,
        speed: Math.random() * 2 + 1, 
        layer: Math.floor(Math.random() * 3) + 1 
    });
}


const shootSound = new Audio("sounds/bullet.wav"); // Sound for shooting bullets
const bulletCollisionSound = new Audio("sounds/blast.mp4"); // Sound for bullet hitting an asteroid/obstacle
const spaceshipCollisionSound = new Audio("sounds/collide.mp4"); // Sound for spaceship collision
const coinCollectSound = new Audio("sounds/coin.wav"); // Sound for collecting coins

shootSound.preload = "auto";
bulletCollisionSound.preload = "auto";
spaceshipCollisionSound.preload = "auto";
coinCollectSound.preload = "auto";

function playSound(sound) {
    try {
        sound.currentTime = 0; 
        sound.play();
    } catch (error) {
        console.error("Error playing sound:", error);
    }
}

//draw bg stars
function drawStars() {
    ctx.fillStyle = "rgb(48, 67, 119)";
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateStars() {
    stars.forEach(star => {
        star.y += star.speed * star.layer; 
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
}

// Draw player
function drawplayer() {
    ctx.shadowColor = "cyan";  
    ctx.shadowBlur = 10;
    ctx.fillStyle = "white"; 

    // Body
    ctx.beginPath();
    ctx.moveTo(player.x - 20, player.y + 30);  
    ctx.lineTo(player.x - 20, player.y - 20); 
    ctx.quadraticCurveTo(player.x, player.y - 40, player.x + 20, player.y - 20);
    ctx.lineTo(player.x + 20, player.y + 30);
    ctx.closePath();
    ctx.fill();
    
    // Window
    ctx.fillStyle = "cyan";
    ctx.beginPath();
    ctx.arc(player.x, player.y - 15, 8, 0, Math.PI, true);
    ctx.fill();

    // Wings
    ctx.fillStyle = "lightgrey";
    ctx.beginPath();
    ctx.moveTo(player.x - 25, player.y + 15);
    ctx.lineTo(player.x - 10, player.y + 30);
    ctx.lineTo(player.x - 10, player.y + 40);
    ctx.moveTo(player.x + 25, player.y + 15);
    ctx.lineTo(player.x + 10, player.y + 30);
    ctx.lineTo(player.x + 10, player.y + 40);
    ctx.closePath();
    ctx.fill();

    // Flames
    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.moveTo(player.x - 12, player.y + 32);
    ctx.lineTo(player.x - 7, player.y + 45);
    ctx.lineTo(player.x - 2, player.y + 32);
    ctx.moveTo(player.x + 2, player.y + 32);
    ctx.lineTo(player.x + 7, player.y + 45);
    ctx.lineTo(player.x + 12, player.y + 32);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
}

// Draw asteroids
function drawasteroids() {
    ctx.fillStyle = "red";
    ctx.shadowColor = "red";
    ctx.shadowBlur = 30;
    asteroids.forEach(asteroid => {
        ctx.beginPath();
        ctx.arc(asteroid.x, asteroid.y, asteroidSize / 2, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.shadowBlur = 0; 
}

// Draw coins
function drawcoins() {
    ctx.fillStyle = "gold";
    ctx.shadowColor = "gold";

    ctx.shadowBlur = 30;
    coins.forEach(coin => {
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, 15, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Draw obstacles
function drawobstacles() {
    ctx.fillStyle = "GREY";
    ctx.shadowColor = "Grey";

    ctx.shadowBlur = 30;
    obstacles.forEach(obstacle => {
        ctx.beginPath();
        ctx.arc(obstacle.x, obstacle.y, 20, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Draw bullets
function drawBullets() {
    bullets.forEach(bullet => {
        ctx.fillStyle = "Cyan";
        ctx.shadowColor = "rgb(92, 220, 255)"; 
        ctx.shadowBlur = 20; 
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 9, 0, Math.PI * 2); 
        ctx.fill();

        const tailLength = 30; 
        const gradient = ctx.createLinearGradient(bullet.x, bullet.y, bullet.x, bullet.y + tailLength);
        gradient.addColorStop(0, "rgb(0, 255, 247)"); 
        gradient.addColorStop(1, "rgba(255, 255, 0, 0)"); 

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(bullet.x - 4, bullet.y);
        ctx.lineTo(bullet.x + 4, bullet.y);
        ctx.lineTo(bullet.x, bullet.y + tailLength); 
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0; 
    });
}

// Update elements
function updateelements() {

    asteroids.forEach((asteroid, index) => {
        asteroid.y += asteroidSpeed;
        if (asteroid.y > canvas.height) {
            asteroids.splice(index, 1);
            score++; 
        }

        // Collision with player
        if (
            asteroid.x < player.x + player.width / 2 &&
            asteroid.x > player.x - player.width / 2 &&
            asteroid.y + asteroidSize / 2 > player.y
        ) {
            gameOver = true;
            playSound(spaceshipCollisionSound);
        }

        // Collision with bullets
        bullets.forEach((bullet, bulletIndex) => {
            if (
                Math.abs(bullet.x - asteroid.x) < asteroidSize / 2 &&
                Math.abs(bullet.y - asteroid.y) < asteroidSize / 2
            ) {
                asteroids.splice(index, 1);
                bullets.splice(bulletIndex, 1);
                score += 2; 
                playSound(bulletCollisionSound); 
            }
        });
    });

    // Update coins
    coins.forEach((coin, index) => {
        coin.y += coinSpeed;
        if (coin.y > canvas.height) {
            coins.splice(index, 1);
        }

        // Check for collection of coin
        if (
            coin.x < player.x + player.width &&
            coin.x + 15 > player.x &&
            coin.y < player.y + player.height &&
            coin.y + 15 > player.y
        ) {
            coins.splice(index, 1);
            collectedCoins++; 
            playSound(coinCollectSound); 
            console.log("Collected Coins:", collectedCoins);
        }
    });

    // Update obstacles
    obstacles.forEach((obstacle, index) => {
        obstacle.y += obstacleSpeed;
        if (obstacle.y > canvas.height) {
            obstacles.splice(index, 1);
        }

        // Collision with player
        if (
            Math.abs(player.x - obstacle.x) < player.width / 2 &&
            Math.abs(player.y - obstacle.y) < player.height / 2
        ) {
            gameOver = true;
            playSound(spaceshipCollisionSound);
        }

        // Collision with bullets
        bullets.forEach((bullet, bulletIndex) => {
            if (
                Math.abs(bullet.x - obstacle.x) < 20 &&
                Math.abs(bullet.y - obstacle.y) < 20
            ) {
                obstacles.splice(index, 1);
                bullets.splice(bulletIndex, 1);
                score += 2; 
                playSound(bulletCollisionSound); 
            }
        });
    });

    // Update bullets
    bullets.forEach((bullet, index) => {
        bullet.y -= 5; 
        if (bullet.y < 0) {
            bullets.splice(index, 1); 
        }
    });
}

// Player movement

leftBtn.addEventListener("touchstart", () => {
    if (player.x > 50) player.x -= player.speed;
});

rightBtn.addEventListener("touchstart", () => {
    if (player.x < canvas.width - 50) player.x += player.speed;
});

shootbtn.addEventListener("touchstart", () => {
    bullets.push({ x: player.x, y: player.y - 25 });
    playSound(shootSound); 
});

document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft" && player.x > 50) {
        player.x -= player.speed;
    } else if (event.key === "ArrowRight" && player.x < canvas.width - 50) {
        player.x += player.speed;
    } else if (event.key === " ") { 
        bullets.push({ x: player.x, y: player.y - 25 });
        playSound(shootSound);
    }
});

// Create new elements
function newelements() {
    if (!gameOver) {
        for (let i = 0; i < 2; i++) {  
            if (Math.random() < 0.8) {  
                asteroids.push({ x: Math.random() * (canvas.width - asteroidSize), y: -asteroidSize });
            }
            if (Math.random() < 0.7) {  
                obstacles.push({ x: Math.random() * (canvas.width - 30), y: -30 });
            }
            if (Math.random() < 0.6) {  
                coins.push({ x: Math.random() * (canvas.width - 30), y: -15 });
            }
        }
    }
}


// Update game
function updateGame() {
    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "30px 'Press Start 2P'";
        ctx.fillText("Game Over!", 160, 350);
        exitBtn.style.display = "block";  
        restartBtn.style.display = "block";  
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStars();
    updateStars();
    drawplayer();
    drawasteroids();
    drawcoins();
    drawobstacles();
    drawBullets();
    updateelements();

    ctx.fillStyle = "cyan";
    ctx.font = "15px 'Press Start 2P'"; 

    ctx.fillText("Score: " + score, 10, 30);
    ctx.fillText("Coins: " + collectedCoins, 10, 60);

    const displayName = player.name.length > 10 ? player.name.substring(0, 10) + "..." : player.name;
    ctx.fillText("Fighter: " + displayName, canvas.width - 200, 30);
    ctx.fillText("Level: " + difficultyLevel, canvas.width - 200, 60);

    requestAnimationFrame(updateGame);
}

// Start game
function startGame() {
    playBtn.style.display = "none";  
    restartBtn.style.display = "none";  

    if (player.name === "Fighter") { 
        const playerName = prompt("Enter your name: ");
        player.name = playerName || "Fighter";
    }

    if (difficultyLevel === "") { 
        const difficulty = prompt("Choose difficulty (easy, medium, hard):");
        if (difficulty === "hard") {
            asteroidSpeed = 4;
            coinSpeed = 4;
            obstacleSpeed = 4;
            difficultyLevel = "Hard";
        } else if (difficulty === "medium") {
            asteroidSpeed = 2;
            coinSpeed = 2;
            obstacleSpeed = 2;
            difficultyLevel = "Medium";
        } else {
            asteroidSpeed = 1;
            coinSpeed = 1;
            obstacleSpeed = 1;
            difficultyLevel = "Easy";
        }
    }

    updateGame(); 
}


// Restart game
function restartGame() {
    gameOver = false;
    player.x = 275;
    asteroids.length = 0;
    coins.length = 0;
    obstacles.length = 0;
    bullets.length = 0;
    score = 0;
    collectedCoins = 0;

    restartBtn.style.display = "none";  
    exitBtn.style.display = "none";

    updateGame(); 
}

exitBtn.addEventListener("click", function() {
    location.reload();
});

playBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);

setInterval(newelements, 1000);