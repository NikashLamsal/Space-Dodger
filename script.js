const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const playBtn = document.getElementById("playBtn");
const restartBtn = document.getElementById("restartBtn");

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
const asteroidSpeed = 4;
const asteroidSize = 50;
let score = 0;
let collectedCoins = 0;
let gameOver = false;

//draw player
function drawplayer() {
    ctx.shadowColor = "cyan";  
    ctx.shadowBlur = 10;
    ctx.fillStyle = "white"; 

    //Body
    ctx.beginPath();
    ctx.moveTo(player.x - 20, player.y + 30);  
    ctx.lineTo(player.x - 20, player.y - 20); 
    ctx.quadraticCurveTo(player.x, player.y - 40, player.x + 20, player.y - 20);
    ctx.lineTo(player.x + 20, player.y + 30);
    ctx.closePath();
    ctx.fill();
    
    //Window
    ctx.fillStyle = "cyan";
    ctx.beginPath();
    ctx.arc(player.x, player.y - 15, 8, 0, Math.PI, true);
    ctx.fill();

    //Wings
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

    //Flames
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

// asteroids
function drawasteroids() {
    ctx.fillStyle = "red";
    ctx.shadowColor = "red";
    ctx.shadowBlur = 15;
    asteroids.forEach(asteroid => {
        ctx.beginPath();
        ctx.arc(asteroid.x, asteroid.y, asteroidSize / 2, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.shadowBlur = 0; 
}

//coins
function drawcoins() {
    ctx.fillStyle = "gold";
    coins.forEach(coin => {
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, 15, 0, Math.PI * 2);
        ctx.fill();
    });
}

//obstacles
function drawobstacles() {
    ctx.fillStyle = "GREY";
    obstacles.forEach(obstacle => {
        ctx.beginPath();
        ctx.arc(obstacle.x, obstacle.y, 20, 0, Math.PI * 2);
        ctx.fill();
    });
}

//update A,c,O
function updateelements() {
    asteroids.forEach((asteroid, index) => {
        asteroid.y += asteroidSpeed;
        if (asteroid.y > canvas.height) {
            asteroids.splice(index, 1);
            score++; 
        }

        //collision with player
        if (
            asteroid.x < player.x + player.width / 2 &&
            asteroid.x > player.x - player.width / 2 &&
            asteroid.y + asteroidSize / 2 > player.y
        ) {
            gameOver = true;
        }
    });

    //check for coins
    coins.forEach((coin, index) => {
        coin.y += 4;
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
            console.log("Collected Coins:", collectedCoins);
        }
    });

    //check for obstacles
    obstacles.forEach((obstacle, index) => {
        obstacle.y += 4;
        if (obstacle.y > canvas.height) {
            obstacles.splice(index, 1);
        }

        // collision with player of obstacles
        if (
            Math.abs(player.x - obstacle.x) < player.width / 2 &&
            Math.abs(player.y - obstacle.y) < player.height / 2
        ) {
            gameOver = true;
        }
    });
}

// player movement
document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft" && player.x > 50) {
        player.x -= player.speed;
    } else if (event.key === "ArrowRight" && player.x < canvas.width - 50) {
        player.x += player.speed;
    }
});

//create new A,O,C
function newelements() {
    if (!gameOver) {
        if (Math.random() < 0.3) {  
            const randomX = Math.floor(Math.random() * (canvas.width - 30));
            coins.push({ x: randomX, y: -15 });
        }
        if (Math.random() < 0.2) { 
            const randomX = Math.floor(Math.random() * (canvas.width - 30));
            obstacles.push({ x: randomX, y: -30 });
        }
        if (Math.random() < 0.5) { 
            const randomX = Math.floor(Math.random() * (canvas.width - asteroidSize));
            asteroids.push({ x: randomX, y: -asteroidSize });
        }
    }
}

function updateGame() {
    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "30px 'Press Start 2P'";
        ctx.fillText("Game Over!", 160, 350);

        restartBtn.style.display = "block";  
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawplayer();
    drawasteroids();
    drawcoins();
    drawobstacles();
    updateelements();

    ctx.fillStyle = "white";
    ctx.font = "20px 'Press Start 2P'";
    ctx.fillText("Score: " + score, 10, 40);
    ctx.fillText("Coins: " + collectedCoins, canvas.width - 160, 40); 

    requestAnimationFrame(updateGame);
}

function startGame() {
    const playerName = prompt("Enter your name: ");
    player.name = playerName || "Fighter";

    playBtn.style.display = "none";  
    restartBtn.style.display = "none";  
    updateGame(); 
}

function restartGame() {
    gameOver = false;
    player.x = 275;
    asteroids.length = 0;
    coins.length = 0;
    obstacles.length = 0;
    score = 0;
    collectedCoins = 0;

    restartBtn.style.display = "none";  
    updateGame(); 
}


setInterval(newelements, 1000);
