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

const folderSelect = document.getElementById('folderSelect');
const newFolderName = document.getElementById('newFolderName');
const createFolderBtn = document.getElementById('createFolderBtn');

let allBooks = [];
let currentBook = null;
let sleepTimeout = null;

// Progress save/load
function saveProgress() {
    if (currentBook) {
        localStorage.setItem(`progress:${currentBook.path}`, audio.currentTime);
    }
}
function loadProgress(path) {
    const val = localStorage.getItem(`progress:${path}`);
    return val ? parseFloat(val) : 0;
}

// Folder utils
function getFolders() {
    return JSON.parse(localStorage.getItem('folders') || '{}');
}
function saveFolders(folders) {
    localStorage.setItem('folders', JSON.stringify(folders));
}
function updateFolderDropdown() {
    folderSelect.innerHTML = '<option value="all">📚 All Books</option>';
    const folders = getFolders();
    Object.keys(folders).forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        folderSelect.appendChild(opt);
    });
}

// Audio
audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        progress.value = (audio.currentTime / audio.duration) * 100;
    }
});
audio.addEventListener('pause', saveProgress);
audio.addEventListener('play', () => playPauseBtn.textContent = '⏸️');
audio.addEventListener('pause', () => playPauseBtn.textContent = '▶️');

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
bookmarkBtn.addEventListener('click', () => {
    if (!currentBook) return;
    let bookmarks = JSON.parse(localStorage.getItem(`bookmarks:${currentBook.path}`) || '[]');
    bookmarks.push(audio.currentTime);
    localStorage.setItem(`bookmarks:${currentBook.path}`, JSON.stringify(bookmarks));
    alert("🔖 Bookmark added!");
});
sleep5.addEventListener('click', () => {
    if (sleepTimeout) clearTimeout(sleepTimeout);
    sleepTimeout = setTimeout(() => audio.pause(), 5 * 60 * 1000);
    alert("💤 Sleep timer set for 5 minutes");
});
darkToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});
playPauseBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
});
rewindBtn.addEventListener('click', () => {
    audio.currentTime = Math.max(audio.currentTime - 10, 0);
});
forwardBtn.addEventListener('click', () => {
    audio.currentTime = Math.min(audio.currentTime + 10, audio.duration);
});
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (audio.paused) audio.play();
        else audio.pause();
    } else if (e.code === 'ArrowLeft') {
        audio.currentTime = Math.max(audio.currentTime - 10, 0);
    } else if (e.code === 'ArrowRight') {
        audio.currentTime = Math.min(audio.currentTime + 10, audio.duration);
    }
});

// Book load
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
    thumbnail.src = cover || 'placeholder.jpg';
    audio.currentTime = loadProgress(book.path);
    audio.play();
}

// Render books
async function renderBookList(books) {
    bookList.innerHTML = '';
    for (const book of books) {
        const li = document.createElement('li');
        li.className = 'book-card';

        const img = document.createElement('img');
        img.className = 'book-cover';
        img.src = 'placeholder.jpg';

        window.audioAPI.getThumbnail(book.path).then(thumb => {
            if (thumb?.cover) {
                img.src = thumb.cover;
            }
        });

        const titleDiv = document.createElement('div');
        titleDiv.className = 'book-title';
        titleDiv.textContent = book.title;

        const genre = document.createElement('div');
        genre.style.fontSize = '12px';
        genre.style.color = '#777';
        genre.textContent = book.genre || '';

        const folderBtn = document.createElement('button');
        folderBtn.textContent = '📂';
        folderBtn.addEventListener('click', () => {
            const name = prompt("Add to which folder?");
            if (!name) return;
            const folders = getFolders();
            folders[name] = folders[name] || [];
            if (!folders[name].includes(book.path)) {
                folders[name].push(book.path);
                saveFolders(folders);
                updateFolderDropdown();
                alert(`Added to "${name}"`);
            }
        });

        li.appendChild(img);
        li.appendChild(titleDiv);
        li.appendChild(genre);
        li.appendChild(folderBtn);

        li.addEventListener('click', () => loadBook(book));
        bookList.appendChild(li);
    }
}

// Search & Filter
searchBar.addEventListener('input', (e) => {
    filterBooks(e.target.value);
});
folderSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'all') {
        renderBookList(allBooks);
    } else {
        const folders = getFolders();
        const filtered = allBooks.filter(b => folders[val]?.includes(b.path));
        renderBookList(filtered);
    }
});
createFolderBtn.addEventListener('click', () => {
    const name = newFolderName.value.trim();
    if (!name) return;
    const folders = getFolders();
    if (!folders[name]) {
        folders[name] = [];
        saveFolders(folders);
        updateFolderDropdown();
        alert(`Folder "${name}" created.`);
    }
});

// Init
async function init() {
    allBooks = await window.audioAPI.getAudioFiles();
    updateFolderDropdown();
    renderBookList(allBooks);
}

init();

