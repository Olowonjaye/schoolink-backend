// ✅ Option 2: Create a new file called login.js
// This is preferred to keep login logic separate from student logic

document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      // Store token in localStorage
      localStorage.setItem('token', data.token);

      alert('✅ Login successful');

      // Redirect to dashboard or student management page
      window.location.href = 'students.html';
    } else {
      alert(`❌ Login failed: ${data.error}`);
    }
  } catch (err) {
    console.error('Login error:', err);
    alert('❌ Could not connect to the server.');
  }
});
