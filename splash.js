/* ============================================================
   SPLASH / COUNTDOWN — splash.js
   - 30 citations de vie (rotatives, choisies aléatoirement)
   - Décompte de 7 secondes avec anneau SVG
   - Barre de progression
   - Canvas particules
   ============================================================ */

"use strict";

// ── 30 Citations de vie ──────────────────────────────────────
const QUOTES = [
  {
    text: "Le succès, c'est se promener d'échec en échec sans perdre son enthousiasme.",
    author: "Winston Churchill"
  },
  {
    text: "La vie, c'est comme une bicyclette : il faut avancer pour ne pas perdre l'équilibre.",
    author: "Albert Einstein"
  },
  {
    text: "Ce n'est pas parce que les choses sont difficiles que nous n'osons pas. C'est parce que nous n'osons pas qu'elles sont difficiles.",
    author: "Sénèque"
  },
  {
    text: "L'avenir appartient à ceux qui croient en la beauté de leurs rêves.",
    author: "Eleanor Roosevelt"
  },
  {
    text: "Dans le milieu du voyage de notre vie, je me trouvai dans une forêt obscure car la voie droite était perdue.",
    author: "Dante Alighieri"
  },
  {
    text: "Le seul moyen de faire du bon travail est d'aimer ce que vous faites.",
    author: "Steve Jobs"
  },
  {
    text: "Tout ce que l'esprit de l'homme peut concevoir et croire, il peut l'accomplir.",
    author: "Napoleon Hill"
  },
  {
    text: "La discipline est le pont entre les objectifs et les accomplissements.",
    author: "Jim Rohn"
  },
  {
    text: "Deux choses sont infinies : l'Univers et la bêtise humaine. Mais pour l'Univers, je n'en suis pas encore certain.",
    author: "Albert Einstein"
  },
  {
    text: "Le génie, c'est un pour cent d'inspiration et quatre-vingt-dix-neuf pour cent de transpiration.",
    author: "Thomas Edison"
  },
  {
    text: "Ce que nous pensons ou ce que nous savons ou ce que nous croyons est, à la fin, de peu de conséquence. La seule conséquence, c'est ce que nous faisons.",
    author: "John Ruskin"
  },
  {
    text: "Vous n'avez pas à être extraordinaire pour commencer, mais vous devez commencer pour être extraordinaire.",
    author: "Zig Ziglar"
  },
  {
    text: "La vraie générosité envers l'avenir consiste à tout donner au présent.",
    author: "Albert Camus"
  },
  {
    text: "Le courage, c'est d'aller de l'avant malgré la peur, pas l'absence de peur.",
    author: "Nelson Mandela"
  },
  {
    text: "Chaque expert a un jour été un débutant. Chaque pro a un jour été un amateur.",
    author: "Robin Sharma"
  },
  {
    text: "Ne comptez pas les jours, faites en sorte que les jours comptent.",
    author: "Muhammad Ali"
  },
  {
    text: "La vie est ce qui arrive pendant que vous faites d'autres projets.",
    author: "John Lennon"
  },
  {
    text: "Tout obstacle surmonté est un commandant obéissant à l'ordre de marche.",
    author: "Ralph Waldo Emerson"
  },
  {
    text: "Le bonheur n'est pas quelque chose que l'on reporte à plus tard. C'est quelque chose que l'on conçoit maintenant.",
    author: "Jim Rohn"
  },
  {
    text: "Si vous voulez vivre une vie heureuse, attachez-la à un but, pas à des personnes ni à des objets.",
    author: "Albert Einstein"
  },
  {
    text: "Vous ne pouvez pas retourner en arrière et changer le début, mais vous pouvez démarrer là où vous en êtes et changer la fin.",
    author: "C.S. Lewis"
  },
  {
    text: "Le meilleur moment pour planter un arbre, c'était il y a vingt ans. Le deuxième meilleur moment, c'est maintenant.",
    author: "Proverbe chinois"
  },
  {
    text: "La grandeur ne consiste pas à recevoir les honneurs, mais à les mériter.",
    author: "Aristote"
  },
  {
    text: "L'imagination est plus importante que la connaissance. La connaissance est limitée, l'imagination embrasse le monde entier.",
    author: "Albert Einstein"
  },
  {
    text: "Votre temps est limité, ne le gâchez pas à vivre la vie de quelqu'un d'autre.",
    author: "Steve Jobs"
  },
  {
    text: "La persévérance est ce qui rend l'impossible possible, le possible probable et le probable certain.",
    author: "Robert Half"
  },
  {
    text: "Croyez en vous. Vous êtes plus courageux que vous ne le pensez, plus talentueux que vous ne le semblez et plus compétent que vous ne l'imaginez.",
    author: "Roy T. Bennett"
  },
  {
    text: "Ce n'est pas la montagne que nous conquérons, c'est nous-mêmes.",
    author: "Edmund Hillary"
  },
  {
    text: "Les opportunités ne se produisent pas. Vous les créez.",
    author: "Chris Grosser"
  },
  {
    text: "Faites ce que vous pouvez, avec ce que vous avez, là où vous êtes.",
    author: "Theodore Roosevelt"
  },
  {
    text: "L'éducation est l'arme la plus puissante que vous puissiez utiliser pour changer le monde.",
    author: "Nelson Mandela"
  },
  {
    text: "Le meilleur investissement que vous puissiez faire est un investissement en vous-même.",
    author: "Warren Buffett"
  }
];

