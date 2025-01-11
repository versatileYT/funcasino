// Инициализация Supabase
import { createClient } from '@supabase/supabase-js'
const { createClient } = supabase;
const supabaseUrl = 'https://gdhzpqaskoyvbfypfkfv.supabase.co'; // URL твоего Supabase проекта
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaHpwcWFza295dmJmeXBma2Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2Mjg3MjIsImV4cCI6MjA1MjIwNDcyMn0.eAe2kQUxRRin9WPjSCB9JyHGhPtUmBt4tyk-IkIRvD8'; // Твой Supabase API ключ
const supabase = createClient(supabaseUrl, supabaseKey);

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
document.getElementById('signUpForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Проверка на существование аккаунта
  const { data: existingUser, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (existingUser) {
    alert('Account already exists!');
    return;
  }

  // Создание нового пользователя
  const { data, error: insertError } = await supabase
    .from('users')
    .insert([
      { username, password, balance: 1000, luckBonus: 1, maxWin: 0, promoApplied: false }
    ]);

  if (insertError) {
    alert('Error creating account!');
    return;
  }

  alert('Account created successfully!');
  document.getElementById('signUpSection').classList.add('hidden');
  document.getElementById('loginSection').classList.remove('hidden');
});

// Обработчик входа в систему
document.getElementById('loginForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  const { data: account, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (!account) {
    alert('Account does not exist!');
    return;
  }

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
async function updateBalance(amount) {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    const { data: account, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', currentUser)
      .single();

    if (account) {
      account.balance += amount; // Изменяем баланс

      // Обновляем баланс в базе данных
      const { error: updateError } = await supabase
        .from('users')
        .update({ balance: account.balance })
        .eq('username', currentUser);

      if (updateError) {
        alert('Error updating balance!');
        return;
      }

      // Обновляем отображение баланса
      document.getElementById('balanceDisplay').textContent = account.balance;

      // Обновляем статистику (например, maxWin)
      updateStatistics();
    }
  }
}

// Обновление статистики
async function updateStatistics() {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    const { data: account, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', currentUser)
      .single();

    if (account) {
      // Пример: если баланс изменился, обновляем maxWin
      if (account.balance > account.maxWin) {
        account.maxWin = account.balance; // Пример, обновить статистику
      }

      // Обновляем статистику в базе данных
      const { error: updateError } = await supabase
        .from('users')
        .update({ maxWin: account.maxWin })
        .eq('username', currentUser);

      if (updateError) {
        alert('Error updating statistics!');
        return;
      }

      // Отображаем статистику (например, maxWin)
      document.getElementById('maxWinDisplay').textContent = account.maxWin;
    }
  }
}

document.getElementById('signUpForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Регистрация в Supabase
  const { data, error } = await supabase
    .from('users')
    .insert([{ username, password }]);

  if (error) {
    alert('Error creating account: ' + error.message);
    return;
  }

  alert('Account created successfully!');
  document.getElementById('signUpSection').classList.add('hidden');
  document.getElementById('loginSection').classList.remove('hidden');
});

document.getElementById('loginForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  // Проверка пользователя в Supabase
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single();

  if (error || !data) {
    alert('Invalid username or password');
    return;
  }

  // Сохранение имени пользователя в localStorage
  localStorage.setItem('currentUser', username);
  alert('Login successful!');
  window.location.href = 'index.html'; // Перенаправление на главную страницу
});
