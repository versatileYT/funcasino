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

let balance = 1000; // Начальный баланс, будет обновляться из базы данных
let currentBet = 10; // Изначальная ставка
let MaxWin = 0; // Изначальный максимальный выигрыш

balanceDisplay.textContent = `Balance: ${balance}`;
betInput.value = currentBet;

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
  setTimeout(() => {
    gsap.to(popup, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        popup.classList.add('hidden');
      },
    });
  }, delay);
};

// Функция для отображения модального окна
function showPopup(popupId, message = '', winAmount = 0) {
  const popup = document.getElementById(popupId);
  const winText = popup.querySelector('h2');
  const winAmountDisplay = popup.querySelector('p');

  if (message) winText.textContent = message;
  if (winAmountDisplay)
    winAmountDisplay.textContent = winAmount > 0 ? `${winAmount} coins` : '';

  popup.classList.remove('hidden');
  popup.style.opacity = 1;
  closePopup(popupId, 2000);
}

// Функция для вращения слотов
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

// Функция для проверки комбинации
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

// Функция для редиректа на страницу login.html
function redirectToLogin() {
  window.location.href = 'login.html';
}

// Слушаем события изменения статуса пользователя (вход/выход)
supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    // Если пользователь вошел, скрываем кнопку входа и показываем кнопки "Show Stats" и "Logout"
    document.getElementById('loginButton').style.display = 'none';
    document.getElementById('statsButton').style.display = 'block';
    document.getElementById('logoutButton').style.display = 'block';
  } else {
    // Если пользователь не вошел, показываем кнопку входа
    document.getElementById('loginButton').style.display = 'block';
    document.getElementById('statsButton').style.display = 'none';
    document.getElementById('logoutButton').style.display = 'none';
  }
});

// Обработчик для кнопки входа / регистрации
document.getElementById('loginButton').addEventListener('click', () => {
  redirectToLogin();
});

// Обработчик для кнопки выхода
document.getElementById('logoutButton').addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'login.html'; // Перенаправляем на страницу логина
});

// Запуск игры
spinButton.addEventListener('click', async () => {
  if (currentBet <= balance) {
    const results = spinSlots();

    const { type, symbol } = checkCombination(results);

    if (type === 'none') {
      showPopup('losePopup');
      balance -= currentBet;
    } else {
      const winAmount = payouts[symbol][type];
      balance += winAmount;
      MaxWin = Math.max(MaxWin, winAmount);
      showPopup('winPopup', `You won ${winAmount} coins!`, winAmount);
    }

    balanceDisplay.textContent = `Balance: ${balance}`;
  } else {
    showPopup('errorPopup', 'Insufficient balance!');
  }
});

// Слушаем события для кнопок ставки
betButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const value = parseInt(button.dataset.value, 10);
    updateBet(value);
  });
});

// Кнопка MAX
maxBetButton.addEventListener('click', () => {
  currentBet = balance;
  betInput.value = currentBet;
});

// Кнопка RESET
resetBetButton.addEventListener('click', () => {
  currentBet = 10;
  betInput.value = currentBet;
});
