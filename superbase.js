const supabaseUrl = 'https://gdhzpqaskoyvbfypfkfv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaHpwcWFza295dmJmeXBma2Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2Mjg3MjIsImV4cCI6MjA1MjIwNDcyMn0.eAe2kQUxRRin9WPjSCB9JyHGhPtUmBt4tyk-IkIRvD8';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

let user = null;
let balance = 1000; // Начальный баланс
let maxWin = 0; // Начальный максимум выигрыша

// Функция для входа с использованием username
async function signInWithUsername(username) {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, balance, max_win')
    .eq('username', username)
    .single();

  if (error) {
    console.error("Error signing in:", error.message);
    return;
  }

  user = data;
  balance = user.balance;
  maxWin = user.max_win;

  // Обновляем баланс и максимальный выигрыш
  balanceDisplay.textContent = balance;

  showLoggedInState();
}

// Функция для регистрации с использованием username
async function signUpWithUsername(username) {
  const { data, error } = await supabase
    .from('users')
    .insert([{ username, balance, max_win: 0 }]);

  if (error) {
    console.error("Error signing up:", error.message);
    return;
  }

  user = data[0];
  balance = user.balance;
  maxWin = user.max_win;

  // Обновляем баланс и максимальный выигрыш
  balanceDisplay.textContent = balance;

  showLoggedInState();
}

// Функция для загрузки данных пользователя из базы данных
async function loadUserStats(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('balance, max_win')
    .eq('id', userId)
    .single();

  if (error) {
    console.error("Error loading user stats:", error.message);
    return;
  }

  balance = data.balance;
  maxWin = data.max_win;

  // Обновляем баланс на странице
  balanceDisplay.textContent = balance;
  // Отображаем максимальный выигрыш в ShowStats (если нужно)
  const statsPopup = document.getElementById('statsPopup');
  statsPopup.querySelector('.maxWin').textContent = `Max Win: ${maxWin} coins`;
}

// Функция для выхода из аккаунта
async function signOut() {
  user = null;
  showLoggedOutState();
}

// Показать состояние входа
function showLoggedInState() {
  document.getElementById('loginButton').classList.add('hidden');
  document.getElementById('statsButton').classList.remove('hidden');
  document.getElementById('logoutButton').classList.remove('hidden');
}

// Показать состояние выхода
function showLoggedOutState() {
  document.getElementById('loginButton').classList.remove('hidden');
  document.getElementById('statsButton').classList.add('hidden');
  document.getElementById('logoutButton').classList.add('hidden');
}

// Проверка, если пользователь уже вошел
supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    loadUserStats(session.user.id);
    showLoggedInState();
  } else {
    showLoggedOutState();
  }
});

// Обработчик для входа по username
document.getElementById('loginButton').addEventListener('click', () => {
  const username = prompt("Enter your username:");
  if (username) {
    signInWithUsername(username);
  }
});

// Обработчик для регистрации по username
document.getElementById('signupButton').addEventListener('click', () => {
  const username = prompt("Enter your username:");
  if (username) {
    signUpWithUsername(username);
  }
});

// Обработчик для выхода
document.getElementById('logoutButton').addEventListener('click', () => {
  signOut();
});
