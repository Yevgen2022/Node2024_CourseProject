const divMessage = document.querySelector('#message');

document.querySelector('#form-login-user').onsubmit = async function (event) {
	divMessage.innerHTML = '';
	event.preventDefault();
	const email = event.target.elements.email.value;
	const pass = event.target.elements.password.value;
	console.log(email, pass);

	const headers = new Headers();
	headers.append("Content-Type", "application/x-www-form-urlencoded");

	var urlencoded = new URLSearchParams();
	urlencoded.append("email", email);
	urlencoded.append("pass", pass);

	let resp = await fetch('/login-user', {
		method: 'POST',
		headers: headers,
		body: urlencoded
	});

	const result = await resp.json();
	console.log(result);

	switch (result.action) {
		case 'user not found':
			divMessage.innerHTML = 'user not found';
			break;
		case 'You are logged in':
			document.cookie = result.cookie;
			divMessage.innerHTML = 'You are logged in';
			break;
		case 'user was created':
			this.reset();
			divMessage.innerHTML = 'The user has been created. <a href="/login">Login to the site.</a>';
			break;

	}
}