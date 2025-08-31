

document.getElementById('logoutLink')?.addEventListener('click', async (e) => {
    e.preventDefault();
    
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',           // щоб надіслати cookie
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
    } finally {
      // навіть якщо мережа впала — просто ведемо на /login
      window.location.href = '/login';
    }
  });