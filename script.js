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

// 检查两个站点是否有相同的换乘线码
function hasCommonCodes(station1, station2) {
  if (!station1.codes || !station2.codes) return false;
  return station1.codes.some(code => station2.codes.includes(code));
}

function generateQuestion() {
  // 只从有换乘线的站点中选择（codes数组不为空）
  const stationsWithCodes = stations.filter(s => s.codes && s.codes.length > 0);
  if (stationsWithCodes.length === 0) {
    console.error('没有找到有换乘线的站点');
    return null;
  }
  
  const station = stationsWithCodes[Math.floor(Math.random() * stationsWithCodes.length)];
  const options = [station];
  
  // 创建候选站点列表，排除与正确答案有相同换乘线码的站点
  const candidateStations = stations.filter(s => 
    s !== station && !hasCommonCodes(station, s)
  );
  
  // 如果候选站点不足3个，放宽条件允许没有换乘线的站点
  if (candidateStations.length < 3) {
    console.warn('候选站点不足，添加没有换乘线的站点作为选项');
    const noCodeStations = stations.filter(s => 
      s !== station && (!s.codes || s.codes.length === 0)
    );
    candidateStations.push(...noCodeStations);
  }
  
  // 如果仍然不足，则从所有站点中选择（排除正确答案和已有相同换乘线的）
  while (options.length < 4 && candidateStations.length > 0) {
    const randomIndex = Math.floor(Math.random() * candidateStations.length);
    const rand = candidateStations[randomIndex];
    if (!options.includes(rand)) {
      options.push(rand);
      candidateStations.splice(randomIndex, 1); // 移除已选择的站点
    }
  }
  
  // 最后的容错：如果还是不够4个选项，从所有站点中补充
  if (options.length < 4) {
    while (options.length < 4) {
      const rand = stations[Math.floor(Math.random() * stations.length)];
      if (!options.includes(rand)) {
        options.push(rand);
      }
    }
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
    div.className = 'station-icon';
    div.style.setProperty('--line-color', lines[code] || '#666');
    
    const span = document.createElement('span');
    span.textContent = code;
    div.appendChild(span);
    
    iconsDiv.appendChild(div);
  });
  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';
  question.options.forEach((st, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = st.name_jp;
    btn.onclick = () => selectAnswer(idx);
    optionsDiv.appendChild(btn);
  });
  
  // 隐藏"下一题"按钮
  hideNextButton();
}

function selectAnswer(idx) {
  // 如果已经选择了答案，先清除之前的选择
  if (selected !== null) {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach((btn, i) => {
      btn.classList.remove('selected');
    });
  }
  
  selected = idx;
  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach((btn, i) => {
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
  const buttons = document.querySelectorAll('.option-btn');

  // 禁用所有按钮，防止在显示结果时继续选择
  buttons.forEach(btn => {
    btn.disabled = true;
  });

  if (selected === null) {
    // 用户没有选择，显示超时
    feedback.textContent = '回答超时！';
  } else if (selected === question.correct) {
    // 用户选择正确
    score += 10;
    feedback.textContent = '回答正确！';
  } else {
    // 用户选择错误
    feedback.textContent = '回答错误！';
  }
  
  // 显示正确答案和用户错误选择的视觉反馈
  buttons.forEach((btn, i) => {
    if (i === question.correct) {
      btn.classList.add('correct');
    }
    if (selected !== null && i === selected && selected !== question.correct) {
      btn.classList.add('wrong');
    }
  });

  // 显示"下一题"按钮
  showNextButton();
}

function showNextButton() {
  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) {
    nextBtn.style.display = 'block';
  }
}

function hideNextButton() {
  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) {
    nextBtn.style.display = 'none';
  }
}

function endGame() {
  document.getElementById('game').classList.add('hidden');
  document.getElementById('end-screen').classList.remove('hidden');
  document.getElementById('score').textContent = score;
}

// 等待DOM加载完成后绑定事件
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('start-btn').addEventListener('click', startGame);
  document.getElementById('restart-btn').addEventListener('click', startGame);
  
  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      console.log('下一题按钮被点击');
      nextQuestion();
    });
  }
  
  init();
});
