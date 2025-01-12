// Импортируем createClient из CDN
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';

// Замените на ваш URL и ключ
const supabaseUrl = 'https://gdhzpqaskoyvbfypfkfv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaHpwcWFza295dmJmeXBma2Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2Mjg3MjIsImV4cCI6MjA1MjIwNDcyMn0.eAe2kQUxRRin9WPjSCB9JyHGhPtUmBt4tyk-IkIRvD8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Получаем элементы из HTML
const balanceDisplay = document.getElementById('balanceDisplay');
const betInput = document.getElementById('betInput');
const betButtons = document.querySelectorAll('.bet-btn');
const maxBetButton = document.getElementById('maxBetButton');
const resetBetButton = document.getElementById('resetBetButton');
const slotElements = [
  document.getElementById('slot1'),
  document.getElementById('slot2'),
  document.getElementById('slot3'),
];
const spinButton = document.getElementById('spinButton');
const statsButton = document.getElementById('statsButton');

const symbols = ['🍒', '🍋', '🍊', '⭐', '💎', '🍇', '🍉'];
const payouts = {
  '🍒': { triple: 15, double: 5 },
  '🍋': { triple: 10, double: 3 },
  '🍊': { triple: 12, double: 4 },
  '⭐': { triple: 50, double: 15 },
  '💎': { triple: 100, double: 25 },
  '🍇': { triple: 20, double: 7 },
  '🍉': { triple: 18, double: 6 },
};

let balance = 1000; // Начальный баланс
let currentBet = 10; // Изначальная ставка
let MaxWin = 0; // Изначальный максимальный выигрыш

balanceDisplay.textContent = Balance: ${balance};
betInput.value = currentBet;

// Функция для загрузки данных пользователя из базы данных
async function loadUserData() {
  const user = supabase.auth.user();
  
  if (user) {
    const { data, error } = await supabase
      .from('users')
      .select('balance, maxwin')
      .eq('id', user.id)
      .single();  // Получаем одну запись для текущего пользователя

    if (error) {
      console.error('Error fetching user data:', error.message);
      return;
    }

    // Обновляем данные баланса и максимального выигрыша
    balance = data.balance || 0;
    MaxWin = data.maxwin || 0;

    balanceDisplay.textContent = `Balance: ${balance}`;
  }
}

// Функция для обновления данных в базе данных
async function updateUserData() {
  const user = supabase.auth.user();
  
  if (user) {
    const { error } = await supabase
      .from('users')
      .update({ balance, maxwin: MaxWin })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating user data:', error.message);
    }
  }
}

// Функция для обновления ставки
function updateBet(amount) {
  const newBet = currentBet + amount;
  if (newBet >= 1 && newBet <= balance) {
    currentBet = newBet;
    betInput.value = currentBet;
  }
}

// Функция для скрытия модального окна
window.closePopup = (popupId, delay = 2000) => {
  const popup = document.getElementById(popupId);
  
  if (popup) {
    setTimeout(() => {
      gsap.to(popup, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          popup.classList.add('hidden');
        },
      });
    }, delay);
  }
};

// Функция для отображения статистики в модальном окне
function showPopup(popupId, message = '', winAmount = 0) {
  const popup = document.getElementById(popupId);
  const winText = popup.querySelector('h2');
  const winAmountDisplay = popup.querySelector('p');
  const balanceDisplayInPopup = document.getElementById('statsBalance');
  const maxWinDisplayInPopup = document.getElementById('statsMaxWin');

  if (message) winText.textContent = message;
  if (winAmountDisplay) winAmountDisplay.textContent = winAmount > 0 ? ${winAmount} coins : '';

  if (balanceDisplayInPopup) {
    balanceDisplayInPopup.textContent = Balance: ${balance} coins;
  }

  if (maxWinDisplayInPopup) {
    maxWinDisplayInPopup.textContent = Max Win: ${MaxWin} coins;
  }

  popup.classList.remove('hidden');
  popup.style.opacity = 1;

  closePopup(popupId, 3000);
}

// Обработчик для кнопки Show Stats
statsButton.addEventListener('click', () => {
  showPopup('statsPopup');
});

function spinSlots() {
  const results = [];
  slotElements.forEach((slot, index) => {
    const randomSymbols = Array.from(
      { length: 15 },
      () => symbols[Math.floor(Math.random() * symbols.length)]
    );
    results.push(randomSymbols[randomSymbols.length - 1]);

    const totalDuration = 1.5 + index * 0.3;
    const delayBetweenFrames = totalDuration / randomSymbols.length;

    let currentStep = 0;

    const interval = setInterval(() => {
      slot.textContent = randomSymbols[currentStep];
      currentStep++;

      if (currentStep >= randomSymbols.length) {
        clearInterval(interval);
        slot.textContent = results[index];
      }
    }, delayBetweenFrames * 1000);
  });

  return results;
}

function checkCombination(results) {
  const counts = results.reduce((acc, symbol) => {
    acc[symbol] = (acc[symbol] || 0) + 1;
    return acc;
  }, {});

  for (const symbol in counts) {
    if (counts[symbol] === 3) return { type: 'triple', symbol };
    if (counts[symbol] === 2) return { type: 'double', symbol };
  }

  return { type: 'none' };
}

function redirectToLogin() {
  window.location.href = 'login.html';
}

supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    document.getElementById('loginButton').style.display = 'none';
    document.getElementById('statsButton').style.display = 'block';
    document.getElementById('logoutButton').style.display = 'block';
    loadUserData(); // Загружаем данные при входе
  } else {
    document.getElementById('loginButton').style.display = 'block';
    document.getElementById('statsButton').style.display = 'none';
    document.getElementById('logoutButton').style.display = 'none';
  }
});

document.getElementById('loginButton').addEventListener('click', () => {
  redirectToLogin();
});

document.getElementById('logoutButton').addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
});

spinButton.addEventListener('click', async () => {
  if (currentBet <= balance) {
    const results = spinSlots();
    const { type, symbol } = checkCombination(results);

    if (type === 'none') {
      setTimeout(() => showPopup('losePopup'), 1000);
      balance -= currentBet;
    } else {
      const winAmount = payouts[symbol][type];
      balance += winAmount;
      MaxWin = Math.max(MaxWin, winAmount);
      setTimeout(() => showPopup('winPopup', You won ${winAmount} coins!, winAmount), 1000);
    }

    balanceDisplay.textContent = Balance: ${balance};
    await updateUserData(); // Обновляем данные после изменения баланса
  } else {
    showPopup('errorPopup', 'Insufficient balance!');
  }
});

betButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const value = parseInt(button.dataset.value, 10);
    updateBet(value);
  });
});

maxBetButton.addEventListener('click', () => {
  currentBet = balance;
  betInput.value = currentBet;
});

resetBetButton.addEventListener('click', () => {
  currentBet = 10;
  betInput.value = currentBet;
});

statsButton.addEventListener('click', () => {
  showPopup('statsPopup', Max Win: ${MaxWin} coins\nBalance: ${balance} coins);
});

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    spinButton.click();
  }
});
