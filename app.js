let intro = document.querySelector('.intro');
let logo = document.querySelector('.logo-header');
let logoSpan = document.querySelectorAll('.logo');

window.addEventListener('DOMContentLoaded', () => {

    setTimeout(() => {

        logoSpan.forEach((span, idx) => {
            setTimeout(() => {
                span.classList.add('active');
            }, (idx + 1) * 400)
        });

        setTimeout(() => {
            logoSpan.forEach((span, idx) => {

                setTimeout(() => {
                    span.classList.remove('active');
                    span.classList.add('fade');
                }, (idx + 1) * 50)
            })
        }, 2000);

        setTimeout(() => {
            intro.style.top = '-100vh';
        }, 2300)
    })
})

function informacion_cp() {
    if (navigator.onLine) {
        $.ajax({
            url: 'https://api.copomex.com/query/info_cp/' + $("#codigo_postal").val(),
            data: {
                token: $("#token").val(),
                type: 'simplified'
            },
            type: 'GET',
            dataType: 'json',
            success: function (copomex) {
                if (!copomex.error) {
                    $("#cp_response").val(copomex.response.cp);
                    $("#tipo_asentamiento").val(copomex.response.tipo_asentamiento);
                    $("#municipio").val(copomex.response.municipio);
                    $("#estado").val(copomex.response.estado);
                    $("#ciudad").val(copomex.response.ciudad);
                    $("#pais").val(copomex.response.pais);

                    $("#list_colonias").html('');
                    for (var i = 0; i < copomex.response.asentamiento.length; i++) {
                        $("#list_colonias").append('<option>' + copomex.response.asentamiento[i] + '</option>');
                    }

                    // Guardar el último código postal consultado en IndexedDB
                    saveLastCodigoPostalToDB(copomex.response);
                } else {
                    console.log('error: ' + copomex.error_message);
                }
            },
            error: function (jqXHR, status, error) {
                if (jqXHR.status == 400) {
                    copomex = jqXHR.responseJSON;
                    alert(copomex.error_message);
                }
            },
            complete: function (jqXHR, status) {
                console.log('Petición a COPOMEX terminada');
            }
        });
    } else {
        // Mostrar los datos del último código postal consultado en caso de falta de conexión
        showLastCodigoPostal();
    }
}

// Función para guardar el último código postal consultado en IndexedDB
function saveLastCodigoPostalToDB(copomexData) {
    const request = indexedDB.open('PostalFinderDB', 1);

    request.onupgradeneeded = function (event) {
        const db = event.target.result;
        const store = db.createObjectStore('codigosPostales', { keyPath: 'id' });
        store.add({ id: 1, copomexData: copomexData });
    };

    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(['codigosPostales'], 'readwrite');
        const store = transaction.objectStore('codigosPostales');
        store.put({ id: 1, copomexData: copomexData });
    };
}



function showLastCodigoPostal() {
    const request = indexedDB.open('PostalFinderDB', 1);

    request.onupgradeneeded = function (event) {
        // Este bloque de código es necesario para la creación de la base de datos, pero no es necesario repetirlo aquí
    };

    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(['codigosPostales'], 'readonly');
        const store = transaction.objectStore('codigosPostales');
        const getRequest = store.get(1);

        getRequest.onsuccess = function (event) {
            const result = event.target.result;

            if (result) {
                // Mostrar los datos del último código postal en los campos correspondientes
                $("#codigo_postal").val(result.codigoPostal);
                // También puedes mostrar los demás campos si es necesario
            }
        };
    };
}

$('#send').on('click',function(e){
  $.ajax({
          type: "get",
            url: 'https://api.copomex.com/query/info_cp/' + $("#codigo_postal").val(),
          datatype : 'json',
          success: function(response)
          {
             var content_html = '<img src="'+response.message+'"/>'
             $('#images').html(content_html);
         },
         error:function(error){
          console.log(e.message);
         },
         complete: function(data){
          console.log(data);
          notificacion($('#codigo_postal').val(), data.responseJSON.message)

         }
      });
})

$('#notificaciones').on('click', function (e){
  Notification.requestPermission().then(function (result){
      if (result === "granted"){
          randomNotification();
      }
  });
})

