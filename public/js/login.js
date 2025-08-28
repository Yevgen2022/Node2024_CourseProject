const form = document.getElementById('form-login-user');
const msg  = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = '';

  const email = e.target.elements.email.value.trim();
  const pass  = e.target.elements.password.value;

  const body = new URLSearchParams();
  body.append('email', email);
  body.append('pass', pass);

  try {
    const resp = await fetch('/login-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      // credentials: 'include' // розкоментуй, якщо бек на іншому домені/порті і використовує куки
    });

    const ct = resp.headers.get('content-type') || '';
    const data = ct.includes('application/json') ? await resp.json() : null;

    if (!resp.ok) {
      const code =
        data?.code ||
        (typeof data?.action === 'string' ? data.action.toUpperCase().replace(/\s+/g, '_') : '');

      if (code === 'INVALID_CREDENTIALS' || code === 'USER_NOT_FOUND') {
        msg.textContent = 'user not found';
      } else {
        msg.textContent = data?.message || `Error ${resp.status}`;
      }
      return;
    }

    // Успіх
    if (data?.code === 'LOGGED_IN' || data?.action === 'You are logged in') {
      msg.textContent = 'You are logged in';
      // За потреби: window.location.href = '/admin';
      return;
    }

    // На випадок, якщо бек поверне створення юзера (сумісність зі старою логікою)
    if (data?.code === 'USER_CREATED' || data?.action === 'user was created') {
      form.reset();
      msg.innerHTML = 'The user has been created. <a href="/login">Login to the site.</a>';
      return;
    }

    msg.textContent = 'Unexpected response';
  } catch (err) {
    console.error(err);
    msg.textContent = 'Network/JS error';
  }
});
