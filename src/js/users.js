// Hasta que el cliente no ha descargado todo y lo está mostrando, no cargamos jQuery.
// De esta manera evitamos que jQuery intente acceder a elementos del DOM que no se han renderizado todavía.
$(document).ready(function() {
  /***********************************************************************
   *                       INICIALIZACIÓN
   ***********************************************************************/

  // Obtenemos el token de sesión de localStorage, ya que es posible que el usuario se hubiera logado con anterioridad.
  var token = window.localStorage.getItem('token');
  var serverUrl = 'http://192.168.99.97:3000';

  // Definimos la variable donde la librería jquery.dataTables va a renderizar la tabla autogenerada, y configuramos
  // la tabla en función de nuestras necesidades.
  // En este caso, será una tabla de 5 columnas, la primera de ellas tendrá un botón que mostrará más información de la fila
  // en concreto que se haya desplegado y permitirá realizar más acciones.
  // Es importante destacar que el número de columnas definidas en esta configuración debe coincidir con el número de columnas
  // definidas en la tabla html que hay en users.html
  var usersTable = $('#tabla-usuarios').DataTable({
    columns: [
      {
        className: 'details-control',
        orderable: false,
        data: null,
        defaultContent: '',
      },
      { data: 'name' },
      { data: 'lastname' },
      { data: 'dni' },
      { data: 'email' },
      { data: 'department' },
    ],
  });

  /***********************************************************************
   *                       CHECKEO DE SEGURIDAD
   ***********************************************************************/

  // Comprobamos si hay token
  if (!token) {
    // En caso de que no haya token en localStorage, no estamos autenticados, por tanto, vamos al login
    window.location.replace('index.html');
  } else {
    // Si por el contrario hay un token, debemos comprobar su validez con una petición al servidor
    $.ajax({
      type: 'GET',
      url: serverUrl + '/check',
      data: { token },
      success: function() {
        // Si el token es válido, entonces hacemos una petición para obtener el listado de usuarios
        $.ajax({
          type: 'GET',
          beforeSend: function(request) {
            // Necesitamos añadir el token en la cabecera para que el servidor sepa que estamos autenticados
            request.setRequestHeader('token-seguro', token);
          },
          url: serverUrl + '/secure/users',
          error: function() {
            // Si hay cualquier tipo de error, por precaución vamos al login
            window.location.replace('index.html');
          },
          success: function(data) {
            // En caso de que todo haya ido bien, obtenemos la información que devuelve el servidor y con ello
            // repintamos la tabla de jquery.dataTables
            usersTable.rows.add(data.users).draw();
            console.log(data);
          },
        });
      },
      error: function() {
        // Si hay algún error comprobando el token, asumimos que hay un error de seguridad y redirigimos al usuario al login
        window.location.replace('index.html');
      },
    });
  }

  /***********************************************************************
   *                       FUNCIONES DE AYUDA
   ***********************************************************************/

  /**
   * Mediante esta función vamos a generar un elemento html que corresponde a la información extra de cada fila que se
   * mostrará en un desplegable cuando hagamos click en el botón de la derecha de cada fila con un símbolo (+).
   *
   * Esta es una acción que se permite hacer con jquery.datatables.
   *
   * En este elemento se mostrarán varios inputs donde se podrá editar toda la información del usuario, o eliminarlo completamente.
   * Para ello se añadirán 2 botones, uno para actualizar y otro para eliminar.
   *
   * Debido a que es una plantilla javascript, no podemos insertar comentarios. Se han puesto nombres explicativos que indican lo
   * necesario.
   *
   * Como la tabla contendrá muchas filas, es necesario que a cada identificador html dentro de esta plantilla se le añada el
   * identificador único que la base de datos asigna a cada usuario. De ese modo nos aseguramos que cada campo de datos es único,
   * y cada botón también.
   *
   * @param {Object} user la información del usuario fila que se despliega.
   */
  var renderChild = function(user) {
    return `
    <div class="user-info-wrapper">
      <div class="user-info">
        <div class="user-data">
          <div class="user-editable">
            <label for="name-${user._id}">Nombre</label>
            <input id="name-${user._id}" class="input-element" type="text" value="${user.name}"/>
          </div>
          <div class="user-editable">
            <label for="lastname-${user._id}">Apellido</label>
            <input id="lastname-${user._id}" class="input-element" type="text" value="${user.lastname}"/>
          </div>
          <div class="user-editable">
            <label for="dni-${user._id}">DNI</label>
            <input id="dni-${user._id}" class="input-element" type="text" value="${user.dni}"/>
          </div>
          <div class="user-editable">
            <label for="email-${user._id}">Email</label>
            <input id="email-${user._id}" class="input-element" type="email" value="${user.email}"/>
          </div>
          <div class="user-editable">
            <label for="department-${user._id}">Departamento</label>
            <select id="department-${user._id}" class="input-element">
              <option value="RRHH">RRHH</option>
              <option value="FINANCIERO">FINANCIERO</option>
              <option value="IT">IT</option>
              <option value="DIRECTIVO">DIRECTIVO</option>
            </select>
          </div>
        </div>
        <div class="user-actions">
          <div class="user-update">
            <div class="button-wrapper">
              <img class="button-img" id="update-${user._id}" src="images/update.png" alt="Actualizar"/>
              <div>Actualizar</div>
            </div>
          </div>
          <div class="user-delete">
            <div class="button-wrapper">
              <img class="button-img" id="delete-${user._id}" src="images/delete.png" alt="Borrar"/>
              <div>Borrar</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;
  };

  /**
   * Función que crea un usuario en la base de datos
   */
  var createUser = function() {
    // El primer paso es obtener del DOM los valores que el usuario ha introducido en los campos de añadir usuario en la parte
    // superior de la aplicación
    var name = $('#user-add-name').val();
    var lastname = $('#user-add-lastname').val();
    var dni = $('#user-add-dni').val();
    var email = $('#user-add-email').val();
    var department = $('#user-add-department').val();

    // Ahora ejecutamos una petición al servidor que creará el usuario
    $.ajax({
      type: 'POST',
      beforeSend: function(request) {
        // Enviamos el token en una cabecera para securizar la petición
        request.setRequestHeader('token-seguro', token);
      },
      url: serverUrl + '/secure/users',
      data: {
        name,
        lastname,
        dni,
        email,
        department,
      },
      success: function() {
        $.ajax({
          type: 'GET',
          beforeSend: function(request) {
            request.setRequestHeader('token-seguro', token);
          },
          url: serverUrl + '/secure/users',
          success: function(data) {
            // Si la función se ha ejecutado correctamente, primero reseteamos los input de creación de usuario.
            $('#user-add-name').val('');
            $('#user-add-lastname').val('');
            $('#user-add-dni').val('');
            $('#user-add-email').val('');
            $('#user-add-department').val('RRHH');
            // Por último eliminamos el contenido actual de la tabla y añadimos el obtenido del servidor
            usersTable.clear().draw();
            usersTable.rows.add(data.users).draw();
            console.log(data);
          },
        });
      },
    });
  };

  /**
   * Función que recibe un identificador de usuario, y gracias a este obtiene todos los elementos del DOM
   * con jQuery correspondientes a ese id y actualiza ese usuario.
   *
   * @param {String} id El identificador de usuario que se va a actualizar.
   */
  var updateUser = function(id) {
    // Primero obtenemos todos los valores de los input correspondientes a ese usuario
    var name = $('#name-' + id).val();
    var lastname = $('#lastname-' + id).val();
    var dni = $('#dni-' + id).val();
    var email = $('#email-' + id).val();
    var department = $('#department-' + id).val();

    // A continuación ejecutamos una llamada al servidor para actualizar ese usuario.
    // La URL contendrá el id de usuario a modificar y se envía como data la información del usuario que se va a
    // modificar en base de datos
    $.ajax({
      type: 'PUT',
      beforeSend: function(request) {
        // Enviamos el token en una cabecera para securizar la petición
        request.setRequestHeader('token-seguro', token);
      },
      url: serverUrl + '/secure/users/' + id,
      data: {
        name,
        lastname,
        dni,
        email,
        department,
      },
      error: function() {
        // En caso de que haya un error, lo mostramos por la consola.
        console.log('No se pudo actualizar el usuario');
      },
      success: function() {
        // Si el usuario se ha actualizado correctamente, tenemos que actualizar la tabla. La manera más segura es volver a
        // obtener todo el listado de usuarios.
        $.ajax({
          type: 'GET',
          beforeSend: function(request) {
            // Enviamos el token en una cabecera para securizar la petición.
            request.setRequestHeader('token-seguro', token);
          },
          url: serverUrl + '/secure/users',
          success: function(data) {
            // Si la petición funciona correctamente, borramos el contenido actual de la tabla y pintamos el nuevo contenido.
            usersTable.clear().draw();
            usersTable.rows.add(data.users).draw();
            console.log(data);
          },
        });
      },
    });
  };

  /**
   * Función utilizada para borrar un usuario de la base de datos
   *
   * @param {String} id identificador del usuario a borrar
   */
  var deleteUser = function(id) {
    // Ejecutamos una petición que eliminará el usuario de base de datos.
    $.ajax({
      type: 'DELETE',
      beforeSend: function(request) {
        // Enviamos el token en una cabecera para securizar la petición
        request.setRequestHeader('token-seguro', token);
      },
      url: serverUrl + '/secure/users/' + id,
      error: function() {
        // Si hay cualquier error, mostramos un mensaje
        console.log('No se pudo borrar el usuario');
      },
      success: function() {
        // En caso de que la petición se ejecute correctamente, tenemos que obtener el listado actualizado de usuarios.
        $.ajax({
          type: 'GET',
          beforeSend: function(request) {
            // Enviamos el token en una cabecera para securizar la petición
            request.setRequestHeader('token-seguro', token);
          },
          url: serverUrl + '/secure/users',
          success: function(data) {
            // Si el listado se obtiene correctamente, borramos el contenido actual de la tabla y pintamos el que obtenemos
            // del servidor
            usersTable.clear().draw();
            usersTable.rows.add(data.users).draw();
            console.log(data);
          },
        });
      },
    });
  };

  /***********************************************************************
   *                       ASIGNACIÓN DE EVENTOS
   ***********************************************************************/

  // Con jQuery, asignamos una acción para cuando el usuario haga click en el botón de logout.
  $('#button-logout').on('click', function() {
    // Esta acción borrará el token de seguridad de localStorage y nos redirigirá al login de la aplicación.
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  });

  // Añadimos al botón de Añadir usuario del html una acción cuando el usuario haga click
  $('#user-add-button').on('click', createUser);

  // Tenemos que añadir la funcionalidad de desplegar la información extra de cada fila. Para ello,
  // Obtenemos con jQuery todos los botones de mostrar información con el símbolo (+) y les asignamos una acción
  // cuando el usuario haga click
  $('#tabla-usuarios tbody').on('click', 'td.details-control', function() {
    // En esta acción obtenemos con jQuery, del elemento clickado (this), su elemento 'tr' más cercano. Esto es la fila
    // correspondiente al elemento que se ha hecho click
    var tr = $(this).closest('tr');
    // Gracias a jquery datatables podemos obtener la información de esa fila, que corresponde a la información del usuario
    // del que queremos ver más información o realizar alguna acción
    var row = usersTable.row(tr);

    // En función de si estamos visualizando o no la información, mostraremos u ocultaremos el contenido
    if (row.child.isShown()) {
      // En caso de que se esté mostrando el contenido, lo ocultamos con jQuery con un efecto de desplazamiento hacia arriba
      $('.user-info-wrapper', row.child()).slideUp(function() {
        // Cuando la fila se ha ocultado, indicamos a jquery datatables que esa fila está oculta.
        row.child.hide();
        tr.removeClass('shown');
      });
    } else {
      // En caso de que esté oculta la información, asignamos un hijo a esa fila. Dicho hijo (child) será nuestra plantilla que
      // la función 'renderChild' que implementamos anteriormente nos devuelve, en este caso con la información (rowData) del usuario
      // y una vez asignado ese hijo, lo mostramos.
      var rowData = row.data();
      row.child(renderChild(rowData), 'no-padding').show();

      // Una vez que el código de la plantilla se está mostrando en el DOM, podemos ejecutar acciones de jQuery sobre el. En este caso
      // tenemos que poner el valor referente al departamento, que al tratarse de un elemento select-options es más sencillo hacerlo
      // en este punto, que en la plantilla
      $('#department-' + rowData._id).val(rowData.department);

      // Añadimos estilos necesarios para mostrar el contenido de una manera más amigable para el usuario
      tr.addClass('shown');

      // Con jQuery, añadimos un efecto de desplazamiento hacia abajo para mostrar el contenido
      $('.user-info-wrapper', row.child()).slideDown();

      // Al botón de Actualizar que se está mostrando en la información desplegada, le añadimos la acción de actualizar usuario
      // pasando el identificador de la fila como parámetro
      var updateButtonId = 'update-' + rowData._id;
      $('#' + updateButtonId).on('click', function() {
        updateUser(rowData._id);
      });

      // Al botón de Eliminar que se está mostrando en la información desplegada, le añadimos la acción de eliminar usuario
      // pasando el identificador de la fila como parámetrovar deleteButtonId = 'delete-' + rowData._id;
      var deleteButtonId = 'delete-' + rowData._id;
      $('#' + deleteButtonId).on('click', function() {
        deleteUser(rowData._id);
      });
    }
  });

  // Fin de función de document.ready
});
