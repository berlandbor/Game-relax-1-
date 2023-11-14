// Получение ссылки на элемент canvas и его 2D-контекст
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// Константа для удвоенного значения PI
const PI2 = Math.PI * 2;

// Объект для отслеживания положения мыши
const mouse = { x: 0, y: 0, angle: 0 };

// Гравитация и коэффициент трения
const gravity = 0.1;
const friction = 0.95;

// Переменные для размеров окна и тела осьминога
let w;
let wH;
let h;
let hH;

// Параметры осьминога
const radius = 30;
let squid;
const tentacleWidth = 8;
const numTentacles = 6;
const numPoints = 10;
let particles = [];

// Массив для хранения щупалец
let tentacles;

// Функции для вычислений
const distanceBetween = (p1, p2) => Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
const angleBetween = (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1);
const randomBetween = (min, max) => ~~((Math.random() * (max - min + 1)) + min);

// Функция вызывается при изменении размеров окна
const onResize = () => {
    w = window.innerWidth;
    h = window.innerHeight;

    wH = w >> 1; // Половина ширины окна
    hH = h >> 1; // Половина высоты окна

    // Установка размеров canvas в соответствии с окном
    canvas.width = w;
    canvas.height = h;
};

// Функция для инициализации параметров сцены
const updateStage = () => {
    onResize(); // Обновление размеров при изменении окна

    mouse.x = wH; // Установка начальных координат мыши
    mouse.y = hH;

    // Инициализация параметров осьминога
    squid = { x: mouse.x, y: mouse.y, radius, bodyWidth: radius * 2, bodyHeight: 30, angle: 0, velocity: 0 };
    tentacles = [];

    let connectionX = squid.x - squid.radius - tentacleWidth;
    const incX = squid.bodyWidth / (numTentacles - 1);

    // Создание массива щупалец
    for (let i = 0; i < numTentacles; i++) {
        const length = randomBetween(5, 20);

        const tentacle = {
            length,
            connections: [],
        };

        let connectionY = squid.y + squid.bodyHeight;

        // Создание массива точек для каждого щупальца
        for (let q = 0; q < numPoints; q++) {
            tentacle.connections.push({
                x: connectionX,
                y: connectionY,
                oldX: connectionX,
                oldY: connectionY,
            });

            connectionY += length;
        }

        connectionX += incX;

        tentacles.push(tentacle);
    }
};

// Функция для обновления положения точек щупалец
const updatePoints = () => {
    tentacles.forEach((tentacle) => {
        const { connections } = tentacle;

        // Обновление скорости и положения каждой точки
        connections.forEach((point) => {
            const velX = point.x - point.oldX;
            const velY = point.y - point.oldY;

            point.oldX = point.x;
            point.oldY = point.y;

            point.x += velX * friction;
            point.y += velY * friction;

            point.y += gravity;
        });
    });
};

// Функция для обновления стержней между точками щупалец
const updateSticks = () => {
    tentacles.forEach((tentacle) => {
        const { length, connections } = tentacle;

        // Обновление стержней между двумя точками
        for (let i = 0; i < connections.length - 1; i++) {
            const from = connections[i];
            const to = connections[i + 1];

            const dx = to.x - from.x;
            const dy = to.y - from.y;

            const distance = distanceBetween(from, to);
            const difference = length - distance;
            const percent = difference / distance / 2;
            const offsetX = dx * percent;
            const offsetY = dy * percent;

            from.x -= offsetX;
            from.y -= offsetY;

            to.x += offsetX;
            to.y += offsetY;
        }
    });
};

// Функция для соединения щупалец с телом осьминога
const connectTentacles = () => {
    let x = squid.x - squid.radius + (tentacleWidth / 2);
    let y = squid.y + squid.bodyHeight;
    const posInc = (squid.bodyWidth - tentacleWidth) / (tentacles.length - 1);

    tentacles.forEach((tentacle) => {
        const connector = tentacle.connections[0];

        const angleDiff = angleBetween(squid.x, squid.y, x, y);
        const dx = squid.x - x;
        const dy = squid.y - y;
        const h = Math.sqrt((dx * dx) + (dy * dy));

        connector.x = squid.x + (Math.cos(angleDiff + squid.angle) * h);
        connector.y = squid.y + (Math.sin(angleDiff + squid.angle) * h);

        x += posInc;
    });
};
// Функция для отрисовки щупалец
const drawTentacles = () => {
    tentacles.forEach((tentacle) => {
        const { connections } = tentacle;

        ctx.beginPath();

        // Задайте новый цвет для щупалец
        ctx.strokeStyle = '#563c13'; // Новый цвет (синий в этом случае)

        ctx.lineWidth = tentacleWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(connections[0].x, connections[0].y);

        connections.slice(1).forEach((connector) => {
            ctx.lineTo(connector.x, connector.y);
        });

        ctx.stroke();
        ctx.closePath();
    });
};

