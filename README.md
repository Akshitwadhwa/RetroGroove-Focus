
# 🎵 RetroGroove-Focus

<div align="center">
  <h3>A Retro-Themed Focus Timer & Lofi Player</h3>
  <p>Find your flow with analog aesthetics and digital productivity.</p>
</div>

---

## 🚀 Live Demo

🎉 **RetroGroove-Focus is now live and ready to use!**  
Try it out at: [https://retro-groove-focus.vercel.app]

---

## ✨ Features

- **💿 Interactive Vinyl Player**: A stunning, animated vinyl player that spins when music plays, complete with arm animations.
- **⏱️ Integrated Focus Timer**: Built-in Pomodoro timer to manage your work sessions. Customizable durations.
- **🎧 High-Quality Streaming**: seamless music streaming powered by the Audius API.
- **🌗 Day/Night Modes**: Beautifully themed Light (Matcha) and Dark (Charcoal) modes.
- **📝 Queue Management**: Build your perfect focus playlist with an easy-to-use queue system.
- **🎞️ Retro Aesthetics**: Film grain overlays and smooth Framer Motion animations for a premium feel.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: Tailwind CSS (via class names) & CSS Modules
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Music API**: [Audius](https://audius.co/)
- **Language**: TypeScript

## 🏁 Getting Started

Follow these steps to get the project running locally on your machine.

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**

### Spotify Login Setup

RetroGroove-Focus uses Spotify OAuth (PKCE) on the frontend.

1. Create a Spotify app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Copy your **Client ID**.
3. In your Spotify app settings, add redirect URIs such as:
  - `http://localhost:5173/callback`
  - `https://your-production-domain.com/callback`
4. Create a local env file (for example `.env.local`) and add:

```bash
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
```

Notes:
- A Spotify Client Secret is **not required** for this PKCE flow.
- If `VITE_SPOTIFY_REDIRECT_URI` is omitted, the app defaults to `window.location.origin/callback`.
- For full in-app playback via Spotify Web Playback SDK, a Spotify Premium account is required.

### Run Locally

```bash
npm install
npm run dev
```

Then open the app, go to **Settings**, and click **Connect Spotify**.


## 📂 Project Structure

```
/src
├── components/      # UI Components (Vinyl, Timer, QueueList, etc.)
├── services/        # API integrations (Audius)
├── App.tsx          # Main application logic
├── main.tsx         # Entry point
└── index.css        # Global styles & Tailwind
```

## 🎹 Controls

- **Play/Pause**: Click the center of the vinyl or the timer start button.
- **Search**: Use the top bar to find artists, tracks, or vibes (e.g., "Lofi", "Rain").
- **Queue**: Click the `+` icon on track results to add them to your upcoming queue.
- **Skip**: Use the skip button in the sidebar to jump to the next track.
- **Timer**: Click the loop icon to reset or toggle the timer.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

<div align="center">
  <p><i>Built for focus. Powered by code.</i></p>
</div>
