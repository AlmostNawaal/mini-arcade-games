// Game constants
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;
const CIRCLE_RADIUS = 12;
const NUM_BOTS = 49;
const TOTAL_CIRCLES = 50;
const BOT_SPEED = 1.5;
const PLAYER_SPEED = 2;
const GAME_TIME = 60; // seconds
const DETECTION_THRESHOLD = 0.25; // How "straight" movement triggers detection
const MOVEMENT_HISTORY_SIZE = 20; // Frames to analyze for straight movement
const GREEN_ZONE_RADIUS = 80;

// Game state
let canvas, ctx;
let circles = [];
let playerIndex = 0;
let gameRunning = false;
let timeLeft = GAME_TIME;
let timerInterval = null;
let keys = {};
let movementHistory = [];
let detectionWarningLevel = 0;
let eyePosition = { x: CANVAS_WIDTH / 2, y: 100 };
let eyeBlinkTimer = 0;

// Circle class
class Circle {
    constructor(x, y, isPlayer = false) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.isPlayer = isPlayer;
        this.targetX = x;
        this.targetY = y;
        this.changeDirectionTimer = 0;
    }

    update() {
        if (this.isPlayer) {
            this.updatePlayer();
        } else {
            this.updateBot();
        }

        // Keep in bounds
        if (this.x < CIRCLE_RADIUS) this.x = CIRCLE_RADIUS;
        if (this.x > CANVAS_WIDTH - CIRCLE_RADIUS) this.x = CANVAS_WIDTH - CIRCLE_RADIUS;
        if (this.y < CIRCLE_RADIUS) this.y = CIRCLE_RADIUS;
        if (this.y > CANVAS_HEIGHT - CIRCLE_RADIUS) this.y = CANVAS_HEIGHT - CIRCLE_RADIUS;
    }

    updatePlayer() {
        // Player movement with WASD or arrow keys
        let dx = 0;
        let dy = 0;

        if (keys['ArrowUp'] || keys['w'] || keys['W']) dy -= 1;
        if (keys['ArrowDown'] || keys['s'] || keys['S']) dy += 1;
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) dx -= 1;
        if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += 1;

        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }

        // Add jitter to mimic bots (subtle)
        if (dx !== 0 || dy !== 0) {
            dx += (Math.random() - 0.5) * 0.3;
            dy += (Math.random() - 0.5) * 0.3;
        }

        this.vx = dx * PLAYER_SPEED;
        this.vy = dy * PLAYER_SPEED;

        this.x += this.vx;
        this.y += this.vy;

        // Track movement for detection
        if (this.vx !== 0 || this.vy !== 0) {
            movementHistory.push({ x: this.x, y: this.y });
            if (movementHistory.length > MOVEMENT_HISTORY_SIZE) {
                movementHistory.shift();
            }
        }
    }

    updateBot() {
        // Erratic bot movement
        this.changeDirectionTimer--;

        if (this.changeDirectionTimer <= 0) {
            // Change direction randomly
            this.changeDirectionTimer = Math.random() * 40 + 20;
            
            const angle = Math.random() * Math.PI * 2;
            const speed = BOT_SPEED * (0.5 + Math.random() * 0.5);
            
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
        }

        // Add random jitter
        this.vx += (Math.random() - 0.5) * 0.8;
        this.vy += (Math.random() - 0.5) * 0.8;

        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x <= CIRCLE_RADIUS || this.x >= CANVAS_WIDTH - CIRCLE_RADIUS) {
            this.vx *= -1;
            this.changeDirectionTimer = 0;
        }
        if (this.y <= CIRCLE_RADIUS || this.y >= CANVAS_HEIGHT - CIRCLE_RADIUS) {
            this.vy *= -1;
            this.changeDirectionTimer = 0;
        }

        // Damping
        this.vx *= 0.95;
        this.vy *= 0.95;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, CIRCLE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#888';
        ctx.fill();
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Event listeners
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', restartGame);

    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });

    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
}

function startGame() {
    document.getElementById('instructions').classList.add('hidden');
    resetGame();
    gameRunning = true;
    startTimer();
    gameLoop();
}

function resetGame() {
    circles = [];
    movementHistory = [];
    detectionWarningLevel = 0;
    timeLeft = GAME_TIME;
    keys = {};

    // Create circles in random positions
    for (let i = 0; i < TOTAL_CIRCLES; i++) {
        let x, y;
        let validPosition = false;

        // Avoid spawning in green zone or too close to others
        while (!validPosition) {
            x = Math.random() * (CANVAS_WIDTH - CIRCLE_RADIUS * 4) + CIRCLE_RADIUS * 2;
            y = Math.random() * (CANVAS_HEIGHT - CIRCLE_RADIUS * 4) + CIRCLE_RADIUS * 2;

            const distToGreenZone = Math.hypot(
                x - CANVAS_WIDTH + GREEN_ZONE_RADIUS,
                y - CANVAS_HEIGHT + GREEN_ZONE_RADIUS
            );

            if (distToGreenZone > GREEN_ZONE_RADIUS + 100) {
                validPosition = true;
            }
        }

        const isPlayer = i === 0;
        circles.push(new Circle(x, y, isPlayer));
    }

    playerIndex = 0;
    updateStatus('Blend in and reach the Green Zone!');
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('time-left').textContent = timeLeft;

        if (timeLeft <= 10) {
            document.getElementById('timer').style.color = '#ff4444';
        }

        if (timeLeft <= 0) {
            endGame(false, 'Time ran out!');
        }
    }, 1000);
}

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw green zone
    drawGreenZone();

    // Draw the Eye
    drawEye();

    // Update and draw all circles
    circles.forEach(circle => circle.update());
    circles.forEach(circle => circle.draw());

    // Check for detection
    checkDetection();

    // Check for victory
    checkVictory();

    requestAnimationFrame(gameLoop);
}

