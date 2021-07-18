const username = document.querySelector('#username-input');
const loginButton = document.querySelector('#login-button');

loginButton.addEventListener('click', event => {
    window.open('filters.html', '_self');
    localStorage['username'] = username.value.toLowerCase(); // only strings
})