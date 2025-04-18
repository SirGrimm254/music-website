const categorySelect = document.getElementById('category-select');
categorySelect.addEventListener('change', function () {
const url = this.value;
if (url) {
    window.location.href = url;
    this.selectedIndex = 0; // Reset to "Genres"
}
});

// Initialize the audio element
const audio = document.getElementById('audio-player') || new Audio();

if (!document.body.contains(audio)) {
  document.body.appendChild(audio);
}

audio.addEventListener('error', (e) => console.error('Audio error:', e));

let isPlaying = false;
let isMuted = false;
let loopState = 0;
let isShuffle = false;
let songSelected = false;
let currentIndex = 0;
let holdPrevInterval = null;
let holdNextInterval = null;

const songs = {
  song1: { title: 'Vybz Kartel - Drone Dem(Raw)', genre: 'Dancehall', songImage: 'images/drone.jpeg', artistImage: 'images/vybzkartel.jpeg', url: 'songs/Dronedem.mp3' },
  song2: { title: 'Kendrick Lamar - Euphoria', genre: 'Trap/Hiphop', songImage: 'images/euphoria.jpeg', artistImage: 'images/kendrick.jpeg', url: 'songs/Euphoria.mp3' },
  song3: { title: 'Gunna - One of Wun', genre: 'Trap/Hiphop', songImage: 'images/oneofone.jpg', artistImage: 'images/gunna.jpeg', url: 'songs/Oneofone.mp3' },
  song4: { title: 'Travis Scott - Butterfly Effects', genre: 'Trap/Hiphop', songImage: 'images/butterflyeffects.jpg', artistImage: 'images/travisscott.jpeg', url: 'songs/ButterflyEffects.mp3' },
  song5: { title: 'Vybz Kartel - Drag Dem Bat', genre: 'Dancehall', songImage: 'images/dragdembat.jpg', artistImage: 'images/vybzkartel.jpeg', url: 'songs/Dragdembat.mp3' },
};

const songIds = Object.keys(songs);
const fixedAudioSection = document.getElementById('audio-section');
const originalAudioSection = document.getElementById('original-audio-section');

function selectSongById(id) {
  const song = songs[id];
  if (!song) return;

  document.querySelectorAll('#audio-title').forEach(el => el.textContent = song.title);
  document.querySelectorAll('#genre-info').forEach(el => el.textContent = `Genre: ${song.genre}`);
  document.querySelectorAll('#description-text').forEach(el => el.textContent = `Description: ${song.genre} music from ${song.title.split('-')[0].trim()}.`);
  document.querySelectorAll('#artist-image').forEach(el => el.src = song.artistImage);
  document.querySelectorAll('#audio-thumbnail-original').forEach(el => el.src = song.songImage);
  document.querySelectorAll('#audio-thumbnail-fixed').forEach(el => el.src = song.songImage);

  if (originalAudioSection) originalAudioSection.style.display = 'block';

  songSelected = true;
  currentIndex = songIds.indexOf(id);

  audio.src = song.url;
  audio.play().then(() => console.log('Playing:', song.title)).catch(err => console.error('Playback failed:', err));

  isPlaying = true;
  updatePlayButton();

  const rect = originalAudioSection.getBoundingClientRect();
  const isInView = rect.top < window.innerHeight && rect.bottom > 0;
  fixedAudioSection.classList.toggle('hidden', isInView);
}

function updatePlayButton() {
  const playIcon = isPlaying ? '⏸️' : '▶️';
  document.querySelectorAll('#play-button-original, #play-button-fixed').forEach(btn => btn.textContent = playIcon);
}

function togglePlay() {
  if (isPlaying) {
    audio.pause();
  } else {
    audio.play();
  }
  isPlaying = !isPlaying;
  updatePlayButton();
}

function toggleMute() {
  isMuted = !isMuted;
  audio.muted = isMuted;
  document.querySelectorAll('#volume-icon i').forEach(icon => {
    icon.className = isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
  });
}

function changeVolume(value) {
  audio.volume = value;
}

document.getElementById('volume-bar')?.addEventListener('input', function () {
  changeVolume(parseFloat(this.value));
  if (audio.muted && this.value > 0) toggleMute();
});

function updateLoopButton() {
  document.querySelectorAll('#loop-button').forEach(btn => {
    btn.classList.toggle('active-state', loopState !== 0);
  });
  document.querySelectorAll('#loop-mode-label').forEach(label => {
    label.textContent = loopState === 1 ? 'All' : loopState === 2 ? '1' : '';
  });
}

