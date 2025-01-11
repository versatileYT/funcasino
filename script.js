// Инициализация Supabase
const supabaseUrl = 'https://gdhzpqaskoyvbfypfkfv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaHpwcWFza295dmJmeXBma2Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2Mjg3MjIsImV4cCI6MjA1MjIwNDcyMn0.eAe2kQUxRRin9WPjSCB9JyHGhPtUmBt4tyk-IkIRvD8';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

let balance = 1000;
let currentBet = 10;
let loggedIn = false;

document.getElementById('spinButton').addEventListener('click', spinSlot);
document.getElementById('statsButton').addEventListener('click', showStats);
document.getElementById('logoutButton').addEventListener('click', logout);

function changeBet(amount) {
  if (balance + amount >= 0) {
    currentBet += amount;
    document.getElementById('betInput').value = currentBet;
  }
}

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
  const slot1 = fruits[Math.floor(Math.random() * fruits.length)];
  const slot2 = fruits[Math.floor(Math.random() * fruits.length)];
  const slot3 = fruits[Math.floor(Math.random() * fruits.length)];

  document.getElementById('slot1').textContent = slot1;
  document.getElementById('slot2').textContent = slot2;
  document.getElementById('slot3').textContent = slot3;

  checkResult(slot1, slot2, slot3);
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

  // Здесь можно загрузить и показать статистику пользователя из Supabase
}

function logout() {
  loggedIn = false;
  document.getElementById('logoutButton').classList.add('hidden');
  document.getElementById('spinButton').classList.add('hidden');
  document.getElementById('statsButton').classList.add('hidden');
  document.getElementById('loginSection').classList.remove('hidden');
}

function login() {
  // Здесь добавьте код для входа в систему
  loggedIn = true;
  document.getElementById('loginSection').classList.add('hidden');
  document.getElementById('spinButton').classList.remove('hidden');
  document.getElementById('statsButton').classList.remove('hidden');
  document.getElementById('logoutButton').classList.remove('hidden');
}
