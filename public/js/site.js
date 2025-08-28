const divMessage = document.querySelector('#message');

document.querySelector('#form-register-user').onsubmit = async function (event) {
  divMessage.innerHTML = '';
  event.preventDefault();

  const email = event.target.elements.email.value.trim();
  const pass  = event.target.elements.password.value;

  const body = new URLSearchParams();
  body.append('email', email);
  body.append('pass', pass);

  try {
    const resp = await fetch('/reguser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });

    // читаємо тіло ОДИН раз
    let data = null;
    try { data = await resp.json(); } catch (_) {}

    if (!resp.ok) {
      // помилка
      if (data?.code === 'USER_EXISTS') {
        divMessage.textContent = 'User exists';
        return;
      }
      divMessage.textContent = data?.message || `Error ${resp.status}`;
      return;
    }

    // успіх
    if (data?.code === 'USER_CREATED') {
      this.reset();
      divMessage.innerHTML = 'The user has been created. <a href="/login">Login to the site.</a>';
    } else {
      divMessage.textContent = 'Unexpected response';
    }
  } catch (err) {
    console.error(err);
    divMessage.textContent = 'Network/JS error';
  }
};
