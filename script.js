document.addEventListener("DOMContentLoaded", () => {
  let balance = 1000;
  let currentBet = 10;

  const balanceDisplay = document.getElementById('balanceDisplay');
  const betInput = document.getElementById('betInput');
  const betButtons = document.querySelectorAll('.bet-btn');
  const maxBetButton = document.getElementById('maxBetButton');
  const resetBetButton = document.getElementById('resetBetButton');

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
  function showPopup(popupId) {
    const popup = document.getElementById(popupId);
    popup.classList.remove('hidden');
    gsap.fromTo(popup, { opacity: 0 }, { opacity: 1, duration: 0.5 });
  }

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

  // Пример использования попапов
  document.getElementById('spinButton').addEventListener('click', () => {
    if (currentBet > balance) {
      showPopup('errorPopup');
      document.getElementById('errorMessage').textContent = 'Not enough balance!';
    } else {
      showPopup('winPopup');
    }
  });
});
