// deepseek.js
// Lecture locale de MP3 et radios via proxy CORS minimaliste
const PROXY = 'https://api.allorigins.win/raw?url=';

document.addEventListener('DOMContentLoaded', () => {
  const audio      = document.getElementById('audioPlayer');
  const nowPlaying = document.getElementById('nowPlaying');
  const fileInput  = document.getElementById('fileInput');
  const playlist   = document.getElementById('playlist');
  const radioInput = document.getElementById('radioInput');
  const addRadioBtn= document.getElementById('addRadioBtn');
  const radioList  = document.getElementById('radioList');

  let tracks = [];
  let radios = JSON.parse(localStorage.getItem('radios') || '[]');

  function updateNow(text) {
    nowPlaying.textContent = text;
  }

  function renderPlaylist() {
    playlist.innerHTML = '';
    tracks.forEach((file, i) => {
      const li = document.createElement('li');
      li.textContent = file.name;
      li.onclick = () => playTrack(i);
      playlist.appendChild(li);
    });
  }

  function renderRadios() {
    radioList.innerHTML = '';
    radios.forEach((url, i) => {
      const li = document.createElement('li');
      li.textContent = url;
      li.onclick = () => playRadio(url);
      radioList.appendChild(li);
    });
  }

  fileInput.addEventListener('change', () => {
    tracks = Array.from(fileInput.files);
    renderPlaylist();
    if (tracks.length) playTrack(0);
  });

  async function playTrack(index) {
    if (index < 0 || index >= tracks.length) return;
    const url = URL.createObjectURL(tracks[index]);
    audio.src = url;
    updateNow(tracks[index].name);
    try { await audio.play(); } catch(e) { console.error(e); }
  }

  addRadioBtn.addEventListener('click', () => {
    const url = radioInput.value.trim();
    if (url && !radios.includes(url)) {
      radios.push(url);
      localStorage.setItem('radios', JSON.stringify(radios));
      renderRadios();
    }
    radioInput.value = '';
  });

  async function playRadio(url) {
    let stream = url;
    const ext = url.split('?')[0].split('.').pop().toLowerCase();
    try {
      if (ext === 'pls' || ext === 'm3u') {
        const res = await fetch(PROXY + encodeURIComponent(url));
        const txt = await res.text();
        const match = txt.match(/File\d+=(.*)/i);
        if (match && match[1]) stream = match[1].trim();
      }
    } catch(e) { console.warn('Playlist parse error', e); }
    const src = PROXY + encodeURIComponent(stream);
    audio.src = src;
    updateNow(url);
    try { await audio.play(); } catch(e) { console.error('Radio play error', e); }
  }

  renderPlaylist();
  renderRadios();
});