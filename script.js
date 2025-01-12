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
  '🍒': { triple: 15, double: 5 }, // Индивидуальные коэффициенты
  '🍋': { triple: 10, double: 3 },
  '🍊': { triple: 12, double: 4 },
  '⭐': { triple: 50, double: 15 },
  '💎': { triple: 100, double: 25 },
  '🍇': { triple: 20, double: 7 },
  '🍉': { triple: 18, double: 6 },
};

let balance = 1000; // Начальный баланс
let currentBet = 10; // Ставка по умолчанию

balanceDisplay.textContent = balance;
betInput.value = currentBet;

// Обновление значения ставки
function updateBet(amount) {
  const newBet = currentBet + amount;
  if (newBet >= 1 && newBet <= balance) {
    currentBet = newBet;
    betInput.value = currentBet;
  }
}

// Закрыть модальное окно автоматически
window.closePopup = (popupId, delay = 2000) => {
  const popup = document.getElementById(popupId);

  // Ожидаем некоторое время (delay) перед скрытием окна
  setTimeout(() => {
    gsap.to(popup, {
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        popup.classList.add('hidden'); // Скрыть окно после анимации
      }
    });
  }, delay);
};

// Показать модальное окно
function showPopup(popupId, message = '', winAmount = 0) {
  const popup = document.getElementById(popupId);
  const winText = popup.querySelector('h2');
  const winAmountDisplay = popup.querySelector('p');

  if (message) winText.textContent = message;
  if (winAmountDisplay)
    winAmountDisplay.textContent = winAmount > 0 ? `${winAmount} coins` : '';

  // Убираем класс hidden перед анимацией
  popup.classList.remove('hidden');
  popup.style.opacity = 1;  // Убедимся, что окно видно

  // После 2 секунд скрываем окно
  closePopup(popupId, 2000);
}

function spinSlots() {
  const results = [];
  slotElements.forEach((slot, index) => {
    const randomSymbols = Array.from(
      { length: 15 }, // Количество случайных символов
      () => symbols[Math.floor(Math.random() * symbols.length)]
    );
    results.push(randomSymbols[randomSymbols.length - 1]);

    const totalDuration = 1.5 + index * 0.3; // Общее время анимации
    const delayBetweenFrames = totalDuration / randomSymbols.length; // Задержка между сменой символов

    let currentStep = 0;

    // Интервальная анимация для смены символов
    const interval = setInterval(() => {
      slot.textContent = randomSymbols[currentStep];
      currentStep++;

      if (currentStep >= randomSymbols.length) {
        clearInterval(interval);
        slot.textContent = results[index]; // Финальный символ
      }
    }, delayBetweenFrames * 1000); // Переводим в миллисекунды
  });

  return results;
}


// Проверка комбинации
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

spinButton.addEventListener('click', () => {
  if (currentBet > balance) {
    showPopup('errorPopup', 'Not enough balance!');
    return;
  }

  // Деактивируем кнопку во время вращения
  spinButton.disabled = true;

  balance -= currentBet;
  balanceDisplay.textContent = balance;

  const results = spinSlots();

  setTimeout(() => {
    const combination = checkCombination(results);
    let winAmount = 0;

    if (combination.type === 'triple') {
      winAmount = currentBet * payouts[combination.symbol].triple;
      showPopup('winPopup', `🎉 Triple ${combination.symbol}! 🎉`, winAmount);
    } else if (combination.type === 'double') {
      winAmount = currentBet * payouts[combination.symbol].double;
      showPopup('winPopup', `🎉 Double ${combination.symbol}! 🎉`, winAmount);
    } else {
      showPopup('losePopup', '💸 No match. You lose! 💸');
    }

    balance += winAmount;
    balanceDisplay.textContent = balance;

    // Активируем кнопку после завершения
    spinButton.disabled = false;
  }, 2000); // Задержка равна длительности анимации
});


// Кнопки изменения ставки
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
