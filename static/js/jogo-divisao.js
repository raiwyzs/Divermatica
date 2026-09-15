window.dificuldadePorAno = window.dificuldadePorAno || {
  obterConfiguracao(materia){
    return { maxQuociente: 10, maxDivisor: 10 };
  }
};

const FISH_IMAGES = [
  "/static/images/images-jogodivisao/peixe_roxo.png",
  "/static/images/images-jogodivisao/peixe_amarelo.png",
  "/static/images/images-jogodivisao/peixe_verde.png",
  "/static/images/images-jogodivisao/peixe_laranja.png"
];

function randomFishImage(){
  return FISH_IMAGES[Math.floor(Math.random() * FISH_IMAGES.length)];
}

(() => {
  // ELEMENTOS
  const startBtn = document.getElementById('start-btn');
  const restartBtn = document.getElementById('restart-btn');
  const startScreen = document.getElementById('start-screen');
  const gameEl = document.getElementById('game');
  const gameOverEl = document.getElementById('game-over');
  const questionEl = document.getElementById('question');
  const fishAreaEl = document.getElementById('fish-area');
  const scoreEl = document.getElementById('score');
  const livesEl = document.getElementById('lives');
  const timerEl = document.getElementById('timer');
  const finalScoreEl = document.getElementById('final-score');

  // ESTADO
  let score = 0;
  let lives = 3;
  let timeLeft = 30;
  let timerId = null;
  let correctAnswer = null;

  let combo = 0;
  let level = 1;
  let correctCount = 0;

  // CONFIGURAÇÕES
  const POINTS = 10;
  const TIME_PER_Q = 30;

  function resetState() {
    score = 0;
    lives = 3;
    combo = 0;
    level = 1;
    timeLeft = TIME_PER_Q;
    correctCount = 0;
    updateHUD();
    updateBucket();
  }

  function updateHUD() {
    scoreEl.textContent = `Pontuação: ${score}  | Combo x${combo}`;
    livesEl.innerHTML = `Vidas: ${'❤️'.repeat(lives)}`;
    timerEl.textContent = `Tempo: ${timeLeft}s`;

    if (timeLeft <= 3) timerEl.classList.add('low-time');
    else timerEl.classList.remove('low-time');
  }

  function updateBucket() {
    document.getElementById('bucket-count').textContent = correctCount;
  }

  function startGame() {
    resetState();
    startScreen.classList.add('hidden');
    gameOverEl.classList.add('hidden');
    gameEl.classList.remove('hidden');
    nextQuestion();
  }

  function endGame() {
    clearInterval(timerId);
    gameEl.classList.add('hidden');
    finalScoreEl.textContent = `Sua pontuação: ${score}`;
    gameOverEl.classList.remove('hidden');
  }

  function loseLife() {
    lives--;
    if (lives <= 0) {
      lives = 0;
      updateHUD();
      endGame();
    } else {
      updateHUD();
      nextQuestion();
    }
  }

  function difficultySettings() {
    if (score < 40) return 10;
    if (score < 100) return 18;
    return 30;
  }

  function generateDivision() {
    const config = window.dificuldadePorAno.obterConfiguracao('divisao');
    const maxValor = config.maxQuociente || 10;
    const quotient = Math.floor(Math.random() * maxValor) + 1;
    const divisor = Math.floor(Math.random() * (config.maxDivisor || maxValor)) + 1;
    return { dividend: quotient * divisor, divisor, quotient };
  }

  function pickOptions(correct) {
    const opts = new Set([correct]);
    while (opts.size < 4) {
      let delta = Math.floor(Math.random() * Math.max(3, Math.floor(correct * 0.4))) + 1;
      if (Math.random() < 0.5) delta = -delta;

      let cand = correct + delta;
      if (cand <= 0) cand = Math.abs(cand) + 2;

      opts.add(cand);
    }
    return shuffle([...opts]);
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function nextQuestion() {
    clearInterval(timerId);
    timeLeft = TIME_PER_Q;
    updateHUD();

    const { dividend, divisor, quotient } = generateDivision();
    correctAnswer = quotient;
    questionEl.textContent = `${dividend} ÷ ${divisor} = ?`;

    const opts = pickOptions(quotient);
    fishAreaEl.innerHTML = '';

    opts.forEach(num => {
      const btn = document.createElement('button');
      btn.className = 'fish';
      btn.dataset.value = num;
      btn.innerHTML = `
        <img class="fish-img" src="${randomFishImage()}" alt="peixe">
        <div class="num">${num}</div>
      `;
      btn.addEventListener('click', onFishClick);
      btn.style.top = Math.random()*240 + 40 + "px";
      btn.style.left = Math.random()*(fishAreaEl.clientWidth ? fishAreaEl.clientWidth - 130 : 500) + 10 + "px";

      fishAreaEl.appendChild(btn);
    });

    timerId = setInterval(() => {
      timeLeft--;
      updateHUD();
      if (timeLeft <= 0) {
        clearInterval(timerId);
        handleWrong(null, true);
      }
    }, 1000);
  }

  function onFishClick(e) {
    const val = Number(e.currentTarget.dataset.value);
    if (val === correctAnswer) {
      handleCorrect(e.currentTarget);
    } else {
      handleWrong(e.currentTarget, false);
    }
  }

  function spawnFishToBucket(originEl) {
  // aceitar balde com id #bucket ou com classe .bucket (template usa .bucket)
  const bucket = document.querySelector("#bucket") || document.querySelector('.bucket');
  if (!bucket) return;

  const fish = document.createElement("div");
  fish.className = "falling-fish";
  fish.innerHTML = `<img src="${randomFishImage()}" alt="peixe">`;

  const originRect = originEl.getBoundingClientRect();
  const bucketRect = bucket.getBoundingClientRect();

  // posição inicial: centro do elemento clicado (viewport coordinates)
  const originX = originRect.left + originRect.width / 2;
  const originY = originRect.top + originRect.height / 2;

  // posição final: centro do balde
  const targetX = bucketRect.left + bucketRect.width / 2;
  const targetY = bucketRect.top + bucketRect.height / 2;

  const dx = Math.round(targetX - originX);
  const dy = Math.round(targetY - originY);

  // colocar em fixed para animar pela viewport
  fish.style.position = 'fixed';
  fish.style.left = originX + 'px';
  fish.style.top = originY + 'px';
  fish.style.transform = 'translate(0, 0) rotate(180deg)';
  fish.style.pointerEvents = 'none';
  fish.style.zIndex = 9999;

  // definir variáveis CSS usadas pela animação
  // duração entre 600ms e 950ms
  const duration = Math.floor(600 + Math.random() * 350);
  fish.style.setProperty('--dx', dx + 'px');
  fish.style.setProperty('--dy', dy + 'px');
  fish.style.setProperty('--fly-duration', duration + 'ms');

  document.body.appendChild(fish);

  // força reflow para garantir que a animação do CSS comece
  void fish.offsetWidth;

  // remover depois que a animação acabar
  setTimeout(() => {
    fish.remove();
  }, duration + 80);
}

  // ===== peixes de fundo decorativos =====
  let bgFishInitialized = false;
  function initBackgroundFish(count = 10) {
    if (bgFishInitialized) return;
    const lake = document.querySelector('.lake');
    if (!lake) return;

    for (let i = 0; i < count; i++) {
      const bf = document.createElement('div');
      bf.className = 'bg-fish';
      bf.innerHTML = `<img src="${randomFishImage()}" alt="peixe">`;

      // posição vertical aleatória dentro da lagoa
      const topPct = 8 + Math.random() * 76; // evita bordas
      // começar levemente fora da tela à esquerda
      const leftPct = -20 + Math.random() * 30;

      bf.style.top = topPct + '%';
      bf.style.left = leftPct + '%';
      bf.style.opacity = (0.12 + Math.random() * 0.38).toFixed(2);

      // animação com duração e delay variados para naturalidade
      const dur = Math.floor(10000 + Math.random() * 18000); // 10s - 28s
      const delay = Math.floor(-Math.random() * dur); // faz alguns já estarem em movimento
      bf.style.animationDuration = dur + 'ms';
      bf.style.animationDelay = delay + 'ms';

      lake.appendChild(bf);
    }

    bgFishInitialized = true;
  }

  // inicializa peixes decorativos imediatamente (existem mesmo com tela oculta)
  initBackgroundFish(12);

  function handleCorrect(btn) {
    clearInterval(timerId);

    spawnFishToBucket(btn);

    combo++;
    score += POINTS + combo;
    correctCount++;

    if (combo % 5 === 0) level++;

    updateHUD();
    updateBucket();

    setTimeout(nextQuestion, 650);
  }

  function handleWrong(btn, timeout) {
    clearInterval(timerId);

    combo = 0;
    updateHUD();

    if (timeout) {
      document.querySelectorAll('.fish').forEach(d => d.classList.add('wrong'));
    } else if (btn) {
      btn.classList.add('wrong');
    }

    document.querySelectorAll('.fish').forEach(d => {
      if (Number(d.dataset.value) === correctAnswer) d.classList.add('correct');
      d.replaceWith(d.cloneNode(true));
    });

    setTimeout(() => loseLife(), 700);
  }

  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', startGame);


  document.addEventListener("mousemove",(e)=>{

  const rod=document.querySelector(".rod");
  if(!rod) return;

  const lake=document.querySelector(".lake");
  const rect=lake.getBoundingClientRect();

  const x=e.clientX-rect.left;

  rod.style.left=x+"px";

  });

})();