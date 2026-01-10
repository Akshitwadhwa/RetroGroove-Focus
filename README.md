# 🎵 Vinyl Focus

<div align="center">
  <h3>A Retro-Themed Focus Timer & Lofi Player</h3>
  <p>Find your flow with analog aesthetics and digital productivity.</p>
</div>

---

## ✨ Overview

**Vinyl Focus** is a beautifully crafted web application designed to help you get into the zone. Combining the tactile nostalgia of a vinyl record player with a functional Pomodoro timer, it provides the perfect atmosphere for deep work or study sessions.

Powered by the **Audius** decentralized music network, you have access to an endless library of lofi, jazz, and focus beats without any ads or interruptions.

## 🚀 Features

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

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/vinyl-focus.git
   cd vinyl-focus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal).

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
