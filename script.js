let stations = [];
let lines = {};
let current = 0;
let score = 0;
let selected = null;
let timer = null;
let timeLeft = 10;
let question = null;
const totalQuestions = 10;

async function init() {
  const sRes = await fetch('stations.json');
  stations = await sRes.json();
  const lRes = await fetch('lines.json');
  lines = await lRes.json();
}

function startGame() {
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('end-screen').classList.add('hidden');
  document.getElementById('game').classList.remove('hidden');
  current = 0;
  score = 0;
  nextQuestion();
}

function nextQuestion() {
  selected = null;
  document.getElementById('feedback').textContent = '';
  if (current >= totalQuestions) {
    endGame();
    return;
  }
  current++;
  document.getElementById('progress').textContent = `${current}/${totalQuestions}`;

  question = generateQuestion();
  renderQuestion();
  startTimer();
}

function generateQuestion() {
  const station = stations[Math.floor(Math.random() * stations.length)];
  const options = [station];
  while (options.length < 4) {
    const rand = stations[Math.floor(Math.random() * stations.length)];
    if (!options.includes(rand)) options.push(rand);
  }
  shuffle(options);
  return { station, options, correct: options.indexOf(station) };
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function renderQuestion() {
  const iconsDiv = document.getElementById('icons');
  iconsDiv.innerHTML = '';
  question.station.codes.forEach(code => {
    const div = document.createElement('div');
    div.className = 'icon';
    div.textContent = code;
    div.style.backgroundColor = lines[code] || '#666';
    iconsDiv.appendChild(div);
  });
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';
  question.options.forEach((st, idx) => {
    const btn = document.createElement('button');
    btn.textContent = st.name_jp;
    btn.onclick = () => selectAnswer(idx);
    optionsDiv.appendChild(btn);
  });
}

function selectAnswer(idx) {
  if (selected !== null) return;
  selected = idx;
  const buttons = document.querySelectorAll('#options button');
  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === idx) btn.classList.add('selected');
  });
}

function startTimer() {
  timeLeft = 10;
  document.getElementById('timer').textContent = timeLeft;
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      finishQuestion();
    }
  }, 1000);
}

function finishQuestion() {
  const feedback = document.getElementById('feedback');
  const buttons = document.querySelectorAll('#options button');

  if (selected === question.correct) {
    score += 10;
    feedback.textContent = 'Correct!';
  } else {
    feedback.textContent = 'Wrong!';
  }
  buttons.forEach((btn, i) => {
    if (i === question.correct) {
      btn.classList.add('correct');
    }
    if (selected !== null && i === selected && selected !== question.correct) {
      btn.classList.add('wrong');
    }
  });

  setTimeout(nextQuestion, 1000);
}

function endGame() {
  document.getElementById('game').classList.add('hidden');
  document.getElementById('end-screen').classList.remove('hidden');
  document.getElementById('score').textContent = score;
}

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);

init();