// Функция для обновления параметров осьминога
const updateSquid = () => {
    const newX = squid.x + (mouse.x - squid.x) / 50;
    const newY = squid.y + (mouse.y - squid.y) / 50;
    const velocity = squid.x - newX;

    squid.angle = -velocity * 0.1;
    squid.velocity = velocity;
    squid.x = newX;
    squid.y = newY;
};

// Функция для отрисовки осьминога
const drawSquid = () => {
    // Переменные для положения глаз
    const eyeXInc = Math.cos(mouse.angle) * 5;
    const eyeYInc = Math.sin(mouse.angle) * 5;

    const eyeXInc2 = Math.cos(mouse.angle) * 10;
    const eyeYInc2 = Math.sin(mouse.angle) * 10;

    ctx.save();
    ctx.translate(squid.x, squid.y);
    ctx.rotate(squid.angle);

    // Тело
    ctx.beginPath();
    ctx.fillStyle = '#4b3306';
    ctx.lineWidth = 1;
    ctx.rect(-squid.radius, 0, squid.bodyWidth, squid.bodyHeight);
    ctx.fill();
    ctx.closePath();

    // Голова
    ctx.beginPath();
    ctx.fillStyle = '#4b3306';
    ctx.lineWidth = 1;
    ctx.arc(0, 0, squid.radius, 0, PI2, false);
    ctx.fill();
    ctx.closePath();

    // Глаза
    ctx.beginPath();
    ctx.fillStyle = '#f6f9ca';
    ctx.arc(-15 + eyeXInc, eyeYInc, 4, 0, PI2, false);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = '#f6f9ca';
    ctx.arc(18 + eyeXInc2, eyeYInc2, 6, 0, PI2, false);
    ctx.fill();
    ctx.closePath();

    ctx.restore();
};

// Функция для отрисовки частиц
const drawParticles = () => {
    particles.forEach((p) => {
        p.radius *= 1.025;
        p.life *= 0.97;
        p.isDead = p.life <= 0.1;

        p.x += Math.cos(p.angle) * p.velocity;
        p.t += Math.sin(p.angle) * p.velocity;

        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${p.life})`;
        ctx.arc(p.x, p.y, p.radius, 0, PI2, false);
        ctx.fill();
        ctx.closePath();
    });
    particles = particles.filter(p => !p.isDead);
};

// Функция для очистки canvas
const clear = () => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

// Главный цикл анимации
const loop = () => {
    clear();

    drawParticles();

    updateSquid();

    updatePoints();
    updateSticks();

    connectTentacles();

    drawTentacles();
    drawSquid();

    // Создание частиц при движении осьминога
    if (Math.abs(squid.velocity) > 2 && particles.length < 200) {
        tentacles.forEach((tentacle) => {
            const pos = tentacle.connections[tentacle.connections.length - 1];
            const angle = angleBetween(pos.x, pos.y, mouse.x, mouse.y);

            particles.push({
                x: pos.x,
                y: pos.y,
                life: 1,
                radius: 1,
                isDead: false,
                velocity: randomBetween(1, 3) * 0.5,
                angle: angle,
            });
        });
    }

    requestAnimationFrame(loop);
};

// Обработчик изменения размеров окна
window.addEventListener('resize', onResize);
// Инициализация сцены и запуск анимации
updateStage();
loop();

// Обработчик движения мыши или касания экрана
const onPointerMove = (e) => {
    const target = (e.touches && e.touches.length) ? e.touches[0] : e;
    const { clientX: x, clientY: y } = target;

    mouse.x = x;
    mouse.y = y;
    mouse.angle = angleBetween(squid.x, squid.y, mouse.x, mouse.y);
};

// Подключение обработчиков движения мыши или касания
canvas.addEventListener('mousemove', onPointerMove);
canvas.addEventListener('touchmove', onPointerMove);