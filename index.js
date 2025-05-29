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
  playerEl.addEventListener('mousedown', function (event) {
    if (event.target.classList.contains('delete-btn')) return;

    isDragging = true;
    offsetX = event.offsetX;
    offsetY = event.offsetY;
    playerEl.style.zIndex = 1000;

    // start tracking movement
    function handleMouseMove(event) {
      const containerRect = formationContainer.getBoundingClientRect();

      const x = event.clientX - containerRect.left - offsetX;
      const y = event.clientY - containerRect.top - offsetY;

      playerEl.style.position = 'absolute';
      // set position
      playerEl.style.left = `${x}px`;
      playerEl.style.top = `${y}px`;
    }
    function handleMouseUp(event) {
      isDragging = false;
      playerEl.style.zIndex = 1;

      const fieldRect = field.getBoundingClientRect();
      const benchRect = bench.getBoundingClientRect();

      const mouseX = event.clientX;
      const mouseY = event.clientY;

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
      }
      // Drop to field
      else if (
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

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      saveToStorage();
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    event.preventDefault();
  });
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
