/**
 * StudyMind AI – app.js
 * Handles: mode switching, API calls, markdown rendering,
 * chat history, API key persistence, auto-resize textarea.
 */

// ─── State ────────────────────────────────────────────────────────────────────
let currentMode = 'explain';   // active study mode
let isLoading   = false;        // prevents double-sends
let chatHistory = [];           // stores {role, content} for context window

// ─── Mode Configurations ──────────────────────────────────────────────────────
// Each mode has: a UI title/desc + a system prompt injected into the API
const MODES = {
  explain: {
    title: 'Explain Concepts',
    desc:  'Ask me anything – I\'ll break it down clearly',
    system: `You are StudyMind AI, an expert tutor. Your job is to explain concepts clearly.
- Use simple language first, then add depth
- Use analogies and real-world examples
- Structure answers with headings and bullet points when helpful
- End with a quick "Key Takeaway" summary
- Be encouraging and positive`,
    placeholder: 'What concept would you like explained?',
    chips: [
      ["Explain photosynthesis like I'm 15", 'Photosynthesis'],
      ['What is the Pythagorean theorem?', 'Pythagorean theorem'],
      ['How does the human immune system work?', 'Immune system'],
      ['What caused World War 1?', 'WWI causes']
    ]
  },
  quiz: {
    title: 'Quiz Me',
    desc:  'Test your knowledge with instant feedback',
    system: `You are StudyMind AI in Quiz Mode.
- Generate 3–5 multiple-choice or short-answer questions on the given topic
- Label each question clearly (Q1, Q2, etc.)
- After presenting questions, wait for the user's answers
- If the user sends answers, provide detailed feedback on each one
- Give a final score and encouragement`,
    placeholder: 'What topic should I quiz you on? (e.g. "World War 2", "Python basics")',
    chips: [
      ['Quiz me on the solar system', 'Solar system quiz'],
      ['Test my knowledge of Python basics', 'Python quiz'],
      ['Quiz me on human anatomy', 'Anatomy quiz'],
      ['Quiz me on French Revolution', 'French Revolution quiz']
    ]
  },
  summarize: {
    title: 'Summarize',
    desc:  'Paste any text and get a crisp summary',
    system: `You are StudyMind AI in Summarize Mode.
- Provide a concise summary of the text (3–5 key points as bullets)
- Then give a one-paragraph "TL;DR" overview
- Highlight the most important terms in **bold**
- If it's a complex topic, add a "Why It Matters" section`,
    placeholder: 'Paste the text you want summarized here…',
    chips: [
      ['Summarize the theory of evolution', 'Evolution summary'],
      ['Summarize how the internet works', 'Internet summary'],
      ['Summarize the causes of climate change', 'Climate change'],
      ['Summarize the French Revolution', 'French Revolution']
    ]
  },
  flashcard: {
    title: 'Flashcards',
    desc:  'Generate study flashcards on any topic',
    system: `You are StudyMind AI in Flashcard Mode.
- Generate 5–8 flashcards on the given topic
- Format each card as:
  **Card N:**
  **Q:** [Question]
  **A:** [Answer]
- Keep answers concise but complete (2–3 sentences max)
- Cover key terms, definitions, and important facts`,
    placeholder: 'What topic should I make flashcards for?',
    chips: [
      ['Flashcards for the periodic table', 'Periodic table'],
      ['Flashcards for Python data types', 'Python flashcards'],
      ['Flashcards for World War 2 dates', 'WW2 flashcards'],
      ['Flashcards for calculus terms', 'Calculus flashcards']
    ]
  },
  mindmap: {
    title: 'Mind Map',
    desc:  'Get a structured text mind map for any topic',
    system: `You are StudyMind AI in Mind Map Mode.
- Create a structured text-based mind map for the topic
- Use indented hierarchy to show relationships
- Format: Central Topic → Main branches → Sub-branches
- Use emojis for visual appeal on main branches
- Keep it clear and organized, suitable for note-taking`,
    placeholder: 'What topic should I create a mind map for?',
    chips: [
      ['Mind map: Machine Learning', 'ML mind map'],
      ['Mind map: World History timeline', 'History mind map'],
      ['Mind map: Human body systems', 'Body systems'],
      ['Mind map: Programming concepts', 'Programming map']
    ]
  },
  essay: {
    title: 'Essay Help',
    desc:  'Get outlines, feedback, and writing guidance',
    system: `You are StudyMind AI in Essay Help Mode.
- Help students plan, structure, and improve their essays
- If given a topic: provide a detailed outline with intro, body paragraphs, and conclusion
- If given a draft: give constructive feedback on structure, arguments, and clarity
- Suggest strong thesis statements and supporting evidence
- Always encourage and be constructive, never harsh`,
    placeholder: 'Share an essay topic or paste your draft for feedback…',
    chips: [
      ['Outline an essay on climate change', 'Climate change essay'],
      ['Help me write about the impacts of social media', 'Social media essay'],
      ['Essay outline: Should AI replace teachers?', 'AI in education'],
      ['Outline: Benefits of renewable energy', 'Renewable energy']
    ]
  }
};

