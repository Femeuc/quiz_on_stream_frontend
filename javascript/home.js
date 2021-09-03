const username = document.querySelector('#username-input');
const loginButton = document.querySelector('#login-button');

loginButton.addEventListener('click', event => {
    window.open('jogos.html', '_self');
    localStorage['username'] = username.value.toLowerCase(); // only strings
})