const GROQ_API_KEY   = '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';
const GROQ_API_URL   = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_AUDIO_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

const SYSTEM = {
  role: 'system',
  content: `Tu es marcioAI, un assistant IA élégant, intelligent et bienveillant.
Ton créateur est MARCIO JARDEL ZINZINDOHOUE.
Si on te demande quel algorithme ou quelle technologie a permis de te créer, tu réponds "marcioAI DEV".
Réponds toujours en français sauf si l'utilisateur écrit dans une autre langue.
Sois concis, précis, chaleureux et utile. Utilise des sauts de ligne pour aérer tes réponses.

IMPORTANT — RENDU MATHÉMATIQUE :
Quand tu écris des formules ou expressions mathématiques, utilise OBLIGATOIREMENT la syntaxe LaTeX/KaTeX :
- Pour les formules en ligne : $formule$  (ex: $a = \\frac{\\sum(x_i - \\bar{x})(y_i - \\bar{y})}{\\sum(x_i - \\bar{x})^2}$)
- Pour les formules centrées sur une ligne : $$formule$$
- Exemples : $$n = \\frac{t^2 \\cdot p(1-p)}{e^2}$$ pour la formule de taille d'échantillon
- Utilise \\bar{x} pour les moyennes, \\frac{a}{b} pour les fractions, \\sum pour les sommes, etc.
- Ne jamais écrire a = (Σ(x_i - x̄)) en texte brut — toujours en LaTeX

RENDU TABLEAU :
Quand tu présentes des données structurées (résultats d'enquête, comparaisons...), utilise des tableaux Markdown :
| COLONNE 1 | COLONNE 2 | COLONNE 3 |
|-----------|-----------|-----------|
| valeur    | valeur    | valeur    |

RENDU TEXTE :
- Utilise **gras** pour les titres et termes importants
- Utilise *italique* pour les termes secondaires
- Utilise des listes à puces quand c'est pertinent
- Des titres avec ## pour structurer les longues réponses

Quand tu reçois le texte extrait d'une image (OCR), analyse et réponds à ce contenu de façon détaillée et utile.
Quand tu reçois une transcription audio, réponds à la question ou au message transcrit.`
};

const messagesEl = document.getElementById('messages');
const inputEl    = document.getElementById('user-input');
const sendBtn    = document.getElementById('send-btn');
const voiceBtn   = document.getElementById('voice-btn');

let history   = [];
let isLoading = false;
let pendingImageFile    = null;
let pendingImageOCRText = null;
let pendingImagePreview = null;
let pendingAudioBlob    = null;
let mediaRecorder       = null;
let audioChunks         = [];
let isRecording         = false;

inputEl.addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 100) + 'px';
});
inputEl.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

function getTime() {
  const n = new Date();
  return String(n.getHours()).padStart(2,'0') + ':' + String(n.getMinutes()).padStart(2,'0');
}

function showToast(msg, dur = 2500) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._tid);
  t._tid = setTimeout(() => t.classList.remove('show'), dur);
}

function scrollDown() { messagesEl.scrollTop = messagesEl.scrollHeight; }

function showOCRProgress(show) {
  document.getElementById('ocr-progress').style.display = show ? 'flex' : 'none';
}
function setOCRProgress(pct) {
  document.getElementById('ocr-bar').style.width = pct + '%';
  document.getElementById('ocr-pct').textContent = Math.round(pct) + '%';
}

