const loginButton = document.querySelector('#loginButton');
loginButton.addEventListener('click', () => {
    const usernameField = document.querySelector('#username');
    localStorage.setItem('username', usernameField.value);
    window.location.href = 'play.html';
});