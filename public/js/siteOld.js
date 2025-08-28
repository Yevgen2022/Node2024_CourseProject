const divMessage = document.querySelector('#message');

document.querySelector('#form-register-user').onsubmit = async function (event) {
	divMessage.innerHTML = '';
	event.preventDefault();
	
	const email = event.target.elements.email.value;
	const pass = event.target.elements.password.value;
	console.log(email, pass);

	const headers = new Headers();
	headers.append("Content-Type", "application/x-www-form-urlencoded");

	let urlencoded = new URLSearchParams();
	urlencoded.append("email", email);
	urlencoded.append("pass", pass);

	let resp = await fetch('/reguser', {
		method: 'POST',
		headers: headers,
		body: urlencoded
	});

	const result = await resp.json();
	console.log(result);

	// switch (result.action) {
	// 	case 'user exists':
	// 		divMessage.innerHTML = 'User exists';
	// 		break;
	// 	case 'user was created':
	// 		this.reset();
	// 		divMessage.innerHTML = 'The user has been created. <a href="/login">Login to the site.</a>';
	// 		break;
switch ((result.action || '').toLowerCase()) {
  case 'user exists':
  case 'user already exists':
    divMessage.textContent = 'User exists';
    break;
  case 'user was created':
    this.reset();
    divMessage.innerHTML = 'The user has been created. <a href="/login">Login to the site.</a>';
    break;
  default:
    divMessage.textContent = result?.action || 'Unexpected response';

	}
}