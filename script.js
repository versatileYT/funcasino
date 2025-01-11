// Инициализация Supabase
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://gdhzpqaskoyvbfypfkfv.supabase.co'; // URL твоего Supabase проекта
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaHpwcWFza295dmJmeXBma2Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2Mjg3MjIsImV4cCI6MjA1MjIwNDcyMn0.eAe2kQUxRRin9WPjSCB9JyHGhPtUmBt4tyk-IkIRvD8'; // Твой Supabase API ключ
const supabase = createClient(supabaseUrl, supabaseKey);
const balanceDisplay = document.getElementById('balance');
const spinButton = document.getElementById('spinButton');
const slots = [document.getElementById('slot1'), document.getElementById('slot2'), document.getElementById('slot3')];
const winPopup = document.getElementById('winPopup');
const winText = document.getElementById('winText');
const winAmount = document.getElementById('winAmount');
const betInput = document.getElementById('betInput');
const errorPopup = document.getElementById('errorPopup');
const errorMessage = document.getElementById('errorMessage');
const statsButton = document.getElementById('statsButton');
const logoutButton = document.getElementById('logoutButton');

let balance = 1000; // Базовый баланс
let bet = 10;
const symbols = ['🍒', '🍋', '🍊', '🍇', '⭐', '🍉'];
let isSpinning = false;
let currentUser = null;

// Загружаем текущего пользователя из Supabase
async function loadUser() {
    const user = await supabase.auth.getUser();
    currentUser = user.data;
    if (currentUser) {
        loadBalance();
    } else {
        showLogoutButton();
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
    }
    balanceDisplay.textContent = balance.toLocaleString();
}

// Обновляем баланс в базе данных
async function updateAccountStats() {
    if (currentUser) {
        const { data, error } = await supabase
            .from('users')
            .update({ balance: balance })
            .eq('id', currentUser.id);

        if (error) {
            console.error('Error updating balance:', error.message);
        }
    }
}

// Обработчик кнопки "Spin"
async function startSpin() {
    if (isSpinning) return;

    const bet = parseInt(betInput.value, 10);

    if (isNaN(bet) || bet <= 0) {
        showErrorPopup('Please enter a valid bet!');
        return;
    }

    if (bet > balance) {
        showErrorPopup('Your bet cannot be greater than your balance!');
        return;
    }

    isSpinning = true;

    // Немедленно отнимаем ставку от баланса
    balance -= bet;
    balanceDisplay.textContent = balance.toLocaleString();

    // Обновляем статистику в базе данных при проигрыше
    await updateAccountStats();

    spinSlots().then(async (results) => {
        const combination = results.join('');
        const multiplier = winTable[combination] || checkTwoMatch(results) || 0;

        if (multiplier > 0) {
            const winAmount = bet * multiplier;
            showWinPopup('🎉 You Win! 🎉', `+${winAmount.toLocaleString()} coins`);
            balance += winAmount;

            // Обновляем статистику в базе данных при выигрыше
            await updateAccountStats();
        } else {
            showWinPopup('Try Again!', 'No win this time');
        }

        // Если баланс упал до 0, обновляем его в базе данных
        if (balance <= 0) {
            balance = 0;
            await updateAccountStats(); // Сохраняем обновленный баланс в базе данных
        }

        balanceDisplay.textContent = balance.toLocaleString(); // Обновляем отображение баланса
        isSpinning = false;
    });
}

// Анимация изменения баланса
function animateBalanceChange(initial, target) {
    let currentBalance = initial;
    const interval = setInterval(() => {
        if (currentBalance > target) {
            currentBalance -= 10;
            balanceDisplay.textContent = currentBalance.toLocaleString();
        } else if (currentBalance < target) {
            currentBalance += 10;
            balanceDisplay.textContent = currentBalance.toLocaleString();
        } else {
            clearInterval(interval);
        }
    }, 50);
}

function spinSlots() {
    return new Promise((resolve) => {
        const results = [];
        slots.forEach((slot, index) => {
            const timeline = gsap.timeline({
                onComplete: () => {
                    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
                    slot.textContent = randomSymbol;
                    results[index] = randomSymbol;
                    if (results.length === slots.length) {
                        resolve(results);
                    }
                },
            });

            timeline.to(slot, {
                y: '50px',
                duration: 0.1,
                repeat: 10 + index * 5,
                onRepeat: () => {
                    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
                    slot.textContent = randomSymbol;
                },
            }).to(slot, { y: '0px', duration: 0.2 });
        });
    });
}

function showWinPopup(title, amount) {
    winText.textContent = title;
    winAmount.textContent = amount;
    winPopup.classList.remove('hidden');
    gsap.fromTo(
        winPopup,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.75)' }
    );

    setTimeout(() => {
        gsap.to(winPopup, {
            opacity: 0,
            scale: 0.5,
            duration: 0.5,
            onComplete: () => winPopup.classList.add('hidden'),
        });
    }, 2000);
}

spinButton.addEventListener('click', startSpin);

function checkTwoMatch(results) {
    const twoMatchCombinations = Object.keys(twoMatchWin);
    for (let combination of twoMatchCombinations) {
        if (results.join('').includes(combination)) {
            return twoMatchWin[combination];
        }
    }
    return 0;
}

function setMaxBet() {
    betInput.value = balance; // Ставка равна балансу
}

function changeBet(amount) {
  const betInput = document.getElementById('betInput');
  let currentBet = parseInt(betInput.value, 10);
  currentBet += amount;
  betInput.value = currentBet;
}

function showErrorPopup(message) {
    errorMessage.textContent = message;
    errorPopup.classList.add('show');

    setTimeout(() => {
        errorPopup.classList.remove('show');
    }, 2000);
}

window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        startSpin();
    }
});

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

statsButton.addEventListener('click', showStats);

// Функция для выхода из аккаунта
async function logout() {
    await supabase.auth.signOut(); // Выход из Supabase
    location.reload(); // Перезагружаем страницу
}

// Показываем кнопку Logout, если пользователь залогинен
function showLogoutButton() {
    if (currentUser) {
        logoutButton.classList.remove('hidden');
        logoutButton.addEventListener('click', logout);
    } else {
        logoutButton.classList.add('hidden');
    }
}
// Пример функции для вращения слота
document.getElementById('spinButton').addEventListener('click', function() {
  // Логика для вращения слота
  console.log('Spin button clicked');
});

// Ваш код для других кнопок (например, статистики, выхода и т.д.)
document.getElementById('statsButton').addEventListener('click', function() {
  console.log('Stats button clicked');
});

document.getElementById('logoutButton').addEventListener('click', function() {
  console.log('Logout button clicked');
});

// Вызовем функцию при загрузке страницы
loadUser();