// ─── Initialise ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Restore saved API key from localStorage
  const savedKey = localStorage.getItem('studymind_api_key');
  if (savedKey) document.getElementById('apiKeyInput').value = savedKey;
});

// ─── Save API key to localStorage ─────────────────────────────────────────────
function saveKey() {
  const key = document.getElementById('apiKeyInput').value.trim();
  if (key) localStorage.setItem('studymind_api_key', key);
}

// ─── Switch study mode ────────────────────────────────────────────────────────
function setMode(btn) {
  // Update active button style
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Update current mode
  currentMode = btn.dataset.mode;
  const cfg = MODES[currentMode];

  // Update topbar text
  document.getElementById('modeTitle').textContent = cfg.title;
  document.getElementById('modeDesc').textContent  = cfg.desc;

  // Update placeholder
  document.getElementById('userInput').placeholder = cfg.placeholder;

  // Update quick chips
  const chipsRow = document.getElementById('chipsRow');
  chipsRow.innerHTML = '';
  cfg.chips.forEach(([prompt, label]) => {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.textContent = label;
    btn.onclick = () => fillPrompt(prompt);
    chipsRow.appendChild(btn);
  });

  // Clear chat and show fresh welcome
  clearChat();
}

// ─── Fill input with a suggestion prompt ─────────────────────────────────────
function fillPrompt(text) {
  const input = document.getElementById('userInput');
  input.value = text;
  autoResize(input);
  input.focus();
}

// ─── Clear chat history ───────────────────────────────────────────────────────
function clearChat() {
  chatHistory = [];
  const area = document.getElementById('chatArea');
  area.innerHTML = `
    <div class="welcome" id="welcomeMsg">
      <div class="welcome-emoji">🎓</div>
      <h2 class="welcome-title">Ready to Study?</h2>
      <p class="welcome-sub">Choose a mode on the left, enter your API key, and start learning. Ask anything!</p>
    </div>`;
}

// ─── Handle Enter/Shift+Enter in textarea ────────────────────────────────────
function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

// ─── Auto-resize textarea to fit content ─────────────────────────────────────
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 160) + 'px';
}

