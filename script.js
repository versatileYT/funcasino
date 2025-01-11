import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Создаем клиента Supabase
const supabase = createClient('https://gdhzpqaskoyvbfypfkfv.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaHpwcWFza295dmJmeXBma2Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2Mjg3MjIsImV4cCI6MjA1MjIwNDcyMn0.eAe2kQUxRRin9WPjSCB9JyHGhPtUmBt4tyk-IkIRvD8');

// Инициализация переменных
const balanceDisplay = document.getElementById('balanceDisplay');
const spinButton = document.getElementById('spinButton');
const slots = [document.getElementById('slot1'), document.getElementById('slot2'), document.getElementById('slot3')];
const winPopup = document.getElementById('winPopup');
const winText = document.getElementById('winText');
const winAmount = document.getElementById('winAmount');
const betInput = document.getElementById('betInput');
const statsButton = document.getElementById('statsButton');
const logoutButton = document.getElementById('logoutButton');
const errorPopup = document.getElementById('errorPopup');
const errorMessage = document.getElementById('errorMessage');

let balance = 1000; // Начальный баланс
let bet = 10;
let isSpinning = false;
let currentUser = null;

// Загружаем текущего пользователя из Supabase
async function loadUser() {
    const user = await supabase.auth.getUser();
    currentUser = user.data;
    if (currentUser) {
        loadBalance();
        showLogoutButton();
    } else {
        showLoginButton();
    }
}

// Загружаем баланс из базы данных
async function loadBalance() {
    if (currentUser) {
        const { data, error } = await supabase
            .from('users')
            .select('balance')
            .eq('id', currentUser.id)
            .single();

        if (error) {
            console.error('Error loading balance:', error.message);
            return;
        }

        balance = data.balance;
        balanceDisplay.textContent = balance.toLocaleString();
    }
}

// Обновляем баланс в базе данных
async function updateBalanceInDatabase() {
    if (currentUser) {
        const { data, error } = await supabase
            .from('users')
            .update({ balance })
            .eq('id', currentUser.id);

        if (error) {
            console.error('Error updating balance:', error.message);
        }
    }
}

// Обработчик кнопки "Spin"
async function startSpin() {
    if (isSpinning) return;

    const betAmount = parseInt(betInput.value, 10);
    if (isNaN(betAmount) || betAmount <= 0) {
        showErrorPopup('Please enter a valid bet!');
        return;
    }

    if (betAmount > balance) {
        showErrorPopup('Your bet cannot be greater than your balance!');
        return;
    }

    isSpinning = true;
    balance -= betAmount;
    balanceDisplay.textContent = balance.toLocaleString();

    await updateBalanceInDatabase();

    const results = await spinSlots();

    const combination = results.join('');
    const multiplier = checkWinCombination(combination);
    if (multiplier > 0) {
        const winAmount = betAmount * multiplier;
        balance += winAmount;
        await updateBalanceInDatabase();
        showWinPopup('🎉 You Win! 🎉', `+${winAmount.toLocaleString()} coins`);
    } else {
        showWinPopup('Try Again!', 'No win this time');
    }

    balanceDisplay.textContent = balance.toLocaleString();
    isSpinning = false;
}

// Анимация вращения слотов
function spinSlots() {
    return new Promise((resolve) => {
        const results = [];
        slots.forEach((slot, index) => {
            const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            slot.textContent = randomSymbol;
            results[index] = randomSymbol;

            if (results.length === slots.length) {
                resolve(results);
            }
        });
    });
}

// Проверка комбинации выигрыша
function checkWinCombination(combination) {
    const winTable = {
        '🍒🍒🍒': 3,
        '🍋🍋🍋': 2,
        '🍊🍊🍊': 1,
    };
    return winTable[combination] || 0;
}

// Показать всплывающее окно с выигрышем
function showWinPopup(title, amount) {
    winText.textContent = title;
    winAmount.textContent = amount;
    winPopup.classList.remove('hidden');
    setTimeout(() => winPopup.classList.add('hidden'), 3000);
}

// Обработчик для кнопки "Show Stats"
async function showStats() {
    if (!currentUser) {
        statsButton.textContent = 'Login/Register';
        statsButton.onclick = () => {
            window.location.href = 'login.html';
        };
    } else {
        const { data, error } = await supabase
            .from('users')
            .select('balance, maxWin')
            .eq('id', currentUser.id)
            .single();

        if (error) {
            console.error('Error fetching stats:', error.message);
            return;
        }

        alert(`Balance: ${data.balance} coins\nMax Win: ${data.maxWin} coins`);
    }
}

function showErrorPopup(message) {
    errorMessage.textContent = message;
    errorPopup.classList.add('show');
    setTimeout(() => errorPopup.classList.remove('show'), 2000);
}

// Функция для выхода из аккаунта
async function logout() {
    await supabase.auth.signOut();
    location.reload();
}

// Показываем кнопку "Logout" если пользователь залогинен
function showLogoutButton() {
    logoutButton.classList.remove('hidden');
    logoutButton.addEventListener('click', logout);
}

// Показываем кнопку "Login/Register" если пользователь не залогинен
function showLoginButton() {
    statsButton.textContent = 'Login/Register';
    statsButton.onclick = () => {
        window.location.href = 'login.html';
    };
}

function changeBet() {
    let betInput = document.getElementById('betInput');
    let betValue = parseInt(betInput.value);
    if (isNaN(betValue) || betValue <= 0) {
        alert("Please enter a valid bet amount.");
    } else {
        console.log(`Bet changed to: ${betValue}`);
    }
}


spinButton.addEventListener('click', startSpin);
statsButton.addEventListener('click', showStats);

// Загружаем пользователя при старте
loadUser();
