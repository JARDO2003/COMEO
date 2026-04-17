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

/* ══════════════════════════════════════════════
   DOM REFS
══════════════════════════════════════════════ */
const messagesEl = document.getElementById('messages');
const inputEl    = document.getElementById('user-input');
const sendBtn    = document.getElementById('send-btn');
const voiceBtn   = document.getElementById('voice-btn');

/* ══════════════════════════════════════════════
   STATE
══════════════════════════════════════════════ */
let history             = [];
let isLoading           = false;
let pendingImageFile    = null;
let pendingImageOCRText = null;
let pendingImagePreview = null;
let pendingAudioBlob    = null;
let mediaRecorder       = null;
let audioChunks         = [];
let isRecording         = false;

/* ══════════════════════════════════════════════
   INPUT AUTO-RESIZE
══════════════════════════════════════════════ */
inputEl.addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 100) + 'px';
});
inputEl.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});

/* ══════════════════════════════════════════════
   UTILS
══════════════════════════════════════════════ */
function getTime() {
  const n = new Date();
  return String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0');
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

function escHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ══════════════════════════════════════════════
   MARKDOWN + TABLE PARSER
══════════════════════════════════════════════ */
function parseMarkdown(text) {
  let html = text;

  html = html.replace(/(\|.+\|\n\|[-| :]+\|\n(?:\|.+\|\n?)+)/g, function (match) {
    const lines   = match.trim().split('\n');
    const headers = lines[0].split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
    const rows    = lines.slice(2).map(line => {
      const filtered = line.split('|').slice(1, -1).map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${filtered}</tr>`;
    }).join('');
    return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  });

  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) =>
    `<pre><code>${escHTML(code.trim())}</code></pre>`
  );
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm,  '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm,   '<h1>$1</h1>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g,     '<em>$1</em>');
  html = html.replace(/^[\*\-] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`);
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^---$/gm, '<hr>');
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  html = `<p>${html}</p>`;
  html = html.replace(/<p>(<table>[\s\S]*?<\/table>)<\/p>/g, '$1');
  html = html.replace(/<p>(<pre>[\s\S]*?<\/pre>)<\/p>/g, '$1');
  html = html.replace(/<p>(<h[123]>[\s\S]*?<\/h[123]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul>[\s\S]*?<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p>(<hr>)<\/p>/g, '$1');
  html = html.replace(/<p><\/p>/g, '');

  return html;
}

/* ══════════════════════════════════════════════
   KATEX MATH RENDER
══════════════════════════════════════════════ */
function renderMath(el) {
  if (window.renderMathInElement) {
    renderMathInElement(el, {
      delimiters: [
        { left: '$$', right: '$$', display: true  },
        { left: '$',  right: '$',  display: false },
        { left: '\\[', right: '\\]', display: true  },
        { left: '\\(', right: '\\)', display: false }
      ],
      throwOnError: false,
      errorColor: '#ff6b6b'
    });
  }
}

/* ══════════════════════════════════════════════════════════════════
   ██  IMAGE PIPELINE ULTRA-AVANCÉ  ██
   Détection HEIC/HEIF → Orientation EXIF → Redimensionnement
   → Compression adaptative → Fallback multi-niveau
   Entièrement invisible pour l'utilisateur
══════════════════════════════════════════════════════════════════ */

/**
 * Lit l'orientation EXIF d'un fichier image (ArrayBuffer).
 * Retourne un entier 1-8 ou 1 par défaut.
 */
function getExifOrientation(buffer) {
  try {
    const view = new DataView(buffer);
    if (view.getUint16(0, false) !== 0xFFD8) return 1;
    let offset = 2;
    while (offset < view.byteLength) {
      const marker = view.getUint16(offset, false);
      offset += 2;
      if (marker === 0xFFE1) {
        if (view.getUint32(offset += 2, false) !== 0x45786966) return 1;
        const little = view.getUint16(offset += 6, false) === 0x4949;
        offset += view.getUint32(offset + 4, little);
        const tags = view.getUint16(offset, little);
        offset += 2;
        for (let i = 0; i < tags; i++) {
          if (view.getUint16(offset + i * 12, little) === 0x0112) {
            return view.getUint16(offset + i * 12 + 8, little);
          }
        }
      } else if ((marker & 0xFF00) !== 0xFF00) break;
      else offset += view.getUint16(offset, false);
    }
  } catch (e) { /* silencieux */ }
  return 1;
}

/**
 * Applique la rotation EXIF sur un canvas context 2D.
 */
function applyExifRotation(ctx, orientation, width, height) {
  switch (orientation) {
    case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
    case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
    case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
    case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
    case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
    case 7: ctx.transform(0, -1, -1, 0, height, width); break;
    case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
    default: break;
  }
}

/**
 * Détecte si un fichier est HEIC/HEIF par signature magic bytes.
 */
async function isHeicFile(file) {
  try {
    const buf  = await file.slice(0, 12).arrayBuffer();
    const view = new Uint8Array(buf);
    // ftyp box: bytes 4-7 = "ftyp", bytes 8-11 = "heic" | "heis" | "hevc" | "mif1"
    const brand = String.fromCharCode(view[8], view[9], view[10], view[11]);
    return ['heic', 'heis', 'hevc', 'mif1', 'msf1'].includes(brand.toLowerCase());
  } catch (e) { return false; }
}

/**
 * Convertit un Blob/File HEIC en JPEG via createImageBitmap (Chrome Android 94+)
 * ou via un <img> src object URL (fallback).
 */
async function heicToJpeg(file, maxPx, quality) {
  // Tenter createImageBitmap (plus robuste, pas besoin de DOM)
  if (typeof createImageBitmap !== 'undefined') {
    try {
      const bitmap = await createImageBitmap(file);
      return await bitmapToJpeg(bitmap, maxPx, quality);
    } catch (e) { /* tenter fallback img */ }
  }
  // Fallback <img>
  return await fileToJpegViaImg(file, maxPx, quality, 1);
}

/**
 * ImageBitmap → JPEG Blob redimensionné.
 */
async function bitmapToJpeg(bitmap, maxPx, quality) {
  let { width: w, height: h } = bitmap;
  const ratio = Math.min(1, maxPx / Math.max(w, h));
  w = Math.round(w * ratio);
  h = Math.round(h * ratio);

  const canvas = document.createElement('canvas');
  canvas.width  = w;
  canvas.height = h;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
  bitmap.close && bitmap.close();

  return await canvasToBlob(canvas, quality);
}

/**
 * File → canvas via <img> element (compatible tous navigateurs).
 * Gère EXIF orientation.
 */
function fileToJpegViaImg(file, maxPx, quality, orientation) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img  = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const swapped = orientation >= 5 && orientation <= 8;
        let srcW = img.naturalWidth  || img.width;
        let srcH = img.naturalHeight || img.height;
        const maxDim = swapped ? Math.max(srcH, srcW) : Math.max(srcW, srcH);
        const ratio  = Math.min(1, maxPx / maxDim);
        let dstW = Math.round(srcW * ratio);
        let dstH = Math.round(srcH * ratio);

        const canvas  = document.createElement('canvas');
        canvas.width  = swapped ? dstH : dstW;
        canvas.height = swapped ? dstW : dstH;

        const ctx = canvas.getContext('2d');
        applyExifRotation(ctx, orientation, dstW, dstH);
        ctx.drawImage(img, 0, 0, dstW, dstH);

        canvasToBlob(canvas, quality).then(resolve).catch(reject);
      } catch (e) { reject(e); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('img load failed')); };
    img.src = url;
  });
}

