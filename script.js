const HEART_EMOJIS = ['❤️', '💖', '💕', '💗', '💘', '💞'];

const yesBtn = document.getElementById('yes');
const noBtn = document.getElementById('no');
const subtitle = document.getElementById('subtitle');
const question = document.getElementById('question');
const celebration = document.getElementById('celebration');
const heartsContainer = document.querySelector('.hearts');

const noMessages = [
    'Tu es sûre ? 🥺',
    'Vraiment sûre ? 😢',
    'Réfléchis encore… 💭',
    'Mon cœur va se briser 💔',
    'Allez, dis oui ! 🙏',
    'Le bouton Oui t\'attend 😏',
    'Tu ne peux pas m\'échapper 😜'
];

let noAttempts = 0;

const random = (min, max) => Math.random() * (max - min) + min;
const pick = (list) => list[Math.floor(Math.random() * list.length)];

function createFloatingHearts() {
    const count = window.innerWidth < 600 ? 14 : 24;
    for (let i = 0; i < count; i++) {
        const heart = document.createElement('span');
        heart.className = 'heart';
        heart.textContent = pick(HEART_EMOJIS);
        heart.style.left = `${random(0, 100)}%`;
        heart.style.fontSize = `${random(14, 32)}px`;
        heart.style.animationDuration = `${random(6, 12)}s`;
        heart.style.animationDelay = `${random(0, 10)}s`;
        heartsContainer.appendChild(heart);
    }
}

const yesScaleFor = (attempts) => Math.min(1 + attempts * 0.12, 1.8);

function placeNoButton(nextYesScale) {
    const margin = 12;
    const rect = noBtn.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - margin;
    const maxY = window.innerHeight - rect.height - margin;

    const yesRect = yesBtn.getBoundingClientRect();
    const growth = nextYesScale / yesScaleFor(noAttempts);
    const centerX = yesRect.left + yesRect.width / 2;
    const centerY = yesRect.top + yesRect.height / 2;
    const halfW = (yesRect.width * Math.max(growth, 1)) / 2 + 16;
    const halfH = (yesRect.height * Math.max(growth, 1)) / 2 + 16;
    const overlapsYes = (x, y) =>
        x < centerX + halfW && x + rect.width > centerX - halfW &&
        y < centerY + halfH && y + rect.height > centerY - halfH;

    let x;
    let y;
    let tries = 0;
    do {
        x = random(margin, Math.max(margin, maxX));
        y = random(margin, Math.max(margin, maxY));
        tries++;
    } while ((overlapsYes(x, y) || Math.hypot(x - rect.left, y - rect.top) < 120) && tries < 50);

    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;
}

let lastMoveTime = 0;

function moveNoButton() {
    const now = performance.now();
    if (now - lastMoveTime < 250) return;
    lastMoveTime = now;

    if (!noBtn.classList.contains('fleeing')) {
        const rect = noBtn.getBoundingClientRect();
        noBtn.style.left = `${rect.left}px`;
        noBtn.style.top = `${rect.top}px`;
        const hadFocus = document.activeElement === noBtn;
        noBtn.classList.add('fleeing');
        document.body.appendChild(noBtn);
        if (hadFocus) noBtn.focus({ preventScroll: true });
    }

    const nextYesScale = yesScaleFor(noAttempts + 1);
    placeNoButton(nextYesScale);

    subtitle.textContent = noMessages[noAttempts % noMessages.length];
    noAttempts++;
    yesBtn.style.setProperty('--yes-scale', nextYesScale);
}

function burstHearts(originX, originY) {
    const count = 40;
    for (let i = 0; i < count; i++) {
        const heart = document.createElement('span');
        heart.className = 'burst';
        heart.textContent = pick(HEART_EMOJIS);
        heart.style.left = `${originX}px`;
        heart.style.top = `${originY}px`;
        heart.style.fontSize = `${random(16, 34)}px`;
        const angle = random(0, Math.PI * 2);
        const distance = random(120, Math.max(window.innerWidth, window.innerHeight) * 0.6);
        heart.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
        heart.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
        heart.style.setProperty('--rot', `${random(-90, 90)}deg`);
        document.body.appendChild(heart);
        heart.addEventListener('animationend', () => heart.remove());
    }
}

function sayYes() {
    const rect = yesBtn.getBoundingClientRect();
    burstHearts(rect.left + rect.width / 2, rect.top + rect.height / 2);
    noBtn.remove();
    question.hidden = true;
    celebration.hidden = false;
    celebration.focus();
    document.title = 'Elle a dit oui ! 💖';
}

noBtn.addEventListener('mouseenter', moveNoButton);
noBtn.addEventListener('touchstart', (event) => {
    event.preventDefault();
    moveNoButton();
}, { passive: false });
noBtn.addEventListener('click', (event) => {
    event.preventDefault();
    moveNoButton();
});
yesBtn.addEventListener('click', sayYes);

window.addEventListener('resize', () => {
    if (noBtn.classList.contains('fleeing')) {
        placeNoButton(yesScaleFor(noAttempts));
    }
});

createFloatingHearts();
