const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('audioAPI', {
    getAudioFiles: () => ipcRenderer.invoke('get-audio-files'),
    getThumbnail: (filePath) => ipcRenderer.invoke('get-thumbnail', filePath)
});