// ─── Main: send message to Claude API ────────────────────────────────────────
async function sendMessage() {
  if (isLoading) return;

  const input  = document.getElementById('userInput');
  const apiKey = document.getElementById('apiKeyInput').value.trim();
  const text   = input.value.trim();

  // Validate inputs
  if (!text) return;
  if (!apiKey) {
    showError('⚠️ Please enter your Anthropic API key in the sidebar first. Get one free at console.anthropic.com');
    return;
  }

  // Hide welcome screen on first message
  const welcome = document.getElementById('welcomeMsg');
  if (welcome) welcome.remove();

  // Add user message to UI + history
  addMessage('user', text);
  chatHistory.push({ role: 'user', content: text });

  // Clear input
  input.value = '';
  autoResize(input);

  // Show loading indicator
  isLoading = true;
  toggleSendButton(true);
  const typingId = showTyping();

  try {
    // ── Call Anthropic API ──────────────────────────────────────────────────
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
        // Note: Browser CORS requires a proxy in real production;
        // for local dev this works when served from a local server
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system:     MODES[currentMode].system,
        messages:   chatHistory   // send full history for context
      })
    });

    const data = await response.json();

    // Handle API errors gracefully
    if (!response.ok) {
      const errMsg = data?.error?.message || `API Error ${response.status}`;
      throw new Error(errMsg);
    }

    // Extract assistant reply
    const reply = data.content?.[0]?.text || 'Sorry, I received an empty response.';

    // Remove typing indicator
    removeTyping(typingId);

    // Add AI response to UI + history
    addMessage('ai', reply);
    chatHistory.push({ role: 'assistant', content: reply });

    // Keep history manageable (last 10 turns = 20 messages)
    if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);

  } catch (err) {
    removeTyping(typingId);

    // User-friendly error messages
    let msg = err.message;
    if (msg.includes('401') || msg.includes('authentication')) {
      msg = 'Invalid API key. Please check your key and try again.';
    } else if (msg.includes('429')) {
      msg = 'Rate limit reached. Please wait a moment and try again.';
    } else if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      msg = 'Network error. Make sure you\'re running this on a local server (not file://) and your internet is connected.';
    }

    showError('❌ ' + msg);
  } finally {
    isLoading = false;
    toggleSendButton(false);
  }
}

// ─── Add a message bubble to the chat area ───────────────────────────────────
function addMessage(role, text) {
  const area    = document.getElementById('chatArea');
  const wrapper = document.createElement('div');
  wrapper.className = `message ${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = role === 'user' ? 'U' : 'AI';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  // Render markdown for AI, plain text for user
  bubble.innerHTML = role === 'ai' ? renderMarkdown(text) : escapeHtml(text);

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  area.appendChild(wrapper);

  // Scroll to bottom
  area.scrollTop = area.scrollHeight;
}

// ─── Show typing animation ────────────────────────────────────────────────────
function showTyping() {
  const area    = document.getElementById('chatArea');
  const id      = 'typing-' + Date.now();
  const wrapper = document.createElement('div');
  wrapper.className = 'message ai';
  wrapper.id = id;
  wrapper.innerHTML = `
    <div class="avatar">AI</div>
    <div class="bubble">
      <div class="typing-dots"><span></span><span></span><span></span></div>
    </div>`;
  area.appendChild(wrapper);
  area.scrollTop = area.scrollHeight;
  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// ─── Show an error message in chat ───────────────────────────────────────────
function showError(msg) {
  const area = document.getElementById('chatArea');
  const div  = document.createElement('div');
  div.className = 'error-msg';
  div.textContent = msg;
  area.appendChild(div);
  area.scrollTop = area.scrollHeight;
}

// ─── Toggle send button state ─────────────────────────────────────────────────
function toggleSendButton(loading) {
  const btn = document.getElementById('sendBtn');
  btn.disabled = loading;
}

// ─── Escape HTML to prevent XSS in user messages ────────────────────────────
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

// ─── Simple Markdown → HTML renderer ─────────────────────────────────────────
// Handles: headings, bold, italic, inline code, code blocks,
//          ordered/unordered lists, blockquotes, horizontal rules.
function renderMarkdown(text) {
  let html = text;

  // Escape HTML entities first (protect raw angle brackets)
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks (``` ... ```)
  html = html.replace(/```[\w]*\n?([\s\S]*?)```/g, (_, code) =>
    `<pre><code>${code.trim()}</code></pre>`);

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm,  '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm,   '<h1>$1</h1>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr>');

  // Bold (**text**)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic (*text*)
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Blockquotes (> text)
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

  // Unordered lists (- item or * item)
  html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

  // Ordered lists (1. item)
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Paragraphs (double newline)
  html = html.replace(/\n\n/g, '</p><p>');
  html = `<p>${html}</p>`;

  // Single newline → <br> (inside paragraphs)
  html = html.replace(/\n/g, '<br>');

  // Clean up empty <p> tags
  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
}
