// Регистрация нового пользователя
function register() {
  const username = document.getElementById('username').value;
  if (username) {
    const account = {
      username: username,
      balance: 0, // Начальный баланс
      maxWin: 0
    };
    localStorage.setItem(username, JSON.stringify(account));
    alert('Account created!');
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
  } else {
    alert('Please enter a username.');
  }
}

// Вход в систему
function login() {
  const username = document.getElementById('loginUsername').value;
  const account = JSON.parse(localStorage.getItem(username));

  if (account) {
    localStorage.setItem('currentUser', username);
    window.location.href = 'index.html';  // Перенаправление на страницу казино
  } else {
    alert('Account not found.');
  }
}

// Отображение приветственного сообщения после входа
function showWelcomeMessage(account) {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('welcomeMessage').style.display = 'block';
  document.getElementById('userBalance').textContent = `Balance: ${account.balance} coins`;
  document.getElementById('userMaxWin').textContent = `Max Win: ${account.maxWin} coins`;
}

// Выход из аккаунта
function logout() {
  localStorage.removeItem('currentUser');
  document.getElementById('welcomeMessage').style.display = 'none';
  document.getElementById('loginForm').style.display = 'block';
}

// Проверка, если пользователь уже вошел
const currentUser = localStorage.getItem('currentUser');
if (currentUser) {
  const account = JSON.parse(localStorage.getItem(currentUser));
  showWelcomeMessage(account);
}
