const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 設置 canvas 大小為視窗大小
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// 初始化和監聽視窗大小變化
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game state
let score = 0;
let lives = 3;
let gameRunning = true;
let fruits = [];
let bombs = [];
let slices = [];
let lastTime = 0;
const fruitTypes = ['🍎', '🍊', '🍉', '🍇', '🍓', '🍐', '🍌'];

// 添加果汁顏色映射
const fruitColors = {
    '🍎': '#ff0000',
    '🍊': '#ffa500',
    '🍉': '#ff6b6b',
    '🍇': '#9b59b6',
    '🍓': '#e74c3c',
    '🍐': '#2ecc71',
    '🍌': '#f1c40f'
};

class JuiceParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 3 + 2;
        this.speedX = (Math.random() - 0.5) * 8;
        this.speedY = (Math.random() - 0.5) * 8 - 2;
        this.gravity = 0.3;
        this.alpha = 1;
        this.decay = 0.02 + Math.random() * 0.02;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.gravity;
        this.alpha -= this.decay;
        return this.alpha > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

let particles = [];

// Mouse tracking
let mouseX = 0;
let mouseY = 0;
let lastMouseX = 0;
let lastMouseY = 0;

// 添加滑鼠按下狀態追蹤
let isMouseDown = false;

class GameObject {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.velocityY = -12; // 增加初始向上速度
        this.velocityX = (Math.random() - 0.5) * 3; // 稍微增加水平速度範圍
        this.gravity = 0.15; // 減小重力，讓水果在空中停留更久
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.size = 60;
        this.sliced = false;
        this.slicedPieces = [];
    }

    slice() {
        if (!this.sliced) {
            this.sliced = true;
            
            // 使用當前速度作為基礎
            const baseSpeed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
            const splitSpeed = Math.max(8, baseSpeed);
            const upwardForce = Math.min(-8, this.velocityY); // 增加切片後的向上力
            
            // 創建爆汁效果
            const color = fruitColors[this.type] || '#fff';
            for (let i = 0; i < 15; i++) {
                particles.push(new JuiceParticle(this.x, this.y, color));
            }
            
            // 計算切割方向
            const sliceAngle = Math.atan2(mouseY - lastMouseY, mouseX - lastMouseX);
            const sliceForce = 3; // 增加切割力度
            
            // 左半部分
            const piece1 = {
                x: this.x,
                y: this.y,
                vx: -splitSpeed + this.velocityX * 0.5 - Math.cos(sliceAngle) * sliceForce,
                vy: upwardForce + Math.sin(sliceAngle) * sliceForce,
                rotation: this.rotation,
                rotationSpeed: -0.15,
                type: this.type,
                alpha: 1,
                scale: 1,
                side: 'left'
            };
            
            // 右半部分
            const piece2 = {
                x: this.x,
                y: this.y,
                vx: splitSpeed + this.velocityX * 0.5 + Math.cos(sliceAngle) * sliceForce,
                vy: upwardForce - Math.sin(sliceAngle) * sliceForce,
                rotation: this.rotation,
                rotationSpeed: 0.15,
                type: this.type,
                alpha: 1,
                scale: 1,
                side: 'right'
            };
            
            this.slicedPieces = [piece1, piece2];
            
            // 立即應用一次物理更新
            this.slicedPieces.forEach(piece => {
                piece.x += piece.vx * 0.5;
                piece.y += piece.vy * 0.5;
            });
        }
    }

    draw() {
        if (this.sliced) {
            this.slicedPieces.forEach(piece => {
                ctx.save();
                ctx.translate(piece.x, piece.y);
                ctx.rotate(piece.rotation);
                ctx.scale(piece.scale, piece.scale); 
                ctx.globalAlpha = piece.alpha;
                
                ctx.beginPath();
                if (piece.side === 'left') {
                    ctx.rect(-this.size/2, -this.size/2, this.size/2, this.size);
                } else {
                    ctx.rect(0, -this.size/2, this.size/2, this.size);
                }
                ctx.clip();
                
                ctx.font = `${this.size}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(this.type, 0, 0);
                
                ctx.restore();
            });
        } else {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.font = `${this.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.type, 0, 0);
            ctx.restore();
        }
    }

    update() {
        if (this.sliced) {
            // 統一的物理參數
            const airResistance = 0.99;
            const groundSlowdown = 0.9;
            const fadeRate = 0.97;
            const scaleRate = 0.98;
            const gravity = this.gravity * 1.5;
            
            return this.slicedPieces.every(piece => {
                // 更新位置
                piece.x += piece.vx;
                piece.y += piece.vy;
                piece.vy += gravity;
                piece.rotation += piece.rotationSpeed;
                
                // 空氣阻力
                piece.vx *= airResistance;
                
                // 當切片接近地面時
                if (piece.y > canvas.height - 50) {
                    piece.scale *= scaleRate;
                    piece.alpha *= fadeRate;
                    piece.rotationSpeed *= fadeRate;
                    piece.vy *= groundSlowdown;
                }
                
                // 當切片離開屏幕邊緣時
                if (piece.x < -this.size || piece.x > canvas.width + this.size) {
                    piece.alpha *= fadeRate;
                    piece.scale *= scaleRate;
                }
                
                return piece.alpha > 0.01 && piece.scale > 0.01;
            });
        }

        this.velocityY += this.gravity;
        this.y += this.velocityY;
        this.x += this.velocityX;
        this.rotation += this.rotationSpeed;
        return this.y < canvas.height;
    }

    checkSlice(x1, y1, x2, y2) {
        if (this.sliced) return false;
        const distance = Math.sqrt(
            Math.pow(this.x - x1, 2) + Math.pow(this.y - y1, 2)
        );
        return distance < this.size / 2;
    }
}

class SliceTrail {
    constructor(x, y) {
        this.points = [{x, y}];
        this.alpha = 1;
        this.width = 15;
        this.color = '#fff';
        this.glow = 30;
        this.active = true;
        this.fadeSpeed = 0.02;
    }

    update() {
        this.alpha -= this.fadeSpeed;
        if (this.alpha <= 0) {
            this.active = false;
        }
        return this.alpha > 0;
    }

    addPoint(x, y) {
        this.points.push({x, y});
        if (this.points.length > 25) {
            this.points.shift();
        }
    }

    // 檢查是否與圓形碰撞
    checkCollision(x, y, radius) {
        if (!this.active || this.points.length < 2) return false;
        
        // 檢查每一段刀光
        for (let i = 1; i < this.points.length; i++) {
            const p1 = this.points[i - 1];
            const p2 = this.points[i];
            
            // 計算點到線段的最短距離
            const distance = this.pointToLineDistance(x, y, p1.x, p1.y, p2.x, p2.y);
            if (distance < radius + this.width/2) {
                return true;
            }
        }
        return false;
    }

    // 計算點到線段的最短距離
    pointToLineDistance(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;

        if (len_sq != 0) {
            param = dot / len_sq;
        }

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    draw(ctx) {
        if (this.points.length < 2) return;
        
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = this.alpha;
        
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = this.glow;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.stroke();
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = this.width * 0.5;
        ctx.globalAlpha = this.alpha * 1.5;
        ctx.stroke();
        
        ctx.restore();
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

    particles = particles.filter(particle => particle.update());
    particles.forEach(particle => particle.draw(ctx));
    
    slices = slices.filter(slice => slice.update());
    
    fruits.forEach(fruit => {
        if (!fruit.sliced) {
            slices.forEach(slice => {
                if (slice.active && slice.checkCollision(fruit.x, fruit.y, fruit.size/2)) {
                    fruit.slice();
                    score++;
                    document.getElementById('scoreValue').textContent = score;
                }
            });
        }
    });
    
    slices.forEach(slice => slice.draw(ctx));
    
    spawnFruit();
    fruits = fruits.filter(fruit => fruit.update());
    fruits.forEach(fruit => fruit.draw());
    bombs = bombs.filter(bomb => bomb.update());
    bombs.forEach(bomb => bomb.draw());

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
    particles = [];
    document.getElementById('scoreValue').textContent = score;
    document.getElementById('livesValue').textContent = lives;
    document.getElementById('gameOver').classList.add('hidden');
    requestAnimationFrame(updateGame);
}

canvas.addEventListener('mousedown', (e) => {
    if (!gameRunning) return;
    isMouseDown = true;
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
    const slice = new SliceTrail(mouseX, mouseY);
    slices.push(slice);
});

canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
});

canvas.addEventListener('mouseleave', () => {
    isMouseDown = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    if (gameRunning && isMouseDown) {
        // 檢查是否需要創建新的刀光
        const lastSlice = slices[slices.length - 1];
        if (!lastSlice || !lastSlice.active) {
            const slice = new SliceTrail(mouseX, mouseY);
            slices.push(slice);
        }
        
        // 更新當前刀光
        const currentSlice = slices[slices.length - 1];
        if (currentSlice && currentSlice.active) {
            currentSlice.addPoint(mouseX, mouseY);
            checkCollisions(lastMouseX, lastMouseY, mouseX, mouseY);
        }
    }

    lastMouseX = mouseX;
    lastMouseY = mouseY;
});

// 同樣更新觸摸事件
let isTouching = false;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!gameRunning) return;
    isTouching = true;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouseX = touch.clientX - rect.left;
    mouseY = touch.clientY - rect.top;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
    const slice = new SliceTrail(mouseX, mouseY);
    slices.push(slice);
});

canvas.addEventListener('touchend', () => {
    isTouching = false;
});

canvas.addEventListener('touchcancel', () => {
    isTouching = false;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    mouseX = touch.clientX - rect.left;
    mouseY = touch.clientY - rect.top;

    if (gameRunning && isTouching) {
        // 檢查是否需要創建新的刀光
        const lastSlice = slices[slices.length - 1];
        if (!lastSlice || !lastSlice.active) {
            const slice = new SliceTrail(mouseX, mouseY);
            slices.push(slice);
        }
        
        // 更新當前刀光
        const currentSlice = slices[slices.length - 1];
        if (currentSlice && currentSlice.active) {
            currentSlice.addPoint(mouseX, mouseY);
            checkCollisions(lastMouseX, lastMouseY, mouseX, mouseY);
        }
    }

    lastMouseX = mouseX;
    lastMouseY = mouseY;
});

requestAnimationFrame(updateGame);
