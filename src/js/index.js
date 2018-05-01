// Hasta que el cliente no ha descargado todo y lo está mostrando, no cargamos jQuery.
// De esta manera evitamos que jQuery intente acceder a elementos del DOM que no se han renderizado todavía.
$(document).ready(function() {
  /***********************************************************************
   *                       INICIALIZACIÓN
   ***********************************************************************/

  // Obtenemos el token de sesión de localStorage, ya que es posible que el usuario se hubiera logado con anterioridad.
  var token = window.localStorage.getItem('token');
  var serverUrl = 'http://192.168.99.97:3000';

  /***********************************************************************
   *                       CHECKEO DE SEGURIDAD
   ***********************************************************************/

  if (token) {
    // Si el token existe, comprobamos su validez ejecutando una llamada al servidor.
    $.ajax({
      type: 'GET',
      url: serverUrl + '/check',
      data: { token },
      success: function() {
        // En caso de que sea válido, vamos al contenido securizado de la aplicación.
        window.location.replace('users.html');
      },
      error: function() {
        // Si no es válido, no tiene sentido mantener ese token, por lo que lo borramos de localStorage.
        localStorage.removeItem('token');
      },
    });
  }

  /***********************************************************************
   *                       FUNCIONES DE AYUDA
   ***********************************************************************/

  /**
   * Función que permite logar a un usuario en la aplicación mediante una petición al servidor que
   * comprobará la validez del usuario
   */
  var login = function() {
    // Obtenemos los datos de los inputs del html correspondiente a usuario y password
    var usuario = $('#login-username').val();
    var password = $('#login-password').val();

    // Hacemos una petición al servidor con estos datos para realizar un intento de autenticación
    $.ajax({
      type: 'POST',
      url: serverUrl + '/login',
      data: { usuario, password },
      success: function(data) {
        // Si el servidor devuelve que el login es correcto, devolverá un token de sesión, el cual almacenaremos en localStorage.
        window.localStorage.setItem('token', data.token);
        // Por último, vamos a la página securizada de la aplicación.
        window.location.replace('users.html');
      },
      error: function() {
        // En caso de que el usuario no exista, o la contraseña sea incorrecta, mostramos un mensaje y no pasará nada más.
        console.log('Login error');
      },
    });
  };

  /***********************************************************************
   *                       ASIGNACIÓN DE EVENTOS
   ***********************************************************************/

  // Asignamos al botón de login una acción para cuando un usuario haga click.
  $('#login-button').click(login);
});
