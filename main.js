const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const mm = require('music-metadata');
const crypto = require('crypto');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

const audioDir = path.join(__dirname, 'assets');
const AUDIO_EXT = /\.(mp3|m4b)$/i;

function findFirstAudioFile(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            const result = findFirstAudioFile(fullPath);
            if (result) return result;
        } else if (AUDIO_EXT.test(entry.name)) {
            return fullPath;
        }
    }

    return null;
}

ipcMain.handle('get-audio-files', async () => {
    try {
        const entries = fs.readdirSync(audioDir, { withFileTypes: true });
        const books = [];

        for (const entry of entries) {
            const fullPath = path.join(audioDir, entry.name);

            if (entry.isDirectory()) {
                const audioPath = findFirstAudioFile(fullPath);
                if (audioPath) {
                    const metadata = await mm.parseFile(audioPath);
                    books.push({
                        title: entry.name,
                        path: path.relative(__dirname, audioPath),
                        author: metadata.common.artist || '',
                        year: metadata.common.year || '',
                        genre: metadata.common.genre?.[0] || ''
                    });
                }
            } else if (AUDIO_EXT.test(entry.name)) {
                const audioPath = path.join(audioDir, entry.name);
                const metadata = await mm.parseFile(audioPath);
                books.push({
                    title: path.parse(entry.name).name,
                    path: `assets/${entry.name}`,
                    author: metadata.common.artist || '',
                    year: metadata.common.year || '',
                    genre: metadata.common.genre?.[0] || ''
                });
            }
        }

        return books;
    } catch (err) {
        console.error("Failed to read nested audio files:", err);
        return [];
    }
});

ipcMain.handle('get-thumbnail', async (event, relativePath) => {
    try {
        const fullPath = path.join(__dirname, relativePath);
        const cacheDir = path.join(audioDir, '.cache');
        const hash = crypto.createHash('md5').update(relativePath).digest('hex');
        const cachePath = path.join(cacheDir, `${hash}.jpg`);

        if (fs.existsSync(cachePath)) {
            const base64 = fs.readFileSync(cachePath).toString('base64');
            return { cover: `data:image/jpeg;base64,${base64}` };
        }

        const metadata = await mm.parseFile(fullPath);
        const picture = metadata.common.picture?.[0];
        if (picture) {
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

            fs.writeFileSync(cachePath, picture.data);
            const base64 = picture.data.toString('base64');
            return { cover: `data:${picture.format};base64,${base64}` };
        }
    } catch (err) {
        console.error("Thumbnail error:", err);
    }

    return { cover: null };
});

