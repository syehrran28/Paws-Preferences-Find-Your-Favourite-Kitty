// ===========================================
// Intro & Audio Logic
// ===========================================
const cardContainer = document.getElementById('card-container');
const TOTAL_CATS = 12;
let catImages = [];
let currentIndex = 0;
let likedCats = [];
let historyStack = [];

const intro = document.getElementById('intro-overlay');
const app = document.querySelector('.app');
const buttons = document.querySelectorAll('.buttons button');

// Tooltip logic (hide on any interaction)
buttons.forEach(btn => btn.classList.add('show-tooltip'));
function hideTooltips() {
  buttons.forEach(b => b.classList.remove('show-tooltip'));
}
buttons.forEach(btn => btn.addEventListener('click', hideTooltips));

// Dismiss intro on first click
function dismissIntro() {
  const sound = document.getElementById('intro-sound');
  if (sound) sound.play();
  intro.style.opacity = '0';
  setTimeout(() => {
    intro.style.display = 'none';
    app.style.display = 'block';
  }, 400);
  loadCatImages();
  document.removeEventListener('click', dismissIntro);
}
document.addEventListener('click', dismissIntro);

// ===========================================
// Load & Render Cat Images
// ===========================================
function loadCatImages() {
  const texts = ['Hi', 'Meow', 'Purr', 'Meowwwww', 'Sup?'];
  const uniqueSet = new Set();
  catImages = [];

  let attempts = 0;
  while (catImages.length < TOTAL_CATS && attempts < 50) {
    const randomText = texts[Math.floor(Math.random() * texts.length)];
    const id = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const url = `https://cataas.com/cat/says/${encodeURIComponent(randomText)}?fontColor=white&fontSize=40&unique=${id}`;

    if (!uniqueSet.has(url)) {
      uniqueSet.add(url);
      catImages.push(url);
    }
    attempts++;
  }

  renderCards();
}

// ===========================================
// Card Stack Rendering
// ===========================================
function renderCards() {
  cardContainer.innerHTML = '';
  catImages.slice(currentIndex).forEach((url, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.zIndex = TOTAL_CATS - index;

    const cardInner = document.createElement('div');
    cardInner.className = 'card-inner';
    cardInner.style.backgroundImage = `url(${url})`;

    if (index > 0) {
      card.style.opacity = '0.4';
      const angle = index % 2 === 0 ? 5 : -5;
      card.style.transform = `rotate(${angle}deg)`;
    }

    card.appendChild(cardInner);
    if (index === 0) addSwipeEvents(card);
    cardContainer.appendChild(card);
  });
}

// ===========================================
// Swipe + Mouse Drag Events
// ===========================================
function addSwipeEvents(card) {
  let startX = 0;
  let moveX = 0;
  let isDragging = false;

  card.addEventListener('touchstart', (e) => startX = e.touches[0].clientX);
  card.addEventListener('touchmove', (e) => {
    moveX = e.touches[0].clientX - startX;
    card.style.transform = `translateX(${moveX}px) rotate(${moveX / 10}deg)`;
  });
  card.addEventListener('touchend', () => {
    if (moveX > 100) handleSwipe('right', card);
    else if (moveX < -100) handleSwipe('left', card);
    else card.style.transform = '';
  });

  card.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
  });
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    moveX = e.clientX - startX;
    card.style.transform = `translateX(${moveX}px) rotate(${moveX / 10}deg)`;
  });
  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    if (moveX > 100) handleSwipe('right', card);
    else if (moveX < -100) handleSwipe('left', card);
    else card.style.transform = '';
  });
}

// ===========================================
// Like/Dislike & Undo Logic
// ===========================================
function handleSwipe(direction, card = null) {
  hideTooltips();

  const url = catImages[currentIndex];
  if (direction === 'right' && !likedCats.includes(url)) {
    likedCats.push(url);
  }
  historyStack.push({ direction, url });

  if (!card) card = cardContainer.querySelector('.card');
  card.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
  card.style.opacity = '0';
  card.style.transform = `translateX(${direction === 'right' ? '1000px' : '-1000px'}) rotate(${direction === 'right' ? 45 : -45}deg)`;

  setTimeout(() => {
    currentIndex++;
    if (currentIndex >= catImages.length) showSummary();
    else renderCards();
  }, 300);
}

function undoSwipe() {
  if (historyStack.length === 0 || currentIndex === 0) return;
  currentIndex--;
  const last = historyStack.pop();
  if (last.direction === 'right') likedCats.pop();
  renderCards();
}

// ===========================================
// Summary Screen & Restart
// ===========================================
function showSummary() {
  document.querySelector('.buttons').style.display = 'none';

  cardContainer.innerHTML = `
    <div class="summary">
      <h2>You liked ${likedCats.length} cat${likedCats.length !== 1 ? 's' : ''}! 😺</h2>
      <div class="summary-content-wrapper">
        <div class="liked-grid">
          ${likedCats.map(url => `
            <div class="liked-thumb" data-url="${url}" style="background-image: url('${url}');"></div>
          `).join('')}
        </div>
        <button class="restart-button" onclick="location.reload()">
          <img src="icon_restart.png" />
        </button>
      </div>
    </div>
  `;

  document.querySelectorAll('.liked-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const url = thumb.getAttribute('data-url');
      openModal(url);
    });
  });
}

// ===========================================
// Modal Viewer
// ===========================================
function openModal(url) {
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-img');
  modalImg.src = url;
  modal.style.display = 'flex';
}

function closeModal() {
  document.getElementById('image-modal').style.display = 'none';
}

// ===========================================
// Keyboard Shortcuts
// ===========================================
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') {
    hideTooltips();
    handleSwipe('right');
  } else if (e.key === 'ArrowLeft') {
    hideTooltips();
    handleSwipe('left');
  } else if (e.key === 'Escape') {
    closeModal();
  }
});
