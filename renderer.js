const bookList = document.getElementById('bookList');
const searchBar = document.getElementById('searchBar');
const audio = document.getElementById('audio');
const title = document.getElementById('title');
const meta = document.getElementById('meta');
const thumbnail = document.getElementById('thumbnail');
const progress = document.getElementById('progress');
const playPauseBtn = document.getElementById('playPauseBtn');

let books = [];
let currentIndex = 0;
const BATCH_SIZE = 20;

async function loadBooks() {
    books = await window.audioAPI.getAudioFiles();
    filteredBooks = books;
    currentIndex = 0;
    bookList.innerHTML = '';
    observeEndSentinel();
    loadNextBatch();
}

function renderBook(book) {
    const li = document.createElement('li');
    li.className = 'book-card';
    li.innerHTML = `
        <img class="book-cover" src="" alt="Cover">
        <div class="book-title">${book.title}</div>
    `;
    li.addEventListener('click', () => loadBook(book));
    bookList.appendChild(li);

    window.audioAPI.getThumbnail(book.path).then(data => {
        if (data.cover) li.querySelector('.book-cover').src = data.cover;
    });
}

function loadNextBatch() {
    const end = Math.min(currentIndex + BATCH_SIZE, filteredBooks.length);
    for (; currentIndex < end; currentIndex++) {
        renderBook(filteredBooks[currentIndex]);
    }
    if (currentIndex >= filteredBooks.length && observer) {
        observer.disconnect();
    }
}

function loadBook(book) {
    audio.src = book.path;
    title.textContent = book.title;
    meta.textContent = `${book.author} ${book.year} ${book.genre}`;
    audio.play();

    window.audioAPI.getThumbnail(book.path).then(data => {
        thumbnail.src = data.cover || '';
    });
}

let filteredBooks = [];
searchBar.addEventListener('input', () => {
    const term = searchBar.value.toLowerCase();
    filteredBooks = books.filter(b => b.title.toLowerCase().includes(term));
    currentIndex = 0;
    bookList.innerHTML = '';
    observeEndSentinel();
    loadNextBatch();
});

progress.addEventListener('input', () => {
    audio.currentTime = (audio.duration * progress.value) / 100;
});

audio.addEventListener('timeupdate', () => {
    progress.value = (audio.currentTime / audio.duration) * 100 || 0;
});

playPauseBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        playPauseBtn.textContent = '⏸️';
    } else {
        audio.pause();
        playPauseBtn.textContent = '▶️';
    }
});

// Lazy Loading Observer
let observer;
function observeEndSentinel() {
    if (observer) observer.disconnect();
    const sentinel = document.createElement('div');
    sentinel.id = 'sentinel';
    bookList.appendChild(sentinel);

    observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            loadNextBatch();
        }
    });
    observer.observe(sentinel);
}

loadBooks();

