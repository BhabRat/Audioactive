const audio = document.getElementById('audio');
const title = document.getElementById('title');
const thumbnail = document.getElementById('thumbnail');
const progress = document.getElementById('progress');
const volume = document.getElementById('volume');
const speed = document.getElementById('speed');
const searchBar = document.getElementById('searchBar');
const bookList = document.getElementById('bookList');
const meta = document.getElementById('meta');
const darkToggle = document.getElementById('darkModeToggle');
const bookmarkBtn = document.getElementById('bookmarkBtn');
const sleep5 = document.getElementById('sleep5');

const playPauseBtn = document.getElementById('playPauseBtn');
const rewindBtn = document.getElementById('rewindBtn');
const forwardBtn = document.getElementById('forwardBtn');

let allBooks = [];
let currentBook = null;
let sleepTimeout = null;

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

// Save and resume progress
const saveProgress = () => {
    if (currentBook) {
        localStorage.setItem(`progress:${currentBook.path}`, audio.currentTime);
    }
};
const loadProgress = (path) => {
    const val = localStorage.getItem(`progress:${path}`);
    return val ? parseFloat(val) : 0;
};

// Bookmarking
const saveBookmark = () => {
    if (!currentBook) return;
    let bookmarks = JSON.parse(localStorage.getItem(`bookmarks:${currentBook.path}`) || '[]');
    bookmarks.push(audio.currentTime);
    localStorage.setItem(`bookmarks:${currentBook.path}`, JSON.stringify(bookmarks));
    alert("🔖 Bookmark added!");
};

// Event listeners
audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        progress.value = (audio.currentTime / audio.duration) * 100;
    }
});
audio.addEventListener('pause', saveProgress);

progress.addEventListener('input', () => {
    if (audio.duration) {
        audio.currentTime = (progress.value / 100) * audio.duration;
    }
});
volume.addEventListener('input', () => {
    audio.volume = volume.value / 100;
});
speed.addEventListener('change', () => {
    audio.playbackRate = parseFloat(speed.value);
});
bookmarkBtn.addEventListener('click', saveBookmark);
sleep5.addEventListener('click', () => {
    if (sleepTimeout) clearTimeout(sleepTimeout);
    sleepTimeout = setTimeout(() => audio.pause(), 5 * 60 * 1000);
    alert("💤 Sleep timer set for 5 minutes");
});
darkToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

// New controls
playPauseBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        playPauseBtn.textContent = '⏸️';
    } else {
        audio.pause();
        playPauseBtn.textContent = '▶️';
    }
});
rewindBtn.addEventListener('click', () => {
    audio.currentTime = Math.max(audio.currentTime - 10, 0);
});
forwardBtn.addEventListener('click', () => {
    audio.currentTime = Math.min(audio.currentTime + 10, audio.duration);
});
audio.addEventListener('play', () => playPauseBtn.textContent = '⏸️');
audio.addEventListener('pause', () => playPauseBtn.textContent = '▶️');

// Load selected book
async function loadBook(book) {
    currentBook = book;
    audio.src = book.path;
    title.innerText = book.title;
    meta.innerHTML = `
        ${book.author ? `<div>👤 ${book.author}</div>` : ''}
        ${book.year ? `<div>📅 ${book.year}</div>` : ''}
        ${book.genre ? `<div>🏷️ ${book.genre}</div>` : ''}
    `;

    const { cover } = await window.audioAPI.getThumbnail(book.path).catch(() => ({ cover: '' }));
    thumbnail.src = cover || '';
    audio.currentTime = loadProgress(book.path);
    audio.play();
}

// Render all books
async function renderBookList(books) {
    bookList.innerHTML = '';
    for (const book of books) {
        try {
            const li = document.createElement('li');
            li.className = 'book-card';

            const img = document.createElement('img');
            img.className = 'book-cover';
            const thumb = await window.audioAPI.getThumbnail(book.path);
            img.src = thumb?.cover || '';
            img.alt = book.title;

            const titleDiv = document.createElement('div');
            titleDiv.className = 'book-title';
            titleDiv.textContent = book.title;

            const genre = document.createElement('div');
            genre.style.fontSize = '12px';
            genre.style.color = '#777';
            genre.textContent = book.genre || '';

            li.appendChild(img);
            li.appendChild(titleDiv);
            li.appendChild(genre);

            li.addEventListener('click', () => loadBook(book));
            bookList.appendChild(li);
        } catch (err) {
            console.error(`Error rendering ${book.title}:`, err);
        }
    }
}

// Search
function filterBooks(query) {
    const filtered = allBooks.filter(book =>
        book.title.toLowerCase().includes(query.toLowerCase())
    );
    renderBookList(filtered);
}
searchBar.addEventListener('input', (e) => {
    filterBooks(e.target.value);
});

// Init
async function init() {
    try {
        allBooks = await window.audioAPI.getAudioFiles();
        console.log("Loaded books:", allBooks);
        renderBookList(allBooks);
    } catch (e) {
        console.error("Failed to init app:", e);
    }
}

init();

