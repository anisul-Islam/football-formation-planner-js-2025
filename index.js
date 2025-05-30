// @ts-nocheck
const field = document.getElementById('field');
const playerFormElement = document.getElementById('playerForm');
const exportBtn = document.getElementById('exportBtn');
const bench = document.getElementById('bench');
const formationContainer = document.getElementById('formationContainer');

let isDragging = false;
let offsetX = 0,
  offsetY = 0;

let playersData = JSON.parse(localStorage.getItem('players')) || [];

// Load saved players on page load
window.addEventListener('DOMContentLoaded', function () {
  playersData.forEach(createPlayerElement);
});

// Export as image
exportBtn.addEventListener('click', function () {
  html2canvas(formationContainer).then((canvas) => {
    const link = document.createElement('a');
    link.download = 'formation.png';
    link.href = canvas.toDataURL();
    link.click();
  });
});

// Add new player
playerFormElement.addEventListener('submit', function (event) {
  event.preventDefault();
  const name = document.getElementById('playerName').value.trim();
  const position = document.getElementById('playerPosition').value;
  const country = document.getElementById('playerCountry').value;
  if (!name || !position || !country) return alert('All fields required');

  const newPlayer = {
    id: Date.now(),
    name,
    position,
    country,
    xPercent: 0,
    yPercent: 0,
    location: 'bench',
  };
  playersData.push(newPlayer);
  saveToStorage();
  createPlayerElement(newPlayer);
  playerFormElement.reset();
});

// Create player element
function createPlayerElement(player) {
  const playerEl = document.createElement('div');
  playerEl.className = `player ${player.position.toLowerCase()}`;
  playerEl.setAttribute('data-id', player.id);

  if (player.location === 'field') {
    playerEl.style.position = 'absolute';
    playerEl.style.left = `${player.xPercent}%`;
    playerEl.style.top = `${player.yPercent}%`;
  }

  playerEl.innerHTML = `
    <p><strong>${player.name}</strong></p>
    <p>(${player.position})</p>
    <p class="country">${player.country}</p>
    <button class="delete-btn">❌</button>
  `;

  makeDraggable(playerEl);
  addDeleteButton(playerEl);

  if (player.location === 'field') {
    field.appendChild(playerEl);
  } else {
    bench.appendChild(playerEl);
  }

  return playerEl;
}

// Make player draggable (mouse + touch)
function makeDraggable(playerEl) {
  function startDrag(event, isTouch = false) {
    if (event.target.classList.contains('delete-btn')) return;
    isDragging = true;

    const point = isTouch ? event.touches[0] : event;
    const rect = playerEl.getBoundingClientRect();
    offsetX = point.clientX - rect.left;
    offsetY = point.clientY - rect.top;
    playerEl.style.zIndex = 1000;

    function move(event) {
      const point = isTouch ? event.touches[0] : event;
      const containerRect = field.getBoundingClientRect();

      let x = point.clientX - containerRect.left - offsetX;
      let y = point.clientY - containerRect.top - offsetY;

      x = Math.max(0, Math.min(x, field.clientWidth - playerEl.offsetWidth));
      y = Math.max(0, Math.min(y, field.clientHeight - playerEl.offsetHeight));

      const xPercent = (x / field.clientWidth) * 100;
      const yPercent = (y / field.clientHeight) * 100;

      playerEl.style.left = `${xPercent}%`;
      playerEl.style.top = `${yPercent}%`;

      const benchRect = bench.getBoundingClientRect();
      if (point.clientY >= benchRect.top && point.clientY <= benchRect.bottom) {
        bench.classList.add('hovered');
      } else {
        bench.classList.remove('hovered');
      }
    }

    function end(event) {
      bench.classList.remove('hovered');
      isDragging = false;
      playerEl.style.zIndex = 1;
      const point = isTouch
        ? event.changedTouches
          ? event.changedTouches[0]
          : event.touches[0]
        : event;

      const fieldRect = field.getBoundingClientRect();
      const benchRect = bench.getBoundingClientRect();
      const mouseX = point.clientX;
      const mouseY = point.clientY;

      const id = getPlayerId(playerEl);
      const playerIndex = playersData.findIndex((p) => p.id === id);

      if (
        mouseX >= benchRect.left &&
        mouseX <= benchRect.right &&
        mouseY >= benchRect.top &&
        mouseY <= benchRect.bottom
      ) {
        playerEl.style.position = 'relative';
        playerEl.style.left = '';
        playerEl.style.top = '';
        bench.appendChild(playerEl);
        playersData[playerIndex].location = 'bench';
      } else if (
        mouseX >= fieldRect.left &&
        mouseX <= fieldRect.right &&
        mouseY >= fieldRect.top &&
        mouseY <= fieldRect.bottom
      ) {
        let x = mouseX - fieldRect.left - offsetX;
        let y = mouseY - fieldRect.top - offsetY;

        x = Math.max(0, Math.min(x, field.clientWidth - playerEl.offsetWidth));
        y = Math.max(
          0,
          Math.min(y, field.clientHeight - playerEl.offsetHeight)
        );

        const xPercent = (x / field.clientWidth) * 100;
        const yPercent = (y / field.clientHeight) * 100;

        playerEl.style.left = `${xPercent}%`;
        playerEl.style.top = `${yPercent}%`;
        playerEl.style.position = 'absolute';
        field.appendChild(playerEl);

        playersData[playerIndex].xPercent = xPercent;
        playersData[playerIndex].yPercent = yPercent;
        playersData[playerIndex].location = 'field';
      }

      if (isTouch) {
        document.removeEventListener('touchmove', move);
        document.removeEventListener('touchend', end);
      } else {
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', end);
      }

      saveToStorage();
    }

    if (isTouch) {
      document.addEventListener('touchmove', move, { passive: false });
      document.addEventListener('touchend', end);
    } else {
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', end);
    }

    if (!isTouch) event.preventDefault();
  }

  playerEl.addEventListener('mousedown', (e) => startDrag(e, false));
  playerEl.addEventListener('touchstart', (e) => startDrag(e, true), {
    passive: false,
  });
}

// Delete player
function addDeleteButton(playerEl) {
  const deleteBtn = playerEl.querySelector('.delete-btn');
  deleteBtn?.addEventListener('click', () => {
    const id = getPlayerId(playerEl);
    playerEl.remove();
    playersData = playersData.filter((p) => p.id !== id);
    saveToStorage();
  });
}

// Helpers
function getPlayerId(playerEl) {
  return parseInt(playerEl.getAttribute('data-id'));
}

function saveToStorage() {
  localStorage.setItem('players', JSON.stringify(playersData));
}

// theme changer feature
const themeToggle = document.getElementById('themeToggle');

// Load saved theme
if (localStorage.getItem('theme') === 'light') {
  document.body.classList.add('light-theme');
  themeToggle.textContent = '🌑 Dark Mode';
}

// Toggle on click
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
  const isLight = document.body.classList.contains('light-theme');
  themeToggle.textContent = isLight ? '🌑 Dark Mode' : '🌙 Light Mode';
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
});
