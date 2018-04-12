$(document).ready(function() {
  var token = window.localStorage.getItem('token');

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

  if (!token) {
    window.location.replace('index.html');
  } else {
    $.ajax({
      type: 'GET',
      url: 'http://localhost:3000/check',
      data: { token },
      success: function() {
        $.ajax({
          type: 'GET',
          beforeSend: function(request) {
            request.setRequestHeader('token-seguro', token);
          },
          url: 'http://localhost:3000/secure/users',
          error: function() {
            window.location.replace('index.html');
          },
          success: function(data) {
            usersTable.rows.add(data.users).draw();
            console.log(data);
          },
        });
      },
      error: function() {
        window.location.replace('index.html');
      },
    });
  }

  $('#button-logout').on('click', function() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  });

  var renderChild = function(data) {
    return `
    <div class="user-info-wrapper">
      <div class="user-info">
        <div class="user-data">
          <div class="user-editable">
            <label for="name-${data._id}">Nombre</label>
            <input id="name-${data._id}" class="input-element" type="text" value="${data.name}"/>
          </div>
          <div class="user-editable">
            <label for="lastname-${data._id}">Apellido</label>
            <input id="lastname-${data._id}" class="input-element" type="text" value="${data.lastname}"/>
          </div>
          <div class="user-editable">
            <label for="dni-${data._id}">DNI</label>
            <input id="dni-${data._id}" class="input-element" type="text" value="${data.dni}"/>
          </div>
          <div class="user-editable">
            <label for="email-${data._id}">Email</label>
            <input id="email-${data._id}" class="input-element" type="email" value="${data.email}"/>
          </div>
          <div class="user-editable">
            <label for="department-${data._id}">Departamento</label>
            <select id="department-${data._id}" class="input-element">
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
              <img class="button-img" id="update-${data._id}" src="images/update.png" alt="Actualizar"/>
              <div>Actualizar</div>
            </div>
          </div>
          <div class="user-delete">
            <div class="button-wrapper">
              <img class="button-img" id="delete-${data._id}" src="images/delete.png" alt="Borrar"/>
              <div>Borrar</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;
  };

  var updateUser = function(id) {
    var name = $('#name-' + id).val();
    var lastname = $('#lastname-' + id).val();
    var dni = $('#dni-' + id).val();
    var email = $('#email-' + id).val();
    var department = $('#department-' + id).val();

    $.ajax({
      type: 'PUT',
      beforeSend: function(request) {
        request.setRequestHeader('token-seguro', token);
      },
      url: 'http://localhost:3000/secure/users/' + id,
      data: {
        name,
        lastname,
        dni,
        email,
        department,
      },
      error: function() {
        console.log('No se pudo actualizar el usuario');
      },
      success: function() {
        $.ajax({
          type: 'GET',
          beforeSend: function(request) {
            request.setRequestHeader('token-seguro', token);
          },
          url: 'http://localhost:3000/secure/users',
          success: function(data) {
            usersTable.clear().draw();
            usersTable.rows.add(data.users).draw();
            console.log(data);
          },
        });
      },
    });
  };

  var deleteUser = function(id) {
    $.ajax({
      type: 'DELETE',
      beforeSend: function(request) {
        request.setRequestHeader('token-seguro', token);
      },
      url: 'http://localhost:3000/secure/users/' + id,
      error: function() {
        console.log('No se pudo borrar el usuario');
      },
      success: function() {
        $.ajax({
          type: 'GET',
          beforeSend: function(request) {
            request.setRequestHeader('token-seguro', token);
          },
          url: 'http://localhost:3000/secure/users',
          success: function(data) {
            usersTable.clear().draw();
            usersTable.rows.add(data.users).draw();
            console.log(data);
          },
        });
      },
    });
  };

  $('#tabla-usuarios tbody').on('click', 'td.details-control', function() {
    var tr = $(this).closest('tr');
    var row = usersTable.row(tr);

    if (row.child.isShown()) {
      $('.user-info-wrapper', row.child()).slideUp(function() {
        row.child.hide();
        tr.removeClass('shown');
      });
    } else {
      var rowData = row.data();
      row.child(renderChild(rowData), 'no-padding').show();
      $('#department-' + rowData._id).val(rowData.department);
      tr.addClass('shown');

      $('.user-info-wrapper', row.child()).slideDown();

      var updateButtonId = 'update-' + rowData._id;
      $('#' + updateButtonId).on('click', function() {
        updateUser(rowData._id);
      });

      var deleteButtonId = 'delete-' + rowData._id;
      $('#' + deleteButtonId).on('click', function() {
        deleteUser(rowData._id);
      });
    }
  });

  $('#user-add-button').on('click', function() {
    var name = $('#user-add-name').val();
    var lastname = $('#user-add-lastname').val();
    var dni = $('#user-add-dni').val();
    var email = $('#user-add-email').val();
    var department = $('#user-add-department').val();
    $.ajax({
      type: 'POST',
      beforeSend: function(request) {
        request.setRequestHeader('token-seguro', token);
      },
      url: 'http://localhost:3000/secure/users',
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
          url: 'http://localhost:3000/secure/users',
          success: function(data) {
            $('#user-add-name').val('');
            $('#user-add-lastname').val('');
            $('#user-add-dni').val('');
            $('#user-add-email').val('');
            $('#user-add-department').val('RRHH');
            usersTable.clear().draw();
            usersTable.rows.add(data.users).draw();
            console.log(data);
          },
        });
      },
    });
  });
});