function drawGreenZone() {
    const x = CANVAS_WIDTH - GREEN_ZONE_RADIUS - 20;
    const y = CANVAS_HEIGHT - GREEN_ZONE_RADIUS - 20;

    ctx.beginPath();
    ctx.arc(x, y, GREEN_ZONE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 255, 100, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#00ff64';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#00ff64';
    ctx.font = '20px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('EXIT', x, y);
}

function drawEye() {
    eyeBlinkTimer++;

    const player = circles[playerIndex];
    
    // Eye follows player subtly
    const targetX = CANVAS_WIDTH / 2 + (player.x - CANVAS_WIDTH / 2) * 0.3;
    const targetY = 100 + (player.y - CANVAS_HEIGHT / 2) * 0.2;
    
    eyePosition.x += (targetX - eyePosition.x) * 0.05;
    eyePosition.y += (targetY - eyePosition.y) * 0.05;

    // Draw eye background
    ctx.beginPath();
    ctx.arc(eyePosition.x, eyePosition.y, 40, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Draw iris
    const irisX = eyePosition.x + (player.x - eyePosition.x) * 0.02;
    const irisY = eyePosition.y + (player.y - eyePosition.y) * 0.02;
    
    ctx.beginPath();
    ctx.arc(irisX, irisY, 20, 0, Math.PI * 2);
    ctx.fillStyle = detectionWarningLevel > 0.5 ? '#ff4444' : '#4444ff';
    ctx.fill();

    // Draw pupil
    ctx.beginPath();
    ctx.arc(irisX, irisY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();

    // Eye glow based on detection
    if (detectionWarningLevel > 0.3) {
        ctx.shadowBlur = 20 * detectionWarningLevel;
        ctx.shadowColor = '#ff0000';
        
        ctx.strokeStyle = `rgba(255, 0, 0, ${detectionWarningLevel})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(eyePosition.x, eyePosition.y, 45, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
    }

    // Scan line occasionally
    if (eyeBlinkTimer % 120 < 60) {
        ctx.strokeStyle = `rgba(255, 100, 100, ${0.3 * (1 - (eyeBlinkTimer % 60) / 60)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(eyePosition.x, eyePosition.y);
        ctx.lineTo(player.x, player.y);
        ctx.stroke();
    }
}

function checkDetection() {
    if (movementHistory.length < 10) {
        detectionWarningLevel = Math.max(0, detectionWarningLevel - 0.02);
        return;
    }

    // Calculate how "straight" the recent movement is
    const recentMoves = movementHistory.slice(-15);
    
    if (recentMoves.length < 5) return;

    // Calculate variance in direction
    let angles = [];
    for (let i = 1; i < recentMoves.length; i++) {
        const dx = recentMoves[i].x - recentMoves[i - 1].x;
        const dy = recentMoves[i].y - recentMoves[i - 1].y;
        
        if (dx !== 0 || dy !== 0) {
            angles.push(Math.atan2(dy, dx));
        }
    }

    if (angles.length < 3) {
        detectionWarningLevel = Math.max(0, detectionWarningLevel - 0.02);
        return;
    }

    // Calculate variance
    let variance = 0;
    const avgAngle = angles.reduce((a, b) => a + b) / angles.length;
    
    for (let angle of angles) {
        let diff = angle - avgAngle;
        // Normalize angle difference
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        variance += diff * diff;
    }
    variance /= angles.length;

    // Low variance = straight line = human-like = detected!
    if (variance < DETECTION_THRESHOLD) {
        detectionWarningLevel = Math.min(1, detectionWarningLevel + 0.08);
        
        if (detectionWarningLevel > 0.5) {
            updateStatus('âš ï¸ THE EYE IS WATCHING YOU...');
        }
        
        if (detectionWarningLevel >= 1) {
            endGame(false, 'The Eye detected your human movement!');
        }
    } else {
        detectionWarningLevel = Math.max(0, detectionWarningLevel - 0.03);
        if (detectionWarningLevel < 0.3) {
            updateStatus('Blend in and reach the Green Zone!');
        }
    }

    // Visual warning
    if (detectionWarningLevel > 0.5) {
        canvas.style.borderColor = `rgba(255, 0, 0, ${detectionWarningLevel})`;
    } else {
        canvas.style.borderColor = '#333';
    }
}

function checkVictory() {
    const player = circles[playerIndex];
    const greenZoneX = CANVAS_WIDTH - GREEN_ZONE_RADIUS - 20;
    const greenZoneY = CANVAS_HEIGHT - GREEN_ZONE_RADIUS - 20;
    
    const distToGreenZone = Math.hypot(player.x - greenZoneX, player.y - greenZoneY);
    
    if (distToGreenZone < GREEN_ZONE_RADIUS - CIRCLE_RADIUS) {
        endGame(true, `You escaped! Time remaining: ${timeLeft}s`);
    }
}

function endGame(victory, message) {
    gameRunning = false;
    if (timerInterval) clearInterval(timerInterval);

    const overlay = document.getElementById('game-over');
    const title = document.getElementById('result-title');
    const messageEl = document.getElementById('result-message');

    if (victory) {
        title.textContent = 'ESCAPE SUCCESSFUL!';
        title.style.color = '#00ff88';
    } else {
        title.textContent = 'DETECTED!';
        title.style.color = '#ff4444';
    }

    messageEl.textContent = message;
    overlay.classList.remove('hidden');
}

function restartGame() {
    document.getElementById('game-over').classList.add('hidden');
    canvas.style.borderColor = '#333';
    document.getElementById('timer').style.color = '#00ff88';
    startGame();
}

// Initialize on load
window.addEventListener('load', init);