# 🎓 StudyMind AI – Intelligent Study Assistant

> An AI-powered study companion built with HTML, CSS & JavaScript — powered by the Anthropic Claude API. Ask questions, get quizzes, generate flashcards, summarize notes, and more.

![StudyMind AI Preview](screenshots/preview.png)

---

## ✨ Features

| Feature | Description |
|---|---|
| 💡 **Explain Concepts** | Get clear, structured explanations with examples and analogies |
| 🎯 **Quiz Mode** | Generate multiple-choice quizzes on any topic with instant feedback |
| 📋 **Summarize** | Paste any text and get bullet-point summaries + TL;DR |
| 🃏 **Flashcards** | Auto-generate Q&A flashcards for any subject |
| 🧠 **Mind Map** | Get structured, hierarchical mind maps for complex topics |
| ✍️ **Essay Help** | Outlines, feedback, and writing guidance for essays |
| 💬 **Chat History** | Maintains conversation context for follow-up questions |
| 🔑 **Saved API Key** | Securely saves your key in localStorage |
| 📱 **Responsive** | Works on desktop, tablet, and mobile |

---

## 📸 Screenshots

| Main Interface | Quiz Mode |
|---|---|
| ![Main](screenshots/main.png) | ![Quiz](screenshots/quiz.png) |

> To add screenshots: run the app, take a screenshot, and save it in a `/screenshots` folder.

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, Safari)
- A free Anthropic API key → [console.anthropic.com](https://console.anthropic.com)
- A local web server (see below — required for API calls)

### Option 1: VS Code Live Server (Easiest)
1. Install [VS Code](https://code.visualstudio.com/)
2. Install the **Live Server** extension
3. Open the project folder in VS Code
4. Right-click `index.html` → **Open with Live Server**
5. App opens at `http://127.0.0.1:5500`

### Option 2: Python (No install needed)
```bash
# Python 3
python -m http.server 3000

# Then open: http://localhost:3000
```

### Option 3: Node.js
```bash
npx serve .
# Then open the URL shown in terminal
```

> ⚠️ **Important:** You must use a local server (not `file://`) for the API calls to work properly.

---

## 🔑 API Key Setup (Free — No Credit Card)

1. Visit [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **Create API Key** and copy it
4. Paste it into the **sidebar input** in StudyMind AI
5. Your key is saved automatically in your browser

**Free tier limits:** 1,500 requests/day · 1 million tokens/day — more than enough for daily studying!

---

## 📁 Folder Structure

```
ai-study-assistant/
│
├── index.html        # Main HTML – layout and structure
├── style.css         # All styles – dark theme, animations, responsive
├── app.js            # Logic – modes, API calls, markdown rendering
│
├── screenshots/      # Add your own screenshots here
│   └── preview.png
│
└── README.md         # This file
```

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| **HTML5** | Structure and layout |
| **CSS3** | Styling, animations, responsive design |
| **Vanilla JavaScript (ES6+)** | App logic, API calls, DOM manipulation |
| **Google Gemini API** | AI responses (gemini-2.0-flash, free tier) |
| **Google Fonts** | Playfair Display + DM Sans typography |
| **localStorage** | Persist API key between sessions |

---

## 🧩 How It Works

1. User selects a **study mode** (Explain, Quiz, Flashcards, etc.)
2. Each mode has a custom **system prompt** that shapes Claude's responses
3. User message + full chat history sent to `api.anthropic.com/v1/messages`
4. Response rendered with a lightweight **custom Markdown parser**
5. Chat history kept to last 20 messages for context without hitting token limits

---

## 🔮 Future Improvements

- [ ] **Text-to-Speech** – Read answers aloud using Web Speech API
- [ ] **File Upload** – Upload PDFs or `.txt` notes to summarize
- [ ] **Save Sessions** – Export chat history as PDF or Markdown
- [ ] **Progress Tracker** – Track quiz scores over time
- [ ] **Dark/Light Toggle** – Theme switcher
- [ ] **Pomodoro Timer** – Built-in study timer
- [ ] **Subject Tags** – Organize chats by subject
- [ ] **Backend Proxy** – Node.js proxy to keep API key server-side

---

## 🌐 Deployment

### GitHub Pages (Static – no API calls in production without proxy)
```bash
# 1. Push to GitHub (see Git commands below)
# 2. Go to repo Settings → Pages
# 3. Source: main branch / root
# 4. Your site: https://yourusername.github.io/ai-study-assistant
```
> Note: For GitHub Pages you'll need a backend proxy for the API key to stay secure.

### Render (Full deployment with proxy)
1. Create a free account at [render.com](https://render.com)
2. New → **Static Site**
3. Connect your GitHub repo
4. Build Command: *(leave blank)*
5. Publish Directory: `.`
6. Deploy → Get your live URL

---

## 📤 Git Commands to Push to GitHub

```bash
# 1. Initialize git in the project folder
cd ai-study-assistant
git init

# 2. Add all files
git add .

# 3. First commit
git commit -m "🎓 Initial commit – StudyMind AI"

# 4. Create repo on GitHub (github.com → New Repository)
# Name: ai-study-assistant

# 5. Link to your GitHub repo
git remote add origin https://github.com/YOUR_USERNAME/ai-study-assistant.git

# 6. Push
git branch -M main
git push -u origin main
```

---

## ⚖️ License

MIT License – free to use, modify, and distribute.

---

## 🙋 Author

Made with ❤️ for students everywhere.  
If this helped you, give it a ⭐ on GitHub!
