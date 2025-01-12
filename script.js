// Импортируем createClient из CDN
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';
import CryptoJS from 'https://cdn.skypack.dev/crypto-js';

// Шифрованный ключ и пароль для расшифровки
const encryptedKey = 'U2FsdGVkX19QzpRlNzi5iFQgFbvl4NfU9URF6LfR5RxV2ZOUboWR2FO9rQy5ZxGm'; // Зашифрованный ключ
const decryptionPassword = 'strong-secret-password'; // Надежный пароль

// Расшифровка ключа
const supabaseKey = CryptoJS.AES.decrypt(encryptedKey, decryptionPassword).toString(CryptoJS.enc.Utf8);
const supabaseUrl = 'https://gdhzpqaskoyvbfypfkfv.supabase.co';
const supabase = createClient(supabaseUrl, supabaseKey);

// Получаем элементы из HTML
const balanceDisplay = document.getElementById('balanceDisplay');
const betInput = document.getElementById('betInput');
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

balanceDisplay.textContent = `Balance: ${balance}`;
betInput.value = currentBet;

// Функция для проверки авторизации
async function checkAuth() {
  const user = supabase.auth.user();
  if (!user) {
    console.warn('User not logged in');
    redirectToLogin();
  }
}

// Функция для загрузки данных пользователя из базы данных
async function loadUserData() {
  await checkAuth();

  const user = supabase.auth.user();
  const { data, error } = await supabase
    .from('users')
    .select('balance, maxwin')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user data:', error.message);
    return;
  }

  balance = data?.balance ?? 0;
  MaxWin = data?.maxwin ?? 0;
  balanceDisplay.textContent = `Balance: ${balance}`;
}

// Функция для обновления данных пользователя
async function updateUserData() {
  await checkAuth();

  const user = supabase.auth.user();
  const { error } = await supabase
    .from('users')
    .update({ balance, maxwin: MaxWin })
    .eq('id', user.id);

  if (error) {
    console.error('Error updating user data:', error.message);
  }
}

// Функция для обработки вращения слотов
spinButton.addEventListener('click', async () => {
  await checkAuth();

  if (currentBet > balance) {
    showPopup('errorPopup', 'Insufficient balance!');
    return;
  }

  const results = spinSlots();
  const { type, symbol } = checkCombination(results);

  if (type === 'none') {
    balance -= currentBet;
    showPopup('losePopup', 'You lost!');
  } else {
    const winAmount = payouts[symbol][type];
    balance += winAmount;
    MaxWin = Math.max(MaxWin, winAmount);
    showPopup('winPopup', `You won ${winAmount} coins!`, winAmount);
  }

  balanceDisplay.textContent = `Balance: ${balance}`;
  await updateUserData();
});

// Функция для редиректа на страницу логина
function redirectToLogin() {
  window.location.href = 'login.html';
}

// Обработчик изменения состояния авторизации
supabase.auth.onAuthStateChange(async (_event, session) => {
  if (session?.user) {
    document.getElementById('loginButton').style.display = 'none';
    document.getElementById('statsButton').style.display = 'block';
    document.getElementById('logoutButton').style.display = 'block';
    await loadUserData();
  } else {
    document.getElementById('loginButton').style.display = 'block';
    document.getElementById('statsButton').style.display = 'none';
    document.getElementById('logoutButton').style.display = 'none';
  }
});

document.getElementById('logoutButton').addEventListener('click', async () => {
  await supabase.auth.signOut();
  redirectToLogin();
});
