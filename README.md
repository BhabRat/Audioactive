# Audioactive
Offline audiobook-cum-music player. It basically uses the .m4b or .mp3 files and shows them in a very spotify and audible fashion. It's very sleek. It uses electronjs as a base. 

To use this, please install the electron dependencies. It supports windows, macos. and linux. It works best on linux.

# How to start

Step by step how-to for linux(it should be similar for every other system):
1) First "cd" into the directory where you have saved the files.
2) Type ```npm install``` and it'll install all the dependencies in the same file.
3) It should create a new "node modules" directory in the said one.
4) Next, create a new directory called "assets" and then keep all your audiofiles (m4b or mp3) inside it. You can make subfolders too!
5) Next, open terminal and type ```npm start``` to start the program.
6) Now you should see the GUI of the program.
7) You are done! Now enjoy!

# File Structure

```
Audioactive/
├── assets/
│   ├── Book1/
│   │   └── chapter1.m4b
├── index.html
├── main.js
├── preload.js
├── renderer.js
├── style.css
├── package.json
├── package-lock.json
```


# Feature List

## ✨ Features

- 🎧 Play `.m4b` and `.mp3` files
- 🗂 Folder-based grouping with in-app folder creation
- 🧠 Smart thumbnail caching for fast loading
- ⌨️ Keyboard shortcuts:
  - Spacebar: Play/Pause
  - ← / →: Rewind / Forward 10s
- 💤 Sleep timer (5 min)
- 🔖 Bookmarks
- 🎛 Playback speed control
- 🌗 Dark mode toggle






# Common Errors (Linux Specific)

## 🐧 **Linux Audio or File Access Permissions + Path Errors**

### 🧨 Most Common Error You Might Have Faced:

### ❌ `Error: EACCES: permission denied`

**Cause**:

* Trying to read files inside `assets/` or `assets/.cache/` on Linux without the right permissions
* Especially common when Electron tries to write the thumbnail cache

**Fix**:

```bash
chmod -R 755 ./assets
```

Or to ensure full read/write:

```bash
chmod -R 777 ./assets
```

---

## Other Linux-Specific Gotchas

### ❌ `Unable to open file`, `null metadata`

**Cause**:

* Linux paths are **case-sensitive**
* Using incorrect relative paths like `Assets/` instead of `assets/`

---

### ❌ `XDG_RUNTIME_DIR not set in the environment`

**Cause**:

* Some distros (esp. Arch-based) don't define GUI environment vars
* Electron may fail to launch without it

**Fix**:

```bash
export XDG_RUNTIME_DIR=/run/user/$(id -u)
```

---

### ✅ Bonus Tip for Linux Audio Playback

Sometimes Linux needs `gstreamer` for `<audio>` tags to function well with certain codecs (e.g. `.m4b`)

**Install**:

```bash
sudo apt install gstreamer1.0-plugins-base gstreamer1.0-plugins-good
```

---

   
