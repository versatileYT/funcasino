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

let balance = 1000;
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

const currentUser = localStorage.getItem('currentUser');

function startSpin() {
    if (isSpinning) return;
  
    const bet = parseInt(betInput.value, 10);
  
    // Проверяем ставку
    if (isNaN(bet) || bet <= 0) {
        showErrorPopup('Please enter a valid bet!');
        return;
    }
  
    if (bet > balance) {
        showErrorPopup('Your bet cannot be greater than your balance!');
        return;
    }

    isSpinning = true;

    balance -= bet; // Вычитаем ставку из баланса
    balanceDisplay.textContent = balance.toLocaleString(); // Форматируем баланс

    spinSlots().then((results) => {
        const combination = results.join('');
        const multiplier = winTable[combination] || checkTwoMatch(results) || 0; // Проверяем комбинацию

        if (multiplier > 0) {
            const winAmount = bet * multiplier;
            showWinPopup('🎉 You Win! 🎉', `+${winAmount.toLocaleString()} coins`);
            balance += winAmount;

            // Обновление статистики после выигрыша
            updateAccountStats(winAmount);
        } else {
            showWinPopup('Try Again!', 'No win this time');
        }

        balanceDisplay.textContent = balance.toLocaleString(); // Форматируем баланс
        isSpinning = false;
    });
}

// Функция обновления данных аккаунта в localStorage
function updateAccountStats(winAmount) {
    // Получаем текущего пользователя
    const currentUser = localStorage.getItem('currentUser');
    
    if (currentUser) {
        // Получаем текущие данные аккаунта
        const account = JSON.parse(localStorage.getItem(currentUser));

        // Обновляем баланс и максимальный выигрыш
        account.balance = balance; // Обновляем баланс

        if (winAmount > account.maxWin) {
            account.maxWin = winAmount; // Обновляем максимальный выигрыш, если текущий больше
        }

        // Сохраняем обновленные данные обратно в localStorage
        localStorage.setItem(currentUser, JSON.stringify(account));
    }
}



// Проверка двух одинаковых символов
function checkTwoMatch(results) {
    const [slot1, slot2, slot3] = results;

    if (slot1 === slot2) return twoMatchWin[slot1 + slot2] || 0;
    if (slot1 === slot3) return twoMatchWin[slot1 + slot3] || 0;
    if (slot2 === slot3) return twoMatchWin[slot2 + slot3] || 0;

    return 0;
}

// Функция для вращения слотов
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

// Функция для отображения всплывающего окна
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

// Функция для отображения ошибки
function showErrorPopup(message) {
    errorMessage.textContent = message;

    errorPopup.classList.add('show');

    setTimeout(() => {
      errorPopup.classList.remove('show');
    }, 2000);
}

// Функция изменения ставки
function changeBet(amount) {
    const bet = parseInt(betInput.value, 10);
    betInput.value = Math.max(1, parseInt(betInput.value, 10) + amount);
}

// Обработчик нажатия кнопки "Spin"
spinButton.addEventListener('click', startSpin);

// Обработчик нажатия пробела
window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        startSpin();
    }
});

// Функция установки максимальной ставки
function setMaxBet() {
    betInput.value = balance;
}

// Функция обновления отображения ставки
function updateBetDisplay() {
    betInput.value = bet;
}

updateBetDisplay();

document.getElementById('maxBetButton').addEventListener('click', function() {
    setMaxBet();
});

betInput.addEventListener('input', function() {
    if (parseInt(betInput.value, 10) > balance) {
      setMaxBet();
    }
});

// Показ статистики
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