function toggleLoop() {
  loopState = (loopState + 1) % 3;
  audio.loop = loopState === 2;
  updateLoopButton();
}

document.querySelectorAll('#loop-button').forEach(btn => btn.addEventListener('click', toggleLoop));

document.querySelectorAll('#shuffle-button').forEach(btn => btn.addEventListener('click', function () {
  isShuffle = !isShuffle;
  document.querySelectorAll('#shuffle-button').forEach(b => b.classList.toggle('active-state', isShuffle));
}));

function handlePrev() {
  if (currentIndex > 0) {
    currentIndex--;
  } else if (loopState === 1) {
    currentIndex = songIds.length - 1;
  } else {
    return;
  }
  selectSongById(songIds[currentIndex]);
}

function handleNext() {
  if (currentIndex < songIds.length - 1) {
    currentIndex++;
  } else if (loopState === 1) {
    currentIndex = 0;
  } else {
    return;
  }
  selectSongById(songIds[currentIndex]);
}

audio.addEventListener('timeupdate', function () {
  document.querySelectorAll('#progress-bar').forEach(bar => {
    bar.value = (audio.currentTime / audio.duration) * 100 || 0;
  });

  if (!isNaN(audio.duration)) {
    const timeString = `${Math.floor(audio.currentTime / 60)}:${String(Math.floor(audio.currentTime % 60)).padStart(2, '0')} / ${Math.floor(audio.duration / 60)}:${String(Math.floor(audio.duration % 60)).padStart(2, '0')}`;
    document.querySelectorAll('#audio-duration').forEach(label => {
      label.textContent = timeString;
    });
  }
});

document.querySelectorAll('#progress-bar').forEach(bar => {
  bar.addEventListener('input', function () {
    audio.currentTime = (parseFloat(this.value) / 100) * audio.duration;
  });
});

if (!window.location.pathname.includes('favourites.html')) {
  audio.addEventListener('ended', function () {
    if (loopState === 2) {
      audio.currentTime = 0;
      audio.play();
    } else if (isShuffle) {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * songIds.length);
      } while (nextIndex === currentIndex);
      currentIndex = nextIndex;
      selectSongById(songIds[currentIndex]);
    } else if (currentIndex < songIds.length - 1) {
      currentIndex++;
      selectSongById(songIds[currentIndex]);
    } else if (loopState === 1) {
      currentIndex = 0;
      selectSongById(songIds[currentIndex]);
    }
  });
}

// Scroll visibility logic
window.addEventListener('scroll', () => {
  if (!songSelected) return;
  const rect = originalAudioSection.getBoundingClientRect();
  const isInView = rect.top < window.innerHeight && rect.bottom > 0;

  if (isInView) {
    fixedAudioSection.classList.add('hidden');
  } else {
    fixedAudioSection.classList.remove('hidden');
  }
});

// Long press fast forward and rewind
function startHoldPrev() {
  holdPrevInterval = setInterval(() => {
    audio.currentTime = Math.max(0, audio.currentTime - 2);
  }, 200);
}

function startHoldNext() {
  holdNextInterval = setInterval(() => {
    audio.currentTime = Math.min(audio.duration, audio.currentTime + 2);
  }, 200);
}

function stopHold() {
  clearInterval(holdPrevInterval);
  clearInterval(holdNextInterval);
}

document.querySelectorAll('#prev-button').forEach(btn => {
  btn.addEventListener('mousedown', startHoldPrev);
  btn.addEventListener('mouseup', stopHold);
  btn.addEventListener('mouseleave', stopHold);
});

document.querySelectorAll('#next-button').forEach(btn => {
  btn.addEventListener('mousedown', startHoldNext);
  btn.addEventListener('mouseup', stopHold);
  btn.addEventListener('mouseleave', stopHold);
});

// Expose functions
window.selectSongById = selectSongById;
window.togglePlay = togglePlay;
window.toggleMute = toggleMute;
window.toggleLoop = toggleLoop;
window.handlePrev = handlePrev;
window.handleNext = handleNext;


// Sign Up Popup Logic
const signBtn = document.querySelector('.signBtn');
const popup = document.getElementById('signup-popup');
const cancelBtn = document.getElementById('cancel-button');
const signupForm = document.getElementById('signup-form');

signBtn.addEventListener('click', () => {
  popup.classList.remove('hidden');
});

