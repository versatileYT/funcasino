const supabaseUrl = 'https://gdhzpqaskoyvbfypfkfv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaHpwcWFza295dmJmeXBma2Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2Mjg3MjIsImV4cCI6MjA1MjIwNDcyMn0.eAe2kQUxRRin9WPjSCB9JyHGhPtUmBt4tyk-IkIRvD8'; // Replace with your Supabase key
const supabase = createClient(supabaseUrl, supabaseKey);

let balance = 1000;
let currentBet = 10;
let loggedIn = false;
let userId = null;  // Store the user's ID

document.getElementById('spinButton').addEventListener('click', spinSlot);
document.getElementById('statsButton').addEventListener('click', showStats);
document.getElementById('logoutButton').addEventListener('click', logout);
document.getElementById('signUpForm').addEventListener('submit', signUp);
document.getElementById('loginForm').addEventListener('submit', login);

async function signUp(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: username,
      password: password,
    });

    if (error) throw error;

    // Create a new user in the database with a default balance
    const { error: dbError } = await supabase.from('users').insert([
      { user_id: data.user.id, username, balance: 1000 }
    ]);
    if (dbError) throw dbError;

    alert('Account created successfully!');
    showLoginForm();
  } catch (err) {
    showError(err.message);
  }
}

async function login(event) {
  event.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (error) throw error;

    userId = data.user.id;
    loggedIn = true;
    updateUIAfterLogin();

    // Fetch user data from the database
    await fetchUserData();
  } catch (err) {
    showError(err.message);
  }
}

function updateUIAfterLogin() {
  document.getElementById('loginSection').classList.add('hidden');
  document.getElementById('spinButton').classList.remove('hidden');
  document.getElementById('statsButton').classList.remove('hidden');
  document.getElementById('logoutButton').classList.remove('hidden');
}

async function fetchUserData() {
  try {
    const { data, error } = await supabase.from('users').select('*').eq('user_id', userId);
    if (error) throw error;

    if (data.length > 0) {
      balance = data[0].balance;
      document.getElementById('balanceDisplay').textContent = balance;
    }
  } catch (err) {
    showError(err.message);
  }
}

async function showStats() {
  if (!loggedIn) {
    showError('You must be logged in to view stats!');
    return;
  }

  // Fetch user stats from the database (e.g., wins, losses)
  const { data, error } = await supabase.from('user_stats').select('*').eq('user_id', userId);
  if (error) {
    showError(error.message);
    return;
  }
  console.log(data); // Display user stats in the console (or update UI)
}

function logout() {
  supabase.auth.signOut().then(() => {
    loggedIn = false;
    userId = null;
    document.getElementById('logoutButton').classList.add('hidden');
    document.getElementById('spinButton').classList.add('hidden');
    document.getElementById('statsButton').classList.add('hidden');
    document.getElementById('loginSection').classList.remove('hidden');
  });
}

function showError(message) {
  document.getElementById('errorMessage').textContent = message;
  document.getElementById('errorPopup').classList.remove('hidden');
  setTimeout(() => document.getElementById('errorPopup').classList.add('hidden'), 3000);
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

