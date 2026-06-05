/**
 * stronghold-toast.js
 * A medieval-themed toast notification web component with i18n audio feedback.
 */

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none; /* Let clicks pass through if needed */
    }
    
    .toast {
      background-color: #f4e4bc; /* Parchment color */
      border: 3px solid #5c3a21; /* Dark wood/leather color */
      border-radius: 4px;
      padding: 15px 25px;
      margin-top: 10px;
      box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.5);
      font-family: 'Times New Roman', serif;
      color: #3e2723;
      display: flex;
      align-items: center;
      gap: 15px;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.4s ease, transform 0.4s ease;
    }

    .toast.show {
      opacity: 1;
      transform: translateY(0);
    }

    /* Type-specific styling indicators */
    .toast.success { border-left-width: 10px; border-left-color: #2e7d32; }
    .toast.warning { border-left-width: 10px; border-left-color: #f57f17; }
    .toast.error { border-left-width: 10px; border-left-color: #c62828; }

    .message {
      font-weight: bold;
      font-size: 1.1rem;
    }
  </style>
  <div class="toast" id="toast-container">
    <span class="message" id="message-text"></span>
  </div>
`;

class StrongholdToast extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // Start with an empty map. It will be populated dynamically.
    this.audioMap = {};
  }

  static get observedAttributes() {
    return ["type", "lang", "message", "duration", "sound-key", "registry"];
  }

  // Make the lifecycle callback async so we can wait for the JSON to load
  async connectedCallback() {
    this.render();
    await this.loadAudioConfig(); // Wait for the registry to load
    this.playSound();
    this.showToast();
  }

  // Update the fetch method to use the user-provided registry path
  async loadAudioConfig() {
    // If the developer doesn't provide a registry path, fallback to a default root path
    const registryPath = this.getAttribute("registry") || "/sounds.json";

    try {
      const response = await fetch(registryPath);
      if (!response.ok) throw new Error("Registry not found");
      this.audioMap = await response.json();
    } catch (error) {
      console.warn(
        `🏰 Stronghold Toast: Audio disabled. Provide a valid sounds.json via the 'registry' attribute. Looked for: ${registryPath}`,
      );
      // Component still works visually, just gracefully degrades by not playing sound
    }
  }

  render() {
    const container = this.shadowRoot.getElementById("toast-container");
    const messageEl = this.shadowRoot.getElementById("message-text");

    const type = this.getAttribute("type") || "warning";
    const message = this.getAttribute("message") || "Message from the scribe";

    container.className = `toast ${type}`; // Reset and apply current type
    messageEl.textContent = message;
  }

  playSound() {
    const lang = this.getAttribute("lang") || "en";

    // Check if a specific sound key was requested, otherwise default to the type
    const soundKey =
      this.getAttribute("sound-key") || this.getAttribute("type") || "warning";

    // Safely traverse the loaded JSON map
    const audioPath = this.audioMap[lang]?.[soundKey];

    if (audioPath) {
      const audio = new Audio(audioPath);
      // Volume control is a nice professional touch for loud .wav files!
      audio.volume = 0.5;
      audio
        .play()
        .catch((err) => console.warn("Audio playback prevented:", err));
    } else {
      console.warn(
        `🏰 Stronghold Toast: No audio found for lang '${lang}' and key '${soundKey}'`,
      );
    }
  }

  showToast() {
    const container = this.shadowRoot.getElementById("toast-container");
    const duration = parseInt(this.getAttribute("duration")) || 4000;

    requestAnimationFrame(() => {
      container.classList.add("show");
    });

    setTimeout(() => {
      container.classList.remove("show");
      setTimeout(() => this.remove(), 400);
    }, duration);
  }
}

customElements.define("stronghold-toast", StrongholdToast);
