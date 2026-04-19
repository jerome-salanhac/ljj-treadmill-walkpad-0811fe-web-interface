# 🏃 LJJ Treadmill — Bluetooth Web Control

A Progressive Web App (PWA) to control a connected **LJJ-0811FE** walking pad (by LIJIUJIA) and other **FitShow**-compatible treadmills directly from a Chrome/Edge browser — no native app, no store, no account.

Works on Windows, Android, macOS, Linux and ChromeOS. **Does not work on iOS** (Apple blocks Web Bluetooth in Safari).

---

## 📑 Table of Contents

- [Features](#-features)
- [Compatibility](#-compatibility)
- [Installation](#-installation)
- [User Guide](#-user-guide)
  - [Connecting to the treadmill](#connecting-to-the-treadmill)
  - [Starting and stopping](#starting-and-stopping)
  - [Controlling speed](#controlling-speed)
  - [Reading live metrics](#reading-live-metrics)
  - [Installing as an app (PWA)](#installing-as-an-app-pwa)
  - [Using the activity badge](#using-the-activity-badge)
  - [Wake button and deep sleep](#wake-button-and-deep-sleep)
  - [BLE log and debugging](#ble-log-and-debugging)
- [Project Structure](#-project-structure)
- [Reverse-Engineered Protocol](#-reverse-engineered-protocol)
- [Limitations](#-limitations)
- [Customization](#-customization)
- [Troubleshooting](#-troubleshooting)
- [Project Status](#-project-status)
- [License](#-license)
- [Credits](#-credits)

---

## ✨ Features

- 🔗 **Direct Bluetooth connection** from the browser using the Web Bluetooth API — no pairing through OS settings needed
- ▶️ **Full control**: start, stop, speed adjustment, wake
- 📊 **Live metrics**: speed, elapsed time, distance, calories — all synced with the treadmill's display
- 🔄 **Two-way UI sync**: the speed slider follows the treadmill's actual speed, not just your last command
- 📱 **Installable as a PWA** on desktop and Android — icon on home screen, runs in standalone window
- ⏱️ **Elapsed time in the tab title** — visible at a glance in the taskbar
- 🔢 **Numeric badge on the app icon** showing minutes elapsed (Windows taskbar, Android home screen)
- 🔒 **Screen wake lock** during workouts — your device screen won't dim while the treadmill is running
- ⚠️ **Accidental close protection** — the browser prompts for confirmation if you try to close the tab while running
- 🔍 **Built-in BLE inspector** — view all GATT services, send raw hex commands, read notifications

---

## 🎯 Compatibility

Tested and confirmed working on:

- **LIJIUJIA LJJ-0811FE** walking pad

Should work with any treadmill exposing the FitShow BLE service (UUID `0xFFF0`), including many rebranded walking pads sold under various Amazon/AliExpress generic brands. If the Bluetooth name starts with `FS-` or `LJJ-` and the official FitShow app works with it, this web app likely will too.

Browser requirements: **Chrome 89+**, **Edge 89+**, **Opera** or any Chromium-based browser on Windows, macOS, Linux, Android, ChromeOS. Safari is **not supported** (Apple does not implement Web Bluetooth).

---

## 🚀 Installation

### Option 1 — GitHub Pages

Enable GitHub Pages on your fork (Settings → Pages → Source: `main` → `/ (root)`). The app becomes available at `https://<user>.github.io/<repo>/`.

### Option 2 — Netlify Drop

Drag and drop the project folder onto [app.netlify.com/drop](https://app.netlify.com/drop) for an instant HTTPS URL without any account.

### Option 3 — Local testing

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/` in Chrome.

### Option 4 — Opening the HTML file directly

For quick experimentation without any server, you can clone or download the repo and double-click `index.html` to open it in your browser. Most features work this way, including Bluetooth control, speed adjustment and live metrics.

However, PWA installation and the taskbar badge feature **will not work** because they require the page to be served over HTTPS (or localhost). For the full experience, use one of the three options above.

> ⚠️ Web Bluetooth **requires HTTPS** (or `localhost` for development). On some browsers/versions, `file://` may also work for Bluetooth, but not for PWA features.

---

## 📖 User Guide

### Connecting to the treadmill

1. Turn on the treadmill and make sure the screen is active (not in deep sleep — see [limitations](#-limitations))
2. Open the web app in Chrome/Edge
3. Click **🔗 Connecter le tapis** (Connect the treadmill)
4. In the Bluetooth device picker, select the treadmill (its name usually starts with `LJJ-`, `FS-` or similar)
5. Wait for the status indicator to turn green with the treadmill's name

Once connected, the app starts polling the treadmill every 500 ms to read its status. You should see a steady exchange of TX/RX frames in the BLE log panel.

### Starting and stopping

- **▶ Start**: initiates the treadmill at the speed shown in the slider. Internally sends a Wake command followed by a Speed command, with a second Speed confirmation 1.5 seconds later to override the treadmill's default starting speed.
- **⏹ Stop**: halts the belt immediately.

After a stop, you can click Start again without any additional setup. The previously selected speed is remembered.

### Controlling speed

Four ways to change speed, all of them work both when the treadmill is running and when it is idle:

- **Slider**: drag to any value between min and max speed. Release to commit.
- **± buttons**: increment/decrement by 0.5 km/h.
- **Preset buttons**: quick jump to 1, 2, 3, 4, 5 or 6 km/h.
- **Big number display**: read-only, shows the current setpoint.

The speed range is **auto-detected** from the treadmill at connection time (SPEED_INFO query). For the LJJ-0811FE this is 1.0 to 6.0 km/h.

**Two-way sync behavior**: the slider reflects the treadmill's actual speed, except during a 3-second grace period after you change it manually — to avoid having your adjustment overwritten by the next polling response.

### Reading live metrics

Four metrics are displayed and updated once per second:

- **Vitesse** — current belt speed in km/h (from treadmill)
- **Temps** — elapsed time in mm:ss (from treadmill)
- **Distance** — total distance in km (from treadmill)
- **Calories** — estimated calories burned (from treadmill)

Values come straight from the treadmill's counters, so they match exactly what you see on the physical display. Time and distance reset to zero when you Stop — this is the treadmill's behavior, not the app's.

### Installing as an app (PWA)

The app can be installed as a standalone application. Benefits:

- Dedicated icon on your desktop / home screen / taskbar
- Opens in its own window without browser UI
- Works as a first-class app (Alt+Tab on Windows, app switcher on Android)
- Enables the activity badge feature (see below)

To install:

- **Chrome / Edge desktop**: click the install icon in the address bar, or use the blue "Installer" banner in the app
- **Android Chrome**: tap the install prompt, or use the three-dot menu → "Install app"
- **iOS Safari** (limited — no Bluetooth available, just for UI preview): Share button → "Add to Home Screen"

Once installed, launching from the icon opens the app in standalone mode automatically.

### Using the activity badge

When running as an installed PWA on a supported platform (Windows 10/11, Android), the app displays the **elapsed minutes directly on the app icon** in the taskbar / home screen.

- Treadmill idle: no badge
- Running for 5 minutes: icon shows a "**5**" badge
- Running for 37 minutes: icon shows a "**37**" badge

This lets you glance at the taskbar and know your workout progress without switching to the app window. The tab title also shows the full `mm:ss 🏃` format, visible when hovering the icon.

Platform notes:
- **Windows 10/11 taskbar**: works with Chrome and Edge
- **Android home screen**: works on most launchers
- **macOS dock**: not supported by macOS
- **Linux**: varies by desktop environment

### Wake button and deep sleep

The **⏰ Wake** button sends a wake command (`02 44 01`) to the treadmill. Useful if:

- The treadmill shows no response to Start but the Bluetooth connection is still alive
- The treadmill was idle for a while and seems locked

Limitation: once the treadmill enters **deep sleep** (screen completely off, no response to any command), even this button cannot wake it up. The official FitShow app has the same limitation — this appears to be a hardware-level sleep mode that can only be broken by the treadmill's internal timer.

### BLE log and debugging

The bottom panel shows all Bluetooth frames exchanged with the treadmill in real time:

- **TX** (yellow): commands sent to the treadmill
- **RX** (green): responses or notifications from the treadmill
- **Info / Err**: app-level events

Controls:

- **Masquer polling** checkbox (enabled by default): hides the repetitive status heartbeat to keep the log readable, showing only a compact counter instead
- **⏸ Pause**: freezes the log so you can read it without it scrolling
- **Clear**: wipes the log and resets counters
- **Masquer / Afficher**: collapses the log panel

A **🔍 Debug trame running** panel under the metrics shows the last status frame broken down byte by byte with interpretations — useful for understanding the protocol or debugging a model variation.

---

## 📁 Project Structure

```
.
├── index.html       # Full application (HTML + CSS + JS inline)
├── manifest.json    # PWA manifest
├── sw.js            # Service worker (required for PWA install)
├── icon-192.png     # 192×192 icon
├── icon-512.png     # 512×512 icon
└── README.md        # This file
```

Single-page app, no build step, no npm dependencies. Everything is readable and editable directly in `index.html`.

---

## 🔧 Reverse-Engineered Protocol

The treadmill uses a proprietary variant of the **FitShow** BLE protocol, close to but not identical to the public reference implementation ([tyge68/fitshow-treadmill](https://github.com/tyge68/fitshow-treadmill), which documents the Sportstech F31).

### BLE Service

| Element | UUID | Role |
|---|---|---|
| Service | `0000fff0-0000-1000-8000-00805f9b34fb` | Virtual serial port |
| Characteristic | `0000fff1-...` | Notifications (treadmill → app) |
| Characteristic | `0000fff2-...` | Writes (app → treadmill) |

### Frame Format

```
[0x02, opcode, ...parameters, checksum_XOR, 0x03]
```

- `0x02` = start of frame
- `checksum` = XOR of all bytes **between** the start byte and the checksum (exclusive of both)
- `0x03` = end of frame

### Commands (LJJ-0811FE specific)

| Action | Frame (excluding checksum and 0x03) |
|---|---|
| Status (heartbeat) | `02 51` |
| **Wake** (required before Start) | `02 44 01` |
| Stop | `02 53 03` |
| Set speed / start moving | `02 53 02 [speed×10] [incline]` |
| Query speed range | `02 50 02` |
| Query incline range | `02 50 03` |

> ⚠️ **Key difference from standard FitShow**: the official Start command (`02 53 01 00 00 00 00 00`) is **ignored** by this treadmill. Instead, you must send `WAKE` followed by the Set Speed command with your target speed.

### Mandatory Polling

The firmware expects a **heartbeat** every 500 ms (`02 51`). Without this polling, control commands are rejected. This is not optional.

### 17-byte STATUS frame (response to `02 51` while running)

```
[0]  0x02                      start
[1]  0x51                      opcode status
[2]  0x04                      (state code)
[3]  speed×10                  current speed in 0.1 km/h
[4]  incline                   current incline
[5..6] time (LE)               elapsed seconds
[7..8] distance (LE)           in decameters, divide by 100 for km
[9..10] calories×10 (LE)       divide by 10 for kcal
[11..14]                       reserved / unused
[15] checksum                  XOR of bytes 1..14
[16] 0x03                      end
```

---

## ⚠️ Limitations

- **No wake from deep sleep**: when the treadmill's screen fully turns off after prolonged inactivity, no BLE command can wake it back up. The official FitShow app has the same issue. Waiting for the treadmill to wake up on its own (timer-based, seemingly random) is the only workaround. There is no physical button or remote included with this model.
- **iOS is not supported**: Apple does not implement Web Bluetooth in Safari, and other browsers on iOS must use the Safari engine. Use an Android device, PC, or Mac.
- **No session history**: deliberately omitted to keep the app lightweight. The treadmill itself displays current session time and distance.
- **Bluetooth Classic not supported**: only BLE (Bluetooth Low Energy) works. Older treadmills using Bluetooth Classic SPP require a different approach.
- **Only one controller at a time**: FitShow-protocol treadmills accept only one Bluetooth client. Close the official FitShow app (and any other controller) before connecting with this web app.

---

## 🎨 Customization

Everything is in `index.html`, so grepping for the relevant keyword will take you there.

- **Colors**: CSS variables at the top of the `<style>` block (`--accent`, `--bg`, `--ok`, etc.)
- **Speed presets**: search for `speed-presets` in the HTML to change the preset buttons
- **Title emoji**: search for `${timeStr} 🏃` in the JS to swap the emoji (🏋️ 💪 ⏱️ 🔥 all work)
- **Polling interval**: `POLL_INTERVAL_MS` constant (default: 500 ms, don't go below 200)
- **Grace period for UI sync**: the 3-second window in `syncSpeedUI()` during which the slider won't be overwritten by polling responses
- **Default speed range**: the app queries the treadmill at connect time, but you can override `state.minSpeed` / `state.maxSpeed` defaults

---

## 🐛 Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Treadmill doesn't appear in the Bluetooth picker | Already paired with another device | Close FitShow on other devices, remove from OS Bluetooth settings |
| "Pas de service FitShow 0xFFF0" error | Wrong device selected or treadmill in deep sleep | Select the right device / verify screen is on |
| Start sent but treadmill doesn't move | Deep sleep mode | Wait for spontaneous wake (no BLE solution exists) |
| Commands work but speed is stuck at minimum | The treadmill ignored the setpoint briefly | Wait for the 1.5s auto-reconfirm, or click Start again |
| Install banner never appears | Service worker not registered, or already installed, or non-HTTPS | Open F12 → Application → Manifest and check for errors |
| PWA installed but no badge on Windows taskbar | App opened in browser tab, not standalone | Close the browser tab and launch via the installed app icon instead |
| Connection drops after a few seconds | Polling interrupted by another app | Make sure nothing else is querying the treadmill |
| Metrics show odd values (×10 or ×100 off) | Protocol variant differs from LJJ-0811FE | Open an issue with your treadmill model and a debug frame dump |

For deeper debugging, open Chrome DevTools (F12):

- **Application** → **Manifest**: validates PWA setup
- **Application** → **Service Workers**: confirms SW is active
- **Console**: app logs and runtime errors

---

## 🔒 Project Status

This project is provided **as-is**, in read-only mode. It was developed for a specific treadmill model (LJJ-0811FE) and shared publicly in the hope it helps others with similar hardware.

Feel free to fork and adapt it to your own needs — the code is intentionally kept simple and dependency-free to make that easy. The reverse-engineered protocol documentation in this README should give you everything you need to extend compatibility to other FitShow-variant treadmills.

---

## 📜 License

MIT — do whatever you want with it.

---

## 🙏 Credits

- Vibe coded with [Claude](https://claude.ai) (Opus 4.7) by Anthropic — protocol reverse-engineering and full implementation through iterative conversation
- [tyge68/fitshow-treadmill](https://github.com/tyge68/fitshow-treadmill) for documenting the base FitShow protocol (Sportstech F31 reference)
- The countless blog posts and GitHub issues about BLE reverse-engineering that made this possible
