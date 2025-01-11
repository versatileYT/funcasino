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
const currentUser = localStorage.getItem('currentUser');
const logoutButton = document.getElementById('logoutButton');

let balance = 1000; // Базовый баланс
let bet = 10;
const symbols = ['🍒', '🍋', '🍊', '🍇', '⭐', '🍉'];
let isSpinning = false;

const winTable = {
    '⭐⭐⭐': 100,
    '🍇🍇🍇': 50,
    '🍉🍉🍉': 20,
    '🍊🍊🍊': 10,
    '🍋🍋🍋': 5,
    '🍒🍒🍒': 2,
};

const twoMatchWin = {
    '⭐⭐': 10,
    '🍇🍇': 8,
    '🍉🍉': 7,
    '🍊🍊': 6,
    '🍋🍋': 5,
    '🍒🍒': 3,
};

// Загружаем баланс при загрузке страницы
function loadBalance() {
    if (currentUser) {
        const account = JSON.parse(localStorage.getItem(currentUser));
        if (account) {
            balance = account.balance; // Используем баланс из аккаунта
        }
    }
    balanceDisplay.textContent = balance.toLocaleString();
}

// Обновляем аккаунт в localStorage
function updateAccountStats() {
    if (currentUser) {
        const account = JSON.parse(localStorage.getItem(currentUser));
        if (account) {
            account.balance = balance; // Обновляем баланс
            localStorage.setItem(currentUser, JSON.stringify(account)); // Сохраняем обновления
        }
    }
}

// Обработчик кнопки "Spin"
function startSpin() {
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

    // Обновляем статистику при проигрыше
    updateAccountStats();

    spinSlots().then((results) => {
        const combination = results.join('');
        const multiplier = winTable[combination] || checkTwoMatch(results) || 0;

        if (multiplier > 0) {
            const winAmount = bet * multiplier;
            showWinPopup('🎉 You Win! 🎉', `+${winAmount.toLocaleString()} coins`);
            balance += winAmount;

            // Обновляем статистику при выигрыше
            updateAccountStats();
        } else {
            showWinPopup('Try Again!', 'No win this time');
        }

        // Если баланс упал до 0, обновляем его в статистике
        if (balance <= 0) {
            balance = 0;
            updateAccountStats(); // Сохраняем обновленный баланс в статистике
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
    let currentBet = parseInt(betInput.value, 10);
    currentBet = Math.max(1, currentBet + amount);
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

function showStats() {
    if (!currentUser) {
        statsButton.textContent = 'Login/Register';
        statsButton.onclick = () => {
            window.location.href = 'login.html';
        };
    } else {
        const account = JSON.parse(localStorage.getItem(currentUser));
        alert(`Balance: ${account.balance} coins\nMax Win: ${account.maxWin} coins`);
    }
}

statsButton.addEventListener('click', showStats);

// Инициализация баланса при загрузке
loadBalance();




// Функция для выхода из аккаунта
function logout() {
    localStorage.removeItem('currentUser'); // Удаляем информацию о текущем пользователе
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

// Вызовем функцию при загрузке страницы
showLogoutButton();
