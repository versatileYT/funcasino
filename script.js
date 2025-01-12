const balanceDisplay = document.getElementById('balanceDisplay');
const betInput = document.getElementById('betInput');
const betButtons = document.querySelectorAll('.bet-btn');
const maxBetButton = document.getElementById('maxBetButton');
const resetBetButton = document.getElementById('resetBetButton');
const slotElements = [document.getElementById('slot1'), document.getElementById('slot2'), document.getElementById('slot3')];
const spinButton = document.getElementById('spinButton');

const symbols = ['🍒', '🍋', '🍊', '⭐', '💎', '🍇', '🍉'];
const payouts = {
  triple: 10, // 10x выигрыш за тройную комбинацию
  double: 2,  // 2x выигрыш за двойную комбинацию
};

// Обновление значения ставки
function updateBet(amount) {
  const newBet = currentBet + amount;
  if (newBet >= 1 && newBet <= balance) {
    currentBet = newBet;
    betInput.value = currentBet;
  }
}

// Закрыть модальное окно
window.closePopup = (popupId) => {
  const popup = document.getElementById(popupId);
  gsap.to(popup, { opacity: 0, duration: 0.5, onComplete: () => popup.classList.add('hidden') });
};

// Показать модальное окно
function showPopup(popupId, message = '', winAmount = 0) {
  const popup = document.getElementById(popupId);
  const winText = popup.querySelector('h2');
  const winAmountDisplay = popup.querySelector('p');

  if (message) winText.textContent = message;
  if (winAmountDisplay) winAmountDisplay.textContent = winAmount > 0 ? +${winAmount} coins : '';

  popup.classList.remove('hidden');
  gsap.fromTo(popup, { opacity: 0 }, { opacity: 1, duration: 0.5 });

// Анимация прокрутки слота
function spinSlots() {
const results = [];
slotElements.forEach((slot, index) => {
  const randomSymbols = Array.from({ length: 20 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
  results.push(randomSymbols[randomSymbols.length - 1]);

  // Анимация прокрутки с эффектом размытия
  const totalDuration = 2 + index * 0.5; // Разное время для каждого слота
  gsap.fromTo(
    slot,
    { y: 0, filter: 'blur(5px)' },
    {
      y: -100 * randomSymbols.length,
      duration: totalDuration,
      ease: "power4.out", // Медленное замедление
      onUpdate: function () {
        const step = Math.floor(this.progress() * randomSymbols.length);
        slot.textContent = randomSymbols[step];
      },
      onComplete: function () {
        slot.textContent = results[index];
        slot.style.transform = 'translateY(0)';
        gsap.to(slot, { filter: 'blur(0px)', duration: 0.2 }); // Убрать размытие
      },
    }
  );

  // Визуальные эффекты подсветки
  gsap.fromTo(
    slot,
    { scale: 1 },
    {
      scale: 1.2,
      duration: totalDuration / 4,
      yoyo: true,
      repeat: 1,
      ease: "sine.inOut",
    }
  );
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

// Кнопка SPIN
spinButton.addEventListener('click', () => {
  if (currentBet > balance) {
    showPopup('errorPopup', 'Not enough balance!');
    return;
  }

  balance -= currentBet;
  balanceDisplay.textContent = balance;

  const results = spinSlots();

  setTimeout(() => {
    const combination = checkCombination(results);
    let winAmount = 0;

    if (combination.type === 'triple') {
      winAmount = currentBet * payouts.triple;
      showPopup('winPopup', 🎉 Triple ${combination.symbol}! 🎉, winAmount);
    } else if (combination.type === 'double') {
      winAmount = currentBet * payouts.double;
      showPopup('winPopup', 🎉 Double ${combination.symbol}! 🎉, winAmount);
    } else {
      showPopup('losePopup', '💸 No match. You lose! 💸');
    }

    balance += winAmount;
    balanceDisplay.textContent = balance;
  }, 3000); // Длительность анимации + пауза
}
);


// Кнопки изменения ставки
betButtons.forEach(button => {
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