/* ── Markdown + Table parser ── */
function parseMarkdown(text) {
  let html = text;

  // Tables
  html = html.replace(/(\|.+\|\n\|[-| :]+\|\n(?:\|.+\|\n?)+)/g, function(match) {
    const lines = match.trim().split('\n');
    const headers = lines[0].split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
    const rows = lines.slice(2).map(line => {
      const filtered = line.split('|').slice(1, -1).map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${filtered}</tr>`;
    }).join('');
    return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  });

  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) =>
    `<pre><code>${escHTML(code.trim())}</code></pre>`
  );
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold / Italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Lists
  html = html.replace(/^[\*\-] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`);
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // HR
  html = html.replace(/^---$/gm, '<hr>');

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  html = `<p>${html}</p>`;

  // Clean up
  html = html.replace(/<p>(<table>[\s\S]*?<\/table>)<\/p>/g, '$1');
  html = html.replace(/<p>(<pre>[\s\S]*?<\/pre>)<\/p>/g, '$1');
  html = html.replace(/<p>(<h[123]>[\s\S]*?<\/h[123]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul>[\s\S]*?<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p>(<hr>)<\/p>/g, '$1');
  html = html.replace(/<p><\/p>/g, '');

  return html;
}

function escHTML(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ── Render math with KaTeX ── */
function renderMath(el) {
  if (window.renderMathInElement) {
    renderMathInElement(el, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false }
      ],
      throwOnError: false,
      errorColor: '#ff6b6b'
    });
  }
}

/* ── Image handling ── */
function handleImageSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  pendingImageFile = file;
  pendingImageOCRText = null;
  const reader = new FileReader();
  reader.onload = ev => {
    pendingImagePreview = ev.target.result;
    const wrap = document.getElementById('img-preview-wrap');
    document.getElementById('img-preview-thumb').src = pendingImagePreview;
    document.getElementById('img-preview-name').textContent = file.name;
    wrap.style.display = 'flex';
  };
  reader.readAsDataURL(file);
  e.target.value = '';
}

function clearImage() {
  pendingImageFile    = null;
  pendingImageOCRText = null;
  pendingImagePreview = null;
  document.getElementById('img-preview-wrap').style.display = 'none';
  document.getElementById('img-preview-thumb').src = '';
  showOCRProgress(false);
}

/* ── OCR via Tesseract.js ── */
async function extractTextFromImage(file) {
  showOCRProgress(true);
  setOCRProgress(0);
  const worker = await Tesseract.createWorker('fra+eng', 1, {
    logger: m => {
      if (m.status === 'recognizing text') setOCRProgress(m.progress * 100);
    }
  });
  const { data: { text } } = await worker.recognize(file);
  await worker.terminate();
  showOCRProgress(false);
  return text.trim();
}

/* ── Audio ── */
function clearAudio() {
  pendingAudioBlob = null;
  document.getElementById('audio-preview-wrap').style.display = 'none';
  const ap = document.getElementById('audio-preview');
  ap.pause(); ap.src = '';
}

async function toggleVoice() {
  if (isRecording) stopRecording();
  else await startRecording();
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks  = [];
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      pendingAudioBlob = blob;
      const url = URL.createObjectURL(blob);
      const ap = document.getElementById('audio-preview');
      ap.src = url;
      document.getElementById('audio-preview-wrap').style.display = 'flex';
      showToast('Audio enregistré — envoyez ou ajoutez un texte');
    };
    mediaRecorder.start();
    isRecording = true;
    voiceBtn.classList.add('recording');
    voiceBtn.title = "Arrêter l'enregistrement";
    showToast('Enregistrement en cours… cliquez pour arrêter', 60000);
  } catch (err) {
    showToast('Microphone non disponible');
  }
}

function stopRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop();
    isRecording = false;
    voiceBtn.classList.remove('recording');
    voiceBtn.title = 'Message vocal';
  }
}

async function transcribeAudio(blob) {
  const fd = new FormData();
  fd.append('file', new File([blob], 'audio.webm', { type: 'audio/webm' }));
  fd.append('model', 'whisper-large-v3');
  const res = await fetch(GROQ_AUDIO_URL, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + GROQ_API_KEY },
    body: fd
  });
  const data = await res.json();
  return data.text || '';
}