/**
 * Canvas → Blob JPEG avec fallback toDataURL si toBlob non dispo (vieux Safari).
 */
function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    if (canvas.toBlob) {
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('toBlob null')),
        'image/jpeg',
        quality
      );
    } else {
      // Fallback toDataURL (Safari < 15)
      try {
        const dataURL = canvas.toDataURL('image/jpeg', quality);
        const arr     = dataURL.split(',');
        const mime    = arr[0].match(/:(.*?);/)[1];
        const bstr    = atob(arr[1]);
        const u8      = new Uint8Array(bstr.length);
        for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i);
        resolve(new Blob([u8], { type: mime }));
      } catch (e) { reject(e); }
    }
  });
}

/**
 * Compression adaptative : ajuste la qualité si le blob est encore trop gros.
 * Cible : < 800 Ko pour mobile.
 */
async function adaptiveCompress(file, maxPx, targetBytes = 800 * 1024) {
  let quality  = 0.82;
  let attempts = 0;
  let blob;

  while (attempts < 4) {
    try {
      const orientation = await readExifOrientation(file);
      blob = await fileToJpegViaImg(file, maxPx, quality, orientation);
      if (blob.size <= targetBytes || quality <= 0.45) break;
      quality -= 0.12;
      attempts++;
    } catch (e) { break; }
  }
  return blob;
}

