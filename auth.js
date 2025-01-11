// Обработчики для переключения между формами
document.getElementById('showLogin').addEventListener('click', function() {
  document.getElementById('signUpSection').classList.add('hidden');
  document.getElementById('loginSection').classList.remove('hidden');
});

document.getElementById('showSignUp').addEventListener('click', function() {
  document.getElementById('loginSection').classList.add('hidden');
  document.getElementById('signUpSection').classList.remove('hidden');
});

// Обработчик регистрации
document.getElementById('signUpForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Проверка на существование аккаунта
  if (localStorage.getItem(username)) {
      alert('Account already exists!');
      return;
  }

  // Создание нового пользователя
  const newUser = {
      username,
      password,
      balance: 1000,
      luckBonus: 1,
      maxWin: 0,
      promoApplied: false
  };

  // Сохранение аккаунта
  localStorage.setItem(username, JSON.stringify(newUser));

  alert('Account created successfully!');
  document.getElementById('signUpSection').classList.add('hidden');
  document.getElementById('loginSection').classList.remove('hidden');
});

// Обработчик входа в систему
document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  const account = JSON.parse(localStorage.getItem(username));

  // Проверка, существует ли аккаунт
  if (!account) {
      alert('Account does not exist!');
      return;
  }

  // Проверка правильности пароля
  if (account.password !== password) {
      alert('Incorrect password!');
      return;
  }

  // Сохранение имени пользователя в localStorage
  localStorage.setItem('currentUser', username);
  alert('Login successful!');
  window.location.href = 'index.html'; // Перенаправление на главную страницу
});

document.addEventListener('DOMContentLoaded', function() {
  // Убедитесь, что элементы существуют
  const showLoginButton = document.getElementById('showLogin');
  const showSignUpButton = document.getElementById('showSignUp');
  const signUpForm = document.getElementById('signUpForm');
  const loginForm = document.getElementById('loginForm');

  if (showLoginButton && showSignUpButton && signUpForm && loginForm) {
    // Ваши обработчики событий
    showLoginButton.addEventListener('click', function() {
      document.getElementById('signUpSection').classList.add('hidden');
      document.getElementById('loginSection').classList.remove('hidden');
    });

    showSignUpButton.addEventListener('click', function() {
      document.getElementById('loginSection').classList.add('hidden');
      document.getElementById('signUpSection').classList.remove('hidden');
    });

    signUpForm.addEventListener('submit', function(event) {
      event.preventDefault();
      // Логика регистрации
    });

    loginForm.addEventListener('submit', function(event) {
      event.preventDefault();
      // Логика входа
    });
  } else {
    console.error('Элементы не найдены');
  }
});


// Обновление баланса
function updateBalance(amount) {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    const account = JSON.parse(localStorage.getItem(currentUser));
    account.balance += amount; // Изменяем баланс

    // Обновляем баланс в localStorage
    localStorage.setItem(currentUser, JSON.stringify(account));

    // Обновляем отображение баланса
    document.getElementById('balanceDisplay').textContent = account.balance;

    // Обновляем статистику (например, maxWin)
    updateStatistics();
  }
}

// Обновление статистики
function updateStatistics() {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    const account = JSON.parse(localStorage.getItem(currentUser));
    
    // Пример: если баланс изменился, обновляем maxWin
    if (account.balance > account.maxWin) {
      account.maxWin = account.balance; // Пример, обновить статистику
    }

    // Обновляем статистику в localStorage
    localStorage.setItem(currentUser, JSON.stringify(account));

    // Отображаем статистику (например, maxWin)
    document.getElementById('maxWinDisplay').textContent = account.maxWin;
  }
}