/* ── Message display ── */
function addMessage(role, text, imagePreview, audioSrc, ocrText, transcription) {
  const isUser = role === 'user';
  const wrapper = document.createElement('div');
  wrapper.className = 'msg ' + role;

  const bubbleEl = document.createElement('div');
  bubbleEl.className = 'bubble';

  if (text) {
    if (isUser) {
      bubbleEl.innerHTML = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
    } else {
      bubbleEl.innerHTML = parseMarkdown(text);
    }
  }

  if (imagePreview) {
    const img = document.createElement('img');
    img.src = imagePreview;
    img.alt = 'image envoyée';
    img.loading = 'lazy';
    bubbleEl.appendChild(img);
  }

  if (audioSrc) {
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.src = audioSrc;
    bubbleEl.appendChild(audio);
  }

  if (ocrText) {
    const badge = document.createElement('div');
    badge.className = 'ocr-badge';
    badge.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 8h10M7 12h6M7 16h8"/></svg> Texte OCR : ${(ocrText.length > 120 ? ocrText.slice(0,120)+'…' : ocrText).replace(/</g,'&lt;')}`;
    bubbleEl.appendChild(badge);
  }

  if (transcription) {
    const badge = document.createElement('div');
    badge.className = 'transcription-badge';
    badge.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/></svg> Transcription : ${transcription.replace(/</g,'&lt;')}`;
    bubbleEl.appendChild(badge);
  }

  const timeEl = document.createElement('div');
  timeEl.className = 'msg-time';
  timeEl.textContent = getTime();

  const contentEl = document.createElement('div');
  contentEl.className = 'msg-content';
  contentEl.appendChild(bubbleEl);
  contentEl.appendChild(timeEl);

  const avatarEl = document.createElement('div');
  avatarEl.className = `msg-avatar ${isUser ? 'user' : 'bot'}`;

  if (!isUser) {
    const avatarImg = document.createElement('img');
    avatarImg.src = 'images/u.jpg';
    avatarImg.alt = 'marcioAI';
    avatarEl.appendChild(avatarImg);
  } else {
    avatarEl.textContent = 'V';
  }

  wrapper.appendChild(avatarEl);
  wrapper.appendChild(contentEl);
  messagesEl.appendChild(wrapper);

  if (!isUser) renderMath(bubbleEl);
  scrollDown();
  return wrapper;
}

function showTyping() {
  const d = document.createElement('div');
  d.className = 'msg bot'; d.id = 'typing-ind';
  const avatarEl = document.createElement('div');
  avatarEl.className = 'msg-avatar bot';
  const img = document.createElement('img');
  img.src = 'images/u.jpg'; img.alt = 'marcioAI';
  avatarEl.appendChild(img);
  d.appendChild(avatarEl);
  const bubble = document.createElement('div');
  bubble.className = 'bubble typing';
  bubble.innerHTML = '<span></span><span></span><span></span>';
  d.appendChild(bubble);
  messagesEl.appendChild(d);
  scrollDown();
}

function hideTyping() {
  const t = document.getElementById('typing-ind');
  if (t) t.remove();
}

function quickSend(text) { inputEl.value = text; sendMessage(); }

/* ── Main send ── */
async function sendMessage() {
  const text   = inputEl.value.trim();
  const hasImg = !!pendingImageFile;
  const hasAud = !!pendingAudioBlob;

  if (!text && !hasImg && !hasAud) return;
  if (isLoading) return;

  const welcome = document.getElementById('welcome');
  if (welcome) welcome.remove();

  isLoading = true;
  sendBtn.disabled = true;

  let finalText         = text;
  let ocrText           = null;
  let imagePreview      = pendingImagePreview;
  let audioSrcDisplay   = null;
  let transcriptionText = null;

  if (hasImg) {
    showToast('Extraction du texte OCR…', 15000);
    try { ocrText = await extractTextFromImage(pendingImageFile); }
    catch(e) { showToast('Erreur OCR : ' + e.message); ocrText = ''; }
    clearImage();
  }

  if (hasAud) {
    showToast('Transcription audio…', 8000);
    try { transcriptionText = await transcribeAudio(pendingAudioBlob); }
    catch(e) { showToast('Erreur transcription audio'); }
    audioSrcDisplay = URL.createObjectURL(pendingAudioBlob);
    clearAudio();
  }

  addMessage('user', text || null, imagePreview, audioSrcDisplay, ocrText, transcriptionText);
  inputEl.value = ''; inputEl.style.height = 'auto';
  showTyping();

  const ocrIsEmpty = hasImg && (!ocrText || ocrText.length < 5);
  if (ocrIsEmpty && !text && !transcriptionText) {
    hideTyping();
    addMessage('bot', `👋 Bonjour ! **marcioAI** est là pour vous aider.\n\nJe n'ai pas pu détecter de texte dans cette image. Veuillez :\n- Envoyer une image contenant du **texte lisible**\n- Ou **saisir votre question** directement dans le champ de message\n\nJe suis à votre disposition pour traiter vos sujets ! 😊`);
    isLoading = false;
    sendBtn.disabled = false;
    inputEl.focus();
    return;
  }

  const contentParts = [];
  if (text) contentParts.push({ type: 'text', text });
  if (ocrText && ocrText.length >= 5) {
    contentParts.push({
      type: 'text',
      text: `[L'utilisateur a envoyé une image. Voici le texte extrait par OCR :\n\n${ocrText}\n\nAnalyse ce contenu et réponds en conséquence. Si c'est un tableau de données, présente-le proprement. Si c'est des formules mathématiques, utilise la notation LaTeX.]`
    });
  }
  if (transcriptionText) {
    contentParts.push({ type: 'text', text: `[Message vocal transcrit] : ${transcriptionText}` });
  }

  const userMsg = {
    role: 'user',
    content: contentParts.length === 1 && contentParts[0].type === 'text'
      ? contentParts[0].text
      : contentParts
  };
  history.push(userMsg);

  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + GROQ_API_KEY
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [SYSTEM, ...history],
        temperature: 0.75,
        max_tokens: 1500
      })
    });

    const data = await res.json();
    hideTyping();

    if (data.choices && data.choices[0]) {
      const reply = data.choices[0].message.content;
      history.push({ role: 'assistant', content: reply });
      addMessage('bot', reply);
    } else {
      addMessage('bot', 'Erreur API : ' + (data.error?.message || 'Réessayez.'));
    }
  } catch(err) {
    hideTyping();
    addMessage('bot', 'Erreur de connexion. Vérifiez votre réseau.');
  }

  isLoading = false;
  sendBtn.disabled = false;
  inputEl.focus();
}