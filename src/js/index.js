$(document).ready(function() {
  var token = window.localStorage.getItem('token');
  if (token) {
    $.ajax({
      type: 'GET',
      url: 'http://localhost:3000/check',
      data: { token },
      success: function() {
        window.location.replace('users.html');
      },
      error: function() {
        localStorage.removeItem('token');
      },
    });
  }
  $('#login-button').click(function() {
    $.ajax({
      type: 'POST',
      url: 'http://localhost:3000/login',
      data: { usuario: $('#login-username').val(), password: $('#login-password').val() },
      success: function(data) {
        window.localStorage.setItem('token', data.token);
        window.location.replace('users.html');
      },
      error: function() {
        console.log('Login error');
      },
    });
  });
});
