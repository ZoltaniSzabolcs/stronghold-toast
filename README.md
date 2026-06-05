# 🏰 Stronghold Toast

[![npm version](https://img.shields.io/npm/v/stronghold-toast.svg)](https://www.npmjs.com/package/stronghold-toast)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A framework-agnostic, medieval-themed toast notification Web Component. Bring the tactile, auditory feedback of classic RTS games into your modern web applications. 

![Stronghold Toast Demo](https://github.com/user-attachments/assets/d194783e-3cfd-490d-b46a-675a048156d8)

<img width="845" height="909" alt="Image" src="https://github.com/user-attachments/assets/e7bdc595-ea9d-4617-b007-335e90afbace" />


## ✨ Features

* **Native Web Component:** Built with Vanilla JS and Shadow DOM. No dependencies required. Framework-agnostic (works with React, Vue, Angular, or plain HTML).
* **i18n Ready:** Built-in support for multiple languages (English and Hungarian).
* **Semantic Styling:** Automatically styles toasts for `success`, `warning`, and `error` events with a beautiful parchment-and-wood aesthetic.
* **Bring Your Own Assets (BYOA):** A legally compliant architecture that allows developers to map their own custom audio files to specific notification events.
* **Robust Asset Pipeline:** Includes Node.js scripts for bulk audio conversion, validation, and automated JSON registry generation.

---

## ⚖️ Legal & Audio Setup (Bring Your Own Assets)

**Important:** To strictly adhere to copyright laws, the proprietary audio files from *Stronghold Crusader* (Firefly Studios) are **not included** in this npm package or GitHub repository. 

To experience the authentic audio feedback, you must supply your own legally obtained audio files. This project uses a "Bring Your Own Assets" (BYOA) architecture, allowing you to seamlessly map your own sounds to the component.

### Step-by-Step Audio Integration

**1. Obtain the Assets**
Extract the audio files from your legally owned copy of *Stronghold Crusader*, or download royalty-free medieval sound effects (e.g., from Pixabay or FreeSound).

**2. Place in your Public Directory**
Move the audio files into the public static folder of your web application (e.g., `public/assets/sounds/` for Next.js, Vite, or standard HTML setups).

**3. Create the Registry (`sounds.json`)**
The component requires a JSON registry to map language codes and semantic triggers to your file paths. Create a `sounds.json` file in your public directory. 

*Manual Example:*
```json
{
  "en": {
    "success": "/assets/sounds/en/popularity_rising.mp3",
    "warning": "/assets/sounds/en/need_wood.mp3",
    "error": "/assets/sounds/en/under_attack.mp3"
  }
}

```

*Automated Example (Recommended):*
If you have cloned this repository from GitHub, you can use the included Node.js asset pipeline to automatically generate this registry!

1. Drop your audio folders into `raw_audio_files/`.
2. Run `npm run build:assets`.
3. The pipeline will automatically convert legacy `.wav` files to `.mp3`, validate language parity, and generate a perfectly mapped `sounds.json` file for you.

**4. Connect the Component**
Pass the URL path of your newly created JSON registry to the component via the `registry` attribute.

```html
<stronghold-toast 
    registry="/assets/sounds.json" 
    type="success" 
    message="The granary is full, Sire.">
</stronghold-toast>

```

*(Note: If the `registry` attribute is omitted, or if the audio files fail to load, the component is designed to gracefully degrade. It will continue to display beautiful visual notifications in silent mode without throwing breaking console errors).*


---

## 🚀 Installation

Install via npm:

```bash
npm install stronghold-toast

```

Or import it directly via CDN in your HTML:

```html
<script type="module" src="https://unpkg.com/stronghold-toast/dist/stronghold-toast.js"></script>

```

---

## 🛠️ Usage

### 1. Basic HTML Usage

Once imported, you can use the `<stronghold-toast>` tag anywhere in your HTML.

```html
<stronghold-toast 
    registry="/assets/sounds.json" 
    type="warning" 
    lang="en" 
    message="Not enough wood, m'lord!">
</stronghold-toast>

<stronghold-toast 
    registry="/assets/sounds.json" 
    type="success" 
    lang="hu" 
    sound-key="pop_popularity2" 
    message="A nép szeret téged, uram!">
</stronghold-toast>

```

### 2. Programmatic Usage (JavaScript)

For dynamic web applications, you can spawn toasts via JavaScript:

```javascript
import 'stronghold-toast';

function dispatchCourier(message, type = 'warning') {
    const toast = document.createElement('stronghold-toast');
    
    toast.setAttribute('registry', '/assets/sounds.json');
    toast.setAttribute('type', type);
    toast.setAttribute('message', message);
    toast.setAttribute('duration', '5000'); // 5 seconds
    
    document.body.appendChild(toast);
}

dispatchCourier('The granary is empty, Sire.', 'error');

```

---

## 🎛️ Component API

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `registry` | String | `/sounds.json` | The URL path to your `sounds.json` configuration file. |
| `type` | String | `warning` | Sets the visual style. Accepts: `success`, `warning`, `error`. |
| `message` | String | `Message from scribe` | The text content displayed on the parchment toast. |
| `lang` | String | `en` | Language code to select the correct audio localization from the registry. |
| `duration` | Number | `4000` | Milliseconds before the toast auto-dismisses. |
| `sound-key` | String | Falls back to `type` | Overrides standard semantic sounds with a specific key from your registry. |

---

## ⚙️ Configuration (`sounds.json`)

Your audio registry must be a JSON object mapping language codes to sound keys, which then point to the relative paths of your audio files.

```json
{
  "en": {
    "success": "./assets/sounds/en/success.mp3",
    "warning": "./assets/sounds/en/warning.mp3",
    "error": "./assets/sounds/en/error.mp3",
    "treasury_empty": "./assets/sounds/en/treasury_empty.mp3"
  },
  "hu": {
    "success": "./assets/sounds/hu/success.mp3",
    "warning": "./assets/sounds/hu/warning.mp3",
    "error": "./assets/sounds/hu/error.mp3",
    "treasury_empty": "./assets/sounds/hu/treasury_empty.mp3"
  }
}

```

---

## 📦 Developer Asset Pipeline

If you are cloning this repository to contribute or build your own version, this project includes a robust Node.js asset pipeline.

Place your raw `.wav` or `.mp3` files in `raw_audio_files/` and run:

```bash
npm run build:assets

```

This single command will:

1. `import-audio.js`: Recursively copy all nested audio files to the `src/` directory.
2. `convert-audio.js`: Optimize and convert any legacy `.wav` codecs into web-ready `.mp3` files via FFmpeg.
3. `validate-assets.js`: Audit the folders to ensure perfect 1:1 file parity across all language localizations.
4. `generate-registry.js`: Dynamically generate the `sounds.json` routing map with semantic aliases.

---

## 📄 License

MIT © Zoltáni Szabolcs