/**
 * Lit l'orientation EXIF depuis un File de façon asynchrone.
 */
async function readExifOrientation(file) {
  try {
    const buf = await file.slice(0, 65536).arrayBuffer();
    return getExifOrientation(buf);
  } catch (e) { return 1; }
}

/**
 * ★ POINT D'ENTRÉE PRINCIPAL ★
 * Pipeline complet : HEIC → orientation → resize → compression adaptative
 * Entièrement silencieux, fallback sur fichier original si tout plante.
 */
async function smartCompress(file) {
  // Limite en pixels selon la RAM estimée du device
  const maxPx = navigator.deviceMemory && navigator.deviceMemory <= 2 ? 800 : 1200;

  try {
    // 1. Fichier HEIC/HEIF (iPhone sans conversion)
    const heic = isHeicFile(file) || ['image/heic', 'image/heif'].includes(file.type.toLowerCase());
    if (heic) {
      const blob = await heicToJpeg(file, maxPx, 0.82);
      if (blob) return new File([blob], 'image.jpg', { type: 'image/jpeg' });
    }

    // 2. createImageBitmap rapide (Chrome/Firefox desktop + Android)
    if (typeof createImageBitmap !== 'undefined' && !isSafari()) {
      try {
        const bitmap = await createImageBitmap(file);
        const blob   = await bitmapToJpeg(bitmap, maxPx, 0.82);
        if (blob && blob.size > 0) {
          // Si encore trop gros → recompresse
          if (blob.size > 800 * 1024) {
            const reBlob = await adaptiveCompress(new File([blob], 'i.jpg', { type: 'image/jpeg' }), maxPx);
            if (reBlob) return new File([reBlob], 'image.jpg', { type: 'image/jpeg' });
          }
          return new File([blob], 'image.jpg', { type: 'image/jpeg' });
        }
      } catch (e) { /* fallback */ }
    }

    // 3. Chemin <img> + EXIF (Safari iOS, Android WebView, vieux navigateurs)
    const blob = await adaptiveCompress(file, maxPx);
    if (blob && blob.size > 0) return new File([blob], 'image.jpg', { type: 'image/jpeg' });

  } catch (e) { /* silencieux */ }

  // 4. Fallback ultime : renvoie le fichier original non modifié
  return file;
}

/**
 * Détecte Safari (y compris iOS) pour éviter createImageBitmap buggé.
 */
function isSafari() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

/* ══════════════════════════════════════════════
   IMAGE HANDLING (UI)
══════════════════════════════════════════════ */
function handleImageSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  // Affiche la preview immédiatement via FileReader (rapide, indépendant de la compression)
  const reader = new FileReader();
  reader.onload = (ev) => {
    pendingImagePreview = ev.target.result;
    document.getElementById('img-preview-thumb').src = pendingImagePreview;
    document.getElementById('img-preview-name').textContent = file.name;
    document.getElementById('img-preview-wrap').style.display = 'flex';
    inputEl.focus();
  };
  reader.readAsDataURL(file);

  // Compression en arrière-plan, totalement invisible
  pendingImageFile = file; // fichier brut en attendant
  smartCompress(file).then((compressed) => {
    pendingImageFile = compressed; // remplace silencieusement par la version compressée
  }).catch(() => {
    pendingImageFile = file; // fallback : original
  });

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

/* ══════════════════════════════════════════════
   OCR via Tesseract.js
══════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════════════════════════
   ██  AUDIO PIPELINE ULTRA-AVANCÉ  ██
   Détection codec automatique + fallback multi-format
   Compatible iOS Safari, Android Chrome, Firefox, desktop
══════════════════════════════════════════════════════════════════ */

/**
 * Retourne le meilleur MIME type supporté par le navigateur courant.
 * Ordre de priorité : mp4 (iOS) → webm opus → webm → ogg
 */
function getBestAudioMime() {
  const candidates = [
    'audio/mp4;codecs=mp4a.40.2',
    'audio/mp4',
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg'
  ];
  if (typeof MediaRecorder === 'undefined') return '';
  for (const mime of candidates) {
    try { if (MediaRecorder.isTypeSupported(mime)) return mime; }
    catch (e) { /* ignore */ }
  }
  return '';
}

/**
 * Extension de fichier selon le MIME type sélectionné.
 */
function mimeToExt(mime) {
  if (mime.includes('mp4'))  return 'mp4';
  if (mime.includes('webm')) return 'webm';
  if (mime.includes('ogg'))  return 'ogg';
  return 'audio';
}

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
    const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = getBestAudioMime();
    audioChunks    = [];

    const options = {};
    if (mimeType) options.mimeType = mimeType;

    mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorder.ondataavailable = e => { if (e.data && e.data.size > 0) audioChunks.push(e.data); };
    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      const actualMime = mediaRecorder.mimeType || mimeType || 'audio/webm';
      const ext  = mimeToExt(actualMime);
      const blob = new Blob(audioChunks, { type: actualMime });
      pendingAudioBlob = blob;
      const url  = URL.createObjectURL(blob);
      const ap   = document.getElementById('audio-preview');
      ap.src     = url;
      document.getElementById('audio-preview-wrap').style.display = 'flex';
      showToast('Audio enregistré — envoyez ou ajoutez un texte');
    };

    mediaRecorder.start(250); // timeslice 250ms pour éviter perte data sur mobile
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
  const actualMime = blob.type || 'audio/webm';
  const ext        = mimeToExt(actualMime);
  const fd         = new FormData();
  fd.append('file', new File([blob], `audio.${ext}`, { type: actualMime }));
  fd.append('model', 'whisper-large-v3');
  const res  = await fetch(GROQ_AUDIO_URL, {
    method:  'POST',
    headers: { 'Authorization': 'Bearer ' + GROQ_API_KEY },
    body:    fd
  });
  const data = await res.json();
  return data.text || '';
}

/* ══════════════════════════════════════════════
   MESSAGE DISPLAY
══════════════════════════════════════════════ */
function addMessage(role, text, imagePreview, audioSrc, ocrText, transcription) {
  const isUser  = role === 'user';
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
    const img   = document.createElement('img');
    img.src     = imagePreview;
    img.alt     = 'image envoyée';
    img.loading = 'lazy';
    bubbleEl.appendChild(img);
  }

  if (audioSrc) {
    const audio    = document.createElement('audio');
    audio.controls = true;
    audio.src      = audioSrc;
    bubbleEl.appendChild(audio);
  }

  if (ocrText) {
    const badge       = document.createElement('div');
    badge.className   = 'ocr-badge';
    badge.innerHTML   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 8h10M7 12h6M7 16h8"/></svg> Texte OCR : ${(ocrText.length > 120 ? ocrText.slice(0, 120) + '…' : ocrText).replace(/</g, '&lt;')}`;
    bubbleEl.appendChild(badge);
  }

  if (transcription) {
    const badge     = document.createElement('div');
    badge.className = 'transcription-badge';
    badge.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/></svg> Transcription : ${transcription.replace(/</g, '&lt;')}`;
    bubbleEl.appendChild(badge);
  }

  const timeEl      = document.createElement('div');
  timeEl.className  = 'msg-time';
  timeEl.textContent = getTime();

  const contentEl   = document.createElement('div');
  contentEl.className = 'msg-content';
  contentEl.appendChild(bubbleEl);
  contentEl.appendChild(timeEl);

  const avatarEl    = document.createElement('div');
  avatarEl.className = `msg-avatar ${isUser ? 'user' : 'bot'}`;

  if (!isUser) {
    const avatarImg = document.createElement('img');
    avatarImg.src   = 'images/marcioAI.jpg';
    avatarImg.alt   = 'marcioAI';
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
  const d         = document.createElement('div');
  d.className     = 'msg bot';
  d.id            = 'typing-ind';
  const avatarEl  = document.createElement('div');
  avatarEl.className = 'msg-avatar bot';
  const img       = document.createElement('img');
  img.src         = 'images/marcioAI.jpg';
  img.alt         = 'marcioAI';
  avatarEl.appendChild(img);
  d.appendChild(avatarEl);
  const bubble    = document.createElement('div');
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

/* ══════════════════════════════════════════════
   MAIN SEND
══════════════════════════════════════════════ */
async function sendMessage() {
  const text   = inputEl.value.trim();
  const hasImg = !!pendingImageFile;
  const hasAud = !!pendingAudioBlob;

  if (!text && !hasImg && !hasAud) return;
  if (isLoading) return;

  const welcome = document.getElementById('welcome');
  if (welcome) welcome.remove();

  isLoading        = true;
  sendBtn.disabled = true;

  let finalText         = text;
  let ocrText           = null;
  let imagePreview      = pendingImagePreview;
  let audioSrcDisplay   = null;
  let transcriptionText = null;

  // ── OCR ──
  if (hasImg) {
    showToast('Extraction du texte OCR…', 15000);
    try {
      ocrText = await extractTextFromImage(pendingImageFile);
    } catch (e) {
      showToast('Erreur OCR : ' + e.message);
      ocrText = '';
    }
    pendingImageFile    = null;
    pendingImagePreview = null;
  }

  // ── Transcription audio ──
  if (hasAud) {
    showToast('Transcription audio…', 8000);
    try {
      transcriptionText = await transcribeAudio(pendingAudioBlob);
    } catch (e) {
      showToast('Erreur transcription audio');
    }
    audioSrcDisplay  = URL.createObjectURL(pendingAudioBlob);
    pendingAudioBlob = null;
  }

  addMessage('user', text || null, imagePreview, audioSrcDisplay, ocrText, transcriptionText);

  inputEl.value      = '';
  inputEl.style.height = 'auto';
  document.getElementById('img-preview-wrap').style.display   = 'none';
  document.getElementById('audio-preview-wrap').style.display = 'none';

  showTyping();

  const ocrIsEmpty = hasImg && (!ocrText || ocrText.length < 5);

  if (!text && !transcriptionText && ocrIsEmpty && !hasImg) {
    hideTyping();
    addMessage('bot', `👋 Bonjour ! **marcioAI** est là pour vous aider.\n\nJe n'ai pas pu détecter de contenu à traiter. Veuillez :\n- Envoyer une image contenant du **texte lisible**\n- Ou **saisir votre question** directement dans le champ de message\n\nJe suis à votre disposition pour traiter vos sujets ! 😊`);
    isLoading        = false;
    sendBtn.disabled = false;
    inputEl.focus();
    return;
  }

  // ── Construction du message API ──
  const contentParts = [];
  if (text) contentParts.push({ type: 'text', text });

  if (ocrText && ocrText.length >= 5) {
    contentParts.push({
      type: 'text',
      text: `[L'utilisateur a envoyé une image. Voici le texte extrait par OCR :\n\n${ocrText}\n\nAnalyse ce contenu et réponds en conséquence. Si c'est un tableau de données, présente-le proprement. Si c'est des formules mathématiques, utilise la notation LaTeX.]`
    });
  } else if (hasImg) {
    contentParts.push({
      type: 'text',
      text: `[L'utilisateur a envoyé une image mais je n'ai pas pu en extraire de texte lisible. L'image a été affichée dans la conversation.]`
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
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + GROQ_API_KEY
      },
      body: JSON.stringify({
        model:       'llama-3.3-70b-versatile',
        messages:    [SYSTEM, ...history],
        temperature: 0.75,
        max_tokens:  1500
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
  } catch (err) {
    hideTyping();
    addMessage('bot', 'Erreur de connexion. Vérifiez votre réseau.');
  }

  isLoading        = false;
  sendBtn.disabled = false;
  inputEl.focus();
}
