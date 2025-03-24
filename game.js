const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

<<<<<<< HEAD
// Set canvas size
canvas.width = 800;
canvas.height = 600;
=======
// 設置 canvas 大小為視窗大小
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// 初始化和監聽視窗大小變化
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
>>>>>>> 201d4ac (更新 game.js 和 style.css 和index.html，優化遊戲效果)

// Game state
let score = 0;
let lives = 3;
let gameRunning = true;
let fruits = [];
let bombs = [];
let slices = [];
let lastTime = 0;
const fruitTypes = ['🍎', '🍊', '🍉', '🍇', '🍓', '🍐', '🍌'];

// Mouse tracking
let mouseX = 0;
let mouseY = 0;
let lastMouseX = 0;
let lastMouseY = 0;

class GameObject {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.velocityY = -8; // 增加初始向上速度，讓水果飛得更高
        this.velocityX = (Math.random() - 0.5) * 2; // 初始随机水平速度
        this.gravity = 0.1; // 稍微降低重力，讓水果在空中停留更久
        this.rotation = 0; // 初始旋转角度
        this.rotationSpeed = (Math.random() - 0.5) * 0.1; // 初始随机旋转速度           
        this.size = 60; // 初始大小         
        this.sliced = false;            
        this.slicedPieces = [];     
<<<<<<< HEAD
=======
        this.juiceParticles = []; // 噴汁粒子
        this.juiceColor = this.getJuiceColor(); // 根據水果類型設置汁液顏色
    }

    getJuiceColor() {
        // 根據水果類型返回對應的汁液顏色
        const colors = {
            '🍎': '#ff0000',
            '🍊': '#ffa500',
            '🍉': '#ff6b6b',
            '🍇': '#6f2da8',
            '🍓': '#ff4d4d',
            '🍐': '#a0db8e',
            '🍌': '#ffeb3b',
            '💣': '#000000'
        };
        return colors[this.type] || '#ffffff';
    }

    createJuiceParticles() {
        // 創建噴汁粒子
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.random() * Math.PI * 2);
            const speed = Math.random() * 5 + 2;
            const particle = {
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                size: Math.random() * 4 + 2,
                alpha: 1,
                gravity: 0.1
            };
            this.juiceParticles.push(particle);
        }
>>>>>>> 201d4ac (更新 game.js 和 style.css 和index.html，優化遊戲效果)
    }

    update() {
        if (this.sliced) {
<<<<<<< HEAD
=======
            // 更新切片
>>>>>>> 201d4ac (更新 game.js 和 style.css 和index.html，優化遊戲效果)
            this.slicedPieces = this.slicedPieces.filter(piece => {
                piece.x += piece.vx;
                piece.y += piece.vy;
                piece.vy += this.gravity;
                piece.rotation += piece.rotationSpeed;
<<<<<<< HEAD
                piece.alpha -= 0.02;
                return piece.alpha > 0;
            });
            return this.slicedPieces.length > 0;
=======
                piece.alpha -= 0.01; // 降低透明度衰減速度
                return piece.alpha > 0;
            });

            // 更新噴汁粒子
            this.juiceParticles = this.juiceParticles.filter(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += particle.gravity;
                particle.alpha -= 0.02;
                return particle.alpha > 0;
            });

            return this.slicedPieces.length > 0 || this.juiceParticles.length > 0;