// ── Sélection aléatoire d'une citation ──────────────────────
function pickQuote() {
  // Évite de répéter la même que la session précédente
  const lastIdx = parseInt(sessionStorage.getItem('lastQuoteIdx') || '-1');
  let idx;
  do {
    idx = Math.floor(Math.random() * QUOTES.length);
  } while (idx === lastIdx && QUOTES.length > 1);
  sessionStorage.setItem('lastQuoteIdx', idx);
  return QUOTES[idx];
}

// ── Affichage de la citation ─────────────────────────────────
function displayQuote() {
  const q = pickQuote();
  const textEl = document.getElementById('quoteText');
  const authorEl = document.getElementById('quoteAuthor');
  if (textEl) textEl.textContent = q.text;
  if (authorEl) authorEl.textContent = '— ' + q.author;
}

// ── Canvas Particules ────────────────────────────────────────
function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles;

  const COLORS = [
    'rgba(201,168,76,',
    'rgba(240,208,128,',
    'rgba(42,191,191,',
    'rgba(240,244,255,'
  ];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticles(n) {
    return Array.from({ length: n }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.5 + 0.1,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      flicker: Math.random() * Math.PI * 2,
      flickerSpeed: 0.01 + Math.random() * 0.02
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.flicker += p.flickerSpeed;
      const alpha = p.alpha * (0.6 + 0.4 * Math.sin(p.flicker));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + alpha + ')';
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    });
    requestAnimationFrame(draw);
  }

  resize();
  particles = createParticles(80);
  window.addEventListener('resize', () => {
    resize();
    particles = createParticles(80);
  });
  draw();
}

// ── Décompte ─────────────────────────────────────────────────
function initCountdown() {
  const TOTAL = 7; // secondes
  const CIRCUMFERENCE = 2 * Math.PI * 52; // 326.73

  const numEl  = document.getElementById('countdownNum');
  const ringEl = document.getElementById('ringProgress');
  const barEl  = document.getElementById('progressBar');

  if (!numEl || !ringEl || !barEl) return;

  // Initialise l'anneau plein
  ringEl.style.strokeDashoffset = '0';

  let remaining = TOTAL;

  function tick() {
    // Mise à jour du chiffre avec animation pulse
    numEl.textContent = remaining;
    numEl.classList.remove('pulse');
    void numEl.offsetWidth; // reflow pour relancer l'animation
    numEl.classList.add('pulse');

    // Mise à jour de l'anneau (se vide au fil du temps)
    const fraction = remaining / TOTAL;
    const offset = CIRCUMFERENCE * (1 - fraction);
    ringEl.style.strokeDashoffset = offset;

    // Barre de progression (se remplit)
    const progressPct = ((TOTAL - remaining) / TOTAL) * 100;
    barEl.style.width = progressPct + '%';

    if (remaining <= 0) {
      // Redirection
      window.location.href = 'main.html';
      return;
    }

    remaining--;
    setTimeout(tick, 1000);
  }

  // Lance immédiatement
  tick();
}

// ── Initialisation ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  displayQuote();
  initParticles();
  initCountdown();
});