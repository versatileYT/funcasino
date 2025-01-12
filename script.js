document.addEventListener("DOMContentLoaded", () => {
  // Инициализация Supabase
  const supabaseUrl = 'https://gdhzpqaskoyvbfypfkfv.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaHpwcWFza295dmJmeXBma2Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2Mjg3MjIsImV4cCI6MjA1MjIwNDcyMn0.eAe2kQUxRRin9WPjSCB9JyHGhPtUmBt4tyk-IkIRvD8';
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  console.log('Supabase Instance:', supabase);

  // Инициализация переменных
  let balance = 1000;
  let currentBet = 10;
  let loggedIn = true;

  // Привязываем обработчики событий
  document.getElementById('spinButton').addEventListener('click', spinSlot);
  document.getElementById('statsButton').addEventListener('click', showStats);
  document.getElementById('logoutButton').addEventListener('click', logout);
  document.getElementById('maxBetButton').addEventListener('click', setMaxBet);

  // Функции
  function setMaxBet() {
    currentBet = balance;
    document.getElementById('betInput').value = currentBet;
  }

  function spinSlot() {
    if (!loggedIn) {
      showError("You must be logged in to play!");
      return;
    }

    if (currentBet > balance) {
      showError("Insufficient balance!");
      return;
    }

    balance -= currentBet;
    document.getElementById('balanceDisplay').textContent = balance;

    const fruits = ['🍒', '🍋', '🍊', '🍉', '🍇', '🍓'];
    const slots = [
      document.getElementById('slot1'),
      document.getElementById('slot2'),
      document.getElementById('slot3'),
    ];

    // Анимация прокрутки
    let animationInterval = setInterval(() => {
      slots.forEach((slot) => {
        const randomFruit = fruits[Math.floor(Math.random() * fruits.length)];
        slot.textContent = randomFruit;
      });
    }, 100);

    setTimeout(() => {
      clearInterval(animationInterval);

      // Окончательные символы
      const slot1 = fruits[Math.floor(Math.random() * fruits.length)];
      const slot2 = fruits[Math.floor(Math.random() * fruits.length)];
      const slot3 = fruits[Math.floor(Math.random() * fruits.length)];

      slots[0].textContent = slot1;
      slots[1].textContent = slot2;
      slots[2].textContent = slot3;

      checkResult(slot1, slot2, slot3);
    }, 2000); // Продолжительность анимации
  }

  function checkResult(slot1, slot2, slot3) {
    if (slot1 === slot2 && slot2 === slot3) {
      showWin(100);
    } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
      showWin(50);
    } else {
      showLose();
    }
  }

  function showWin(amount) {
    balance += amount;
    document.getElementById('balanceDisplay').textContent = balance;
    document.getElementById('winAmount').textContent = `+${amount} coins`;
    document.getElementById('winPopup').classList.remove('hidden');
    setTimeout(() => document.getElementById('winPopup').classList.add('hidden'), 3000);
  }

  function showLose() {
    document.getElementById('losePopup').classList.remove('hidden');
    setTimeout(() => document.getElementById('losePopup').classList.add('hidden'), 3000);
  }

  function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorPopup').classList.remove('hidden');
    setTimeout(() => document.getElementById('errorPopup').classList.add('hidden'), 3000);
  }

  function showStats() {
    if (!loggedIn) {
      showError("You must be logged in to view stats!");
      return;
    }
    alert("Stats will be displayed here!");
  }

  function logout() {
    loggedIn = false;
    document.getElementById('logoutButton').classList.add('hidden');
    document.getElementById('spinButton').classList.add('hidden');
    document.getElementById('statsButton').classList.add('hidden');
    document.getElementById('loginSection').classList.remove('hidden');
  }
});