>>>>>>> 201d4ac (更新 game.js 和 style.css 和index.html，優化遊戲效果)
        }

        this.velocityY += this.gravity;
        this.y += this.velocityY;
        this.x += this.velocityX;
        this.rotation += this.rotationSpeed;
        return this.y < canvas.height;
    }

    draw() {
        if (this.sliced) {
<<<<<<< HEAD
=======
            // 繪製切片
>>>>>>> 201d4ac (更新 game.js 和 style.css 和index.html，優化遊戲效果)
            this.slicedPieces.forEach(piece => {
                ctx.save();
                ctx.translate(piece.x, piece.y);
                ctx.rotate(piece.rotation);
                ctx.globalAlpha = piece.alpha;
                ctx.font = `${this.size}px Arial`;  // 初始大小                                 
                ctx.textAlign = 'center';       
                ctx.textBaseline = 'middle';    // 初始大小                                 
                ctx.fillText(piece.type, 0, 0);
                ctx.restore();
            });
<<<<<<< HEAD
=======

            // 繪製噴汁粒子
            ctx.save();
            this.juiceParticles.forEach(particle => {
                ctx.beginPath();
                ctx.globalAlpha = particle.alpha;
                ctx.fillStyle = this.juiceColor;
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();
>>>>>>> 201d4ac (更新 game.js 和 style.css 和index.html，優化遊戲效果)
        } else {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.font = `${this.size}px Arial`;      // 初始大小                                 
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';    // 初始大小                                   
            ctx.fillText(this.type, 0, 0);
            ctx.restore();
        }
    }

    slice() {
        if (!this.sliced) {
            this.sliced = true;
<<<<<<< HEAD
            const piece1 = {
                x: this.x,
                y: this.y,
                vx: this.velocityX - 2,
                vy: this.velocityY - 2,
                rotation: this.rotation,
                rotationSpeed: this.rotationSpeed - 0.1,
                type: this.type,
                alpha: 1, // 初始透明度
=======
            // 創建切片效果
            const angle = Math.random() * Math.PI / 4 - Math.PI / 8; // 隨機切割角度
            const piece1 = {
                x: this.x,
                y: this.y,
                vx: this.velocityX - Math.cos(angle) * 3,
                vy: this.velocityY - Math.sin(angle) * 3,
                rotation: this.rotation,
                rotationSpeed: this.rotationSpeed - 0.1,
                type: this.type,
                alpha: 1
>>>>>>> 201d4ac (更新 game.js 和 style.css 和index.html，優化遊戲效果)
            };
            const piece2 = {
                x: this.x,
                y: this.y,
<<<<<<< HEAD
                vx: this.velocityX + 2,
                vy: this.velocityY - 2,
                rotation: this.rotation,
                rotationSpeed: this.rotationSpeed + 0.1,
                type: this.type,
                alpha: 1, // 初始透明度
            };
            this.slicedPieces = [piece1, piece2];
=======
                vx: this.velocityX + Math.cos(angle) * 3,
                vy: this.velocityY + Math.sin(angle) * 3,
                rotation: this.rotation,
                rotationSpeed: this.rotationSpeed + 0.1,
                type: this.type,
                alpha: 1
            };
            this.slicedPieces = [piece1, piece2];
            
            // 創建噴汁效果
            this.createJuiceParticles();
>>>>>>> 201d4ac (更新 game.js 和 style.css 和index.html，優化遊戲效果)
        }
    }

    checkSlice(x1, y1, x2, y2) {
        if (this.sliced) return false;
        const distance = Math.sqrt(
            Math.pow(this.x - x1, 2) + Math.pow(this.y - y1, 2)
        );
        return distance < this.size / 2;
    }
}

class Slice {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.alpha = 1;
    }

    update() {
        this.alpha -= 0.05;
        return this.alpha > 0;
    }

    draw() {
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(lastMouseX, lastMouseY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
    }
}

function spawnFruit() {
    if (Math.random() < 0.02) { 
        const x = Math.random() * canvas.width;
        const type = Math.random() < 0.15 ? '💣' : fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
        const gameObject = new GameObject(x, canvas.height, type);
        if (type === '💣') {
            bombs.push(gameObject);
        } else {
            fruits.push(gameObject);
        }
    }
}

function updateGame(currentTime) {
    if (!gameRunning) return;

    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    spawnFruit();

    fruits = fruits.filter(fruit => fruit.update());
    fruits.forEach(fruit => fruit.draw());

    bombs = bombs.filter(bomb => bomb.update());
    bombs.forEach(bomb => bomb.draw());

    slices = slices.filter(slice => slice.update());
    slices.forEach(slice => slice.draw());

    fruits = fruits.filter(fruit => {
        if (fruit.y > canvas.height) {
            lives--;
            document.getElementById('livesValue').textContent = lives;
            if (lives <= 0) {
                gameOver();
            }
            return false;
        }
        return true;
    });

    requestAnimationFrame(updateGame);
}

function checkCollisions(x1, y1, x2, y2) {
    fruits = fruits.filter(fruit => {
        if (fruit.checkSlice(x1, y1, x2, y2)) {
            fruit.slice(); 
            score += 10;
            document.getElementById('scoreValue').textContent = score;
            return true; 
        }
        return true;
    });

    bombs = bombs.filter(bomb => {
        if (bomb.checkSlice(x1, y1, x2, y2)) {
            gameOver();
            return false;
        }
        return true;
    });
}

function gameOver() {
    gameRunning = false;
    document.getElementById('gameOver').classList.remove('hidden');
    document.getElementById('finalScore').textContent = score;
}

function restartGame() {
    score = 0;
    lives = 3;
    gameRunning = true;
    fruits = [];
    bombs = [];
    slices = [];
    document.getElementById('scoreValue').textContent = score;
    document.getElementById('livesValue').textContent = lives;
    document.getElementById('gameOver').classList.add('hidden');
    requestAnimationFrame(updateGame);
}

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    if (gameRunning) {
        slices.push(new Slice(mouseX, mouseY));
        checkCollisions(lastMouseX, lastMouseY, mouseX, mouseY);
    }

    lastMouseX = mouseX;
    lastMouseY = mouseY;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouseX = touch.clientX - rect.left;
    mouseY = touch.clientY - rect.top;

    if (gameRunning) {
        slices.push(new Slice(mouseX, mouseY));
        checkCollisions(lastMouseX, lastMouseY, mouseX, mouseY);
    }

    lastMouseX = mouseX;
    lastMouseY = mouseY;
});

requestAnimationFrame(updateGame);
