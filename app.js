
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

  if (window.navigator.onLine) {
    console.log('El navegador está conectado a Internet');
  } else {
    console.log('El navegador NO está conectado a Internet');
        // Mostrar los datos del último código postal consultado en caso de falta de conexión
        showLastCodigoPostal();

  }

  function informacion_cp() {
      if (window.navigator.onLine) {
          $.ajax({
              url: 'https://api.copomex.com/query/info_cp/' + $("#codigo_postal").val(),
              data: {
                  // token: $("#token").val(),
                  token: "pruebas",
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
                      console.log("No hay conexion");
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
        console.log("No hay conexion para mostrar los datos")
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
          console.log("los datos son : " + copomexData.cp, copomexData.ciudad, copomexData.estado); // Agregar esta línea
      };

  }



  function showLastCodigoPostal() {
      const request = indexedDB.open('PostalFinderDB', 1);

      // request.onupgradeneeded = function (event) {
      //     // Este bloque de código es necesario para la creación de la base de datos, pero no es necesario repetirlo aquí
      // };

      request.onsuccess = function (event) {
          const db = event.target.result;
          const transaction = db.transaction(['codigosPostales'], 'readonly');
          const store = transaction.objectStore('codigosPostales');
          const getRequest = store.get(1);

          getRequest.onsuccess = function (event) {
              const result = event.target.result;

              if (result && result.copomexData) {
                const copomexData = result.copomexData;
                const dataDiv = document.getElementById('data');
                dataDiv.innerHTML = JSON.stringify(copomexData);
                // $("#codigo_postal").val(copomexData.cp);
                // $("#tipo_asentamiento").val(copomexData.tipo_asentamiento);
                // $("#municipio").val(copomexData.municipio);
                // $("#estado").val(copomexData.estado);
                // $("#ciudad").val(copomexData.ciudad);
                // $("#pais").val(copomexData.pais);

                // $("#list_colonias").html('');
                // for (let i = 0; i < copomexData.asentamiento.length; i++) {
                //     $("#list_colonias").append('<option>' + copomexData.asentamiento[i] + '</option>');
                // }

                console.log("Funcion de mostrar codigo postal guardado")
                console.log("los datos son : " + copomexData.cp, copomexData.ciudad, copomexData.estado); 

                
              }
          };
      };
  }

  $(document).ready(function() {
    $('#send').on('click', function(e) {
      if (navigator.onLine) {
        $.ajax({
          type: "get",
          url: 'https://api.copomex.com/query/info_cp/' + $("#codigo_postal").val(),
          datatype: 'json',
          success: function(response) {
            var content_html = '<img src="' + response.message + '"/>';
            $('#images').html(content_html);
          },
          error: function(error) {
            console.log(e.message);
          },
          complete: function(data) {
            console.log(data);
            notificacion($('#codigo_postal').val(), data.responseJSON.message)
          }
        });
      } else {
        console.info('Sin conexión a internet');
      }
    });
  
    $('#notificaciones').on('click', function(e) {
      Notification.requestPermission().then(function(result) {
        if (result === "granted") {
          randomNotification();
        }
      });
    });
  });