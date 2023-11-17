let intro = document.querySelector('.intro');
let logo = document.querySelector('.logo-header');
let logoSpan = document.querySelectorAll('.logo');

window.addEventListener('DOMContentLoaded', ()=>{

    setTimeout(()=>{
         
        logoSpan.forEach((span,idx)=>{
            setTimeout(()=>{
                span.classList.add('active');
            }, (idx + 1) * 400)
        });

        setTimeout(()=>{
            logoSpan.forEach((span, idx)=>{

                setTimeout(()=>{
                    span.classList.remove('active');
                    span.classList.add('fade');
                }, (idx + 1) * 50)
            })
        }, 2000);

        setTimeout(()=>{
            intro.style.top = '-100vh';
        }, 2300)
    })
})

// Abre o crea la base de datos 'PostalFinderDB' con la versión 1
const request = indexedDB.open('PostalFinderDB', 1);

// Maneja el evento de actualización de la base de datos (si cambia la versión)
request.onupgradeneeded = function (event) {
  const db = event.target.result;
  // Crea un almacén de objetos llamado 'codigosPostales' con una clave 'id'
  db.createObjectStore('codigosPostales', { keyPath: 'id' });
};

// Función para guardar el último código postal consultado en IndexedDB
function saveLastCodigoPostalToDB(codigoPostal) {
  const request = indexedDB.open('PostalFinderDB', 1);

  request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction(['codigosPostales'], 'readwrite');
      const store = transaction.objectStore('codigosPostales');
      store.put({ id: 1, codigoPostal: codigoPostal });
  };
}

// Función para obtener el último código postal consultado desde IndexedDB
function getLastCodigoPostalFromDB() {
  return new Promise((resolve, reject) => {
      const request = indexedDB.open('PostalFinderDB', 1);

      request.onsuccess = function (event) {
          const db = event.target.result;
          const transaction = db.transaction(['codigosPostales'], 'readonly');
          const store = transaction.objectStore('codigosPostales');
          const getRequest = store.get(1);

          getRequest.onsuccess = function (event) {
              const result = event.target.result;
              if (result) {
                  resolve(result.codigoPostal);
              } else {
                  reject("No hay registro previo en IndexedDB.");
              }
          };

          getRequest.onerror = function (event) {
              reject("Error al obtener el último código postal desde IndexedDB.");
          };
      };

      request.onerror = function (event) {
          reject("Error al abrir IndexedDB.");
      };
  });
}




async function informacion_cp(){

    $.ajax({
      url : 'https://api.copomex.com/query/info_cp/' + $("#codigo_postal").val(), //aqui va el endpoint de la api de copomex, con el método de info_cp, se deberá concatenar el CP ya que se recibe como parametro en la url, no como variable GET
      data : { 
        token : $("#token").val(), //aqui va tu token. Crea una cuenta gratuita para obtener tu token en https://api.copomex.com/panel
        type : 'simplified'
      },
      type : 'GET', //el método http que se usará, COPOMEX solo ocupa método get
      dataType : 'json', // el tipo de información que se espera de respuesta
      success : async function(copomex) { // código a ejecutar si la petición es satisfactoria, dentro irá el código personalizado

        if(!copomex.error){ //si NO hubo un error

          $("#cp_response").val(copomex.response.cp); //ingresamos la respuesta del cp, en el input destino
          $("#tipo_asentamiento").val(copomex.response.tipo_asentamiento); //ingresamos la respuesta del tipo de asentamiento, en el input destino
          $("#municipio").val(copomex.response.municipio); //ingresamos la respuesta del municipio, en el input destino
          $("#estado").val(copomex.response.estado); //ingresamos la respuesta del estado, en el input destino
          $("#ciudad").val(copomex.response.ciudad); //ingresamos la respuesta de la ciudad, en el input destino
          $("#pais").val(copomex.response.pais); //ingresamos la respuesta del pais, en el input destino

          $("#list_colonias").html(''); //reseteamos el input select para que no se concatene a los nuevos resultados
          for(var i = 0; i<copomex.response.asentamiento.length; i++){ //iteramos el resultado en un for
            $("#list_colonias").append('<option>'+copomex.response.asentamiento[i]+'</option>'); //agregamos el item al listado de colonias
          }

          saveLastCodigoPostalToDB($("#codigo_postal").val());
        }else{ //si hubo error
          console.log('error: ' + copomex.error_message);

          try {
            const lastCodigoPostal = await getLastCodigoPostalFromDB();
            console.log('Último código postal consultado desde IndexedDB: ' + lastCodigoPostal);

            // Mostrar el aviso de falta de conexión
            $('#offline-notice').removeClass('d-none');

            // Actualizar los datos en los inputs con los del último código postal
            $("#cp_response").val(lastCodigoPostal.cp);
            $("#tipo_asentamiento").val(lastCodigoPostal.tipo_asentamiento);
            $("#municipio").val(lastCodigoPostal.municipio);
            $("#estado").val(lastCodigoPostal.estado);
            $("#ciudad").val(lastCodigoPostal.ciudad);
            $("#pais").val(lastCodigoPostal.pais);
            $("#list_colonias").html(''); // Puedes reiniciar el select si es necesario
            for (var l = 0; l < lastCodigoPostal.asentamiento.length; l++) {
                $("#list_colonias").append('<option>' + lastCodigoPostal.asentamiento[i] + '</option>');
            }
        } catch (error) {
            console.log(error);
        }
        }

      },
      error : function(jqXHR, status, error) { //si ocurrió un error en el request al endpoint de COPOMEX

          if(jqXHR.status==400){ //el código http 400 significa que algo se mandó mal (Bad Request)
            copomex = jqXHR.responseJSON;
            alert(copomex.error_message); //mostramos en un alerta, el error recibido
          }

      },
      complete : function(jqXHR, status) { // código a ejecutar sin importar si la petición falló o no
          console.log('Petición a COPOMEX terminada');
      }
    });

  }