cancelBtn.addEventListener('click', () => {
  popup.classList.add('hidden');
});

signupForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const username = signupForm.username.value.trim();
  const email = signupForm.email.value.trim();
  const password = signupForm.password.value;
  const confirmPassword = signupForm['confirm-password'].value;

  if (password !== confirmPassword) {
    showMessage('Passwords do not match.');
    return;
  }

  let users = JSON.parse(localStorage.getItem('users')) || [];

  const exists = users.some(user => user.username === username);
  if (exists) {
    showMessage('User already exists.');
    return;
  }

  const user = { username, email, password };
  users.push(user);
  localStorage.setItem('users', JSON.stringify(users));

  showMessage('Sign Up Successful!');
  signupForm.reset();
  popup.classList.add('hidden');
});

// Login Popup Logic
const loginBtn = document.querySelector('.logBtn');
const loginPopup = document.getElementById('login-popup');
const loginCancelBtn = document.getElementById('login-cancel-button');
const loginForm = document.getElementById('login-form');

loginBtn.addEventListener('click', () => {
  loginPopup.classList.remove('hidden');
});

loginCancelBtn.addEventListener('click', () => {
  loginPopup.classList.add('hidden');
});

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const username = loginForm['login-username'].value.trim();
  const password = loginForm['login-password'].value;

  const users = JSON.parse(localStorage.getItem('users')) || [];

  const matchedUser = users.find(user =>
    user.username === username && user.password === password
  );

  if (matchedUser) {
    localStorage.setItem('loggedInUser', JSON.stringify(matchedUser)); // ✅ Save logged in user
    showMessage(`Welcome back, ${matchedUser.username}!`);
    setTimeout(() => {
      location.reload();
    }, 1500);
    loginPopup.style.display = 'none';
  } else {
    showMessage('Invalid username or password.');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const userProfileSection = document.querySelector('.user-profile');
  const displayUsername = document.getElementById('display-username');
  const profileImg = document.getElementById('profile-img');
  const imageInput = document.getElementById('upload-img');

  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

  if (loggedInUser) {
    // Show profile section
    if (userProfileSection) userProfileSection.style.display = 'block';

    // Display username
    if (displayUsername) displayUsername.textContent = loggedInUser.username;

    // Load stored image if exists
    const storedImage = localStorage.getItem(`profileImage-${loggedInUser.username}`);
    if (storedImage && profileImg) {
      profileImg.src = storedImage;
    }

    // Handle logout + update button
    const authButtonsContainer = document.getElementById('auth-buttons');
    if (authButtonsContainer) {
      authButtonsContainer.innerHTML = `
        <button id="logout-btn" class="logBtn">Log Out</button>
      `;
      document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');
        location.reload();
      });
    }
  } else {
    // Hide profile section
    if (userProfileSection) userProfileSection.style.display = 'none';
  }

  // Image upload logic
  if (imageInput && loggedInUser) {
    imageInput.addEventListener('change', function () {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const imageData = e.target.result;
          if (profileImg) profileImg.src = imageData;
          localStorage.setItem(`profileImage-${loggedInUser.username}`, imageData);
        };
        reader.readAsDataURL(file);
      }
    });
  }
});

// Show Message
function showMessage(text, duration = 2500) {
  const messageBox = document.getElementById('message-box');
  const messageText = document.getElementById('message-text');

  messageText.textContent = text;
  messageBox.classList.remove('hidden');

  setTimeout(() => {
    messageBox.classList.add('hidden');
  }, duration);
}

function addToFavourites(id, name, genre, imgSrc, songUrl) {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!loggedInUser) {
    alert("Please log in to add favourites.");
    return;
  }

  const key = `favourites_${loggedInUser.username}`;
  const favourites = JSON.parse(localStorage.getItem(key)) || [];

  const exists = favourites.some(song => song.id === id);
  if (!exists) {
    favourites.push({ id, name, genre, imgSrc, url: songUrl });  // Add URL to the favourites
    localStorage.setItem(key, JSON.stringify(favourites));
    alert("Added to favourites.");
  } else {
    alert("Song is already in favourites.");
  }
}

// Before page unload
window.addEventListener('beforeunload', () => {
  localStorage.setItem('playingSong', audio.src);
  localStorage.setItem('playingTime', audio.currentTime);
  localStorage.setItem('isPlaying', !audio.paused);
});

document.getElementById('page-content').src = 'favourites.html';
