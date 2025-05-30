//@ts-nocheck
const field = document.getElementById('field');
const playerFormElement = document.getElementById('playerForm');
const exportBtn = document.getElementById('exportBtn');
const bench = document.getElementById('bench');
const formationContainer = document.getElementById('formationContainer');

let isDragging = false;
let offsetX = 0,
  offsetY = 0;

let playersData = JSON.parse(localStorage.getItem('players')) || [];

// load saved players on page load
window.addEventListener('DOMContentLoaded', function () {
  for (let index = 0; index < playersData.length; index++) {
    createPlayerElement(playersData[index]);
  }
});

// export image functionality
exportBtn.addEventListener('click', function () {
  html2canvas(formationContainer).then((canvas) => {
    const link = document.createElement('a');
    link.download = 'formation.png';
    link.href = canvas.toDataURL();
    link.click();
  });
});

const players = document.querySelectorAll('.player');
for (let index = 0; index < players.length; index++) {
  makeDraggable(players[index]);
  addDeleteButton(players[index]);
}

// add new player functionality
playerFormElement.addEventListener('submit', function (event) {
  event.preventDefault();
  const name = document.getElementById('playerName').value.trim();
  if (!name) return alert('Player name can not be empty');
  const position = document.getElementById('playerPosition').value;
  const country = document.getElementById('playerCountry').value;
  // const imageFile = document.getElementById('playerImage').files[0];

  const newPlayer = {
    id: Date.now(),
    name,
    position,
    country,
    x: 0,
    y: 0,
    location: 'bench', // field or bench
  };
  playersData.push(newPlayer);
  saveToStorage();

  createPlayerElement(newPlayer);
  playerFormElement.reset();
});

// Create Player DOM
function createPlayerElement(player) {
  const playerEl = document.createElement('div');
  playerEl.className = 'player';
  playerEl.classList.add(`${player.position.toLowerCase()}`);
  playerEl.setAttribute('data-id', player.id);

  if (player.location === 'field') {
    playerEl.style.position = 'absolute';
    playerEl.style.left = `${player.x}px`;
    playerEl.style.top = `${player.y}px`;
  }

  playerEl.innerHTML = `
  <p><strong>${player.name}</strong></p>
  <p>(${player.position})</p>
  <p class="country">${player.country}</p>
  <button class="delete-btn">❌</button>
  `;
  makeDraggable(playerEl);
  addDeleteButton(playerEl);

  console.log(player.location);
  if (player.location === 'field') {
    field.appendChild(playerEl);
  } else {
    bench.appendChild(playerEl);
  }

  return playerEl;
}

// player dragging functionality
function makeDraggable(playerEl) {
  function stratDrag(event, isTouch = false) {
    if (event.target.classList.contains('delete-btn')) return;
    isDragging = true;

    const point = isTouch ? event.touches[0] : event;
    const rect = playerEl.getBoundingClientRect();
    offsetX = point.clientX - rect.left;
    offsetY = point.clientY - rect.top;
    playerEl.style.zIndex = 1000;

    function move(event) {
      const point = isTouch ? event.touches[0] : event;
      const containerRect = formationContainer.getBoundingClientRect();
      const x = point.clientX - containerRect.left - offsetX;
      const y = point.clientY - containerRect.top - offsetY;

      playerEl.style.position = 'absolute';
      playerEl.style.left = `${x}px`;
      playerEl.style.top = `${y}px`;
    }

    function end(event) {
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

      if (
        mouseX >= benchRect.left &&
        mouseX <= benchRect.right &&
        mouseY >= benchRect.top &&
        mouseY <= benchRect.bottom
      ) {
        // Move to Bench
        playerEl.style.position = 'relative';
        playerEl.style.left = '';
        playerEl.style.top = '';
        bench.appendChild(playerEl);

        for (let index = 0; index < playersData.length; index++) {
          if (playersData[index].id === id) {
            playersData[index].location = 'bench';
            break;
          }
        }
      } else if (
        mouseX >= fieldRect.left &&
        mouseX <= fieldRect.right &&
        mouseY >= fieldRect.top &&
        mouseY <= fieldRect.bottom
      ) {
        //    const fieldRect = field.getBoundingClientRect();
        let x = mouseX - fieldRect.left - offsetX;
        let y = mouseY - fieldRect.top - offsetY;

        const clampedX = Math.max(
          0,
          Math.min(x, field.clientWidth - playerEl.offsetWidth)
        );
        const clampedY = Math.max(
          0,
          Math.min(y, field.clientHeight - playerEl.offsetHeight)
        );

        playerEl.style.left = '${clampedX}px';
        playerEl.style.top = '${clampedY}px';
        playerEl.style.position = 'absolute';
        field.appendChild(playerEl);

        for (let index = 0; index < playersData.length; index++) {
          if (playersData[index].id === id) {
            playersData[index].x = clampedX;
            playersData[index].y = clampedY;
            playersData[index].location = 'field';
            break;
          }
        }
        // saveToStorage();
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
      document.addEventListener('touchmove', move);
      document.addEventListener('touchend', end);
    } else {
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', end);
    }
    if (!isTouch) event.preventDefault();
  }
  playerEl.addEventListener('mousedown', function (event) {
    stratDrag(event, false);
  });
  playerEl.addEventListener(
    'touchstart',
    function (event) {
      stratDrag(event, false);
    },
    { passive: false }
  );
}

// player delete functionality
function addDeleteButton(playerEl) {
  const deleteBtn = playerEl.querySelector('.delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', function () {
      const id = parseInt(playerEl.getAttribute('data-id'));
      playerEl.remove();

      for (let index = 0; index < playersData.length; index++) {
        if (playersData[index].id === id) {
          playersData.splice(index, 1);
          break;
        }
      }
      saveToStorage();
    });
  }
}

// save to localStorage
function saveToStorage() {
  localStorage.setItem('players', JSON.stringify(playersData));
}

function getPlayerId(playerEl) {
  return parseInt(playerEl.getAttribute('data-id'));
}

// mousedown, mousemove, mouseup
// touchstart, touchmove, touchend
