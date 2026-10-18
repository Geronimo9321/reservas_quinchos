let indiceActual = 0;
let carruselIntervalo;

// Funciones Globales para el Carrusel (Disponibles para los atributos onclick del HTML)
function cambiarSlide(direccion) {
    const slides = document.querySelectorAll('.carrusel-slide');
    if (slides.length === 0) return;

    slides[indiceActual].classList.remove('activa');
    indiceActual += direccion;

    if (indiceActual >= slides.length) indiceActual = 0;
    if (indiceActual < 0) indiceActual = slides.length - 1;

    slides[indiceActual].classList.add('activa');
    reiniciarTemporizador(); 
}

function iniciarTemporizador() {
    carruselIntervalo = setInterval(() => {
        cambiarSlide(1);
    }, 4000); // Cambia la imagen automáticamente cada 4 segundos
}

function reiniciarTemporizador() {
    clearInterval(carruselIntervalo);
    iniciarTemporizador();
}

// Funciones Globales para el Lightbox
function abrirLightbox() {
    const slides = document.querySelectorAll('.carrusel-slide img');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    
    if (slides.length === 0) return;
    
    lightboxImg.src = slides[indiceActual].src;
    lightbox.classList.remove('oculto');
    clearInterval(carruselIntervalo); // Pausa el autoplay del carrusel de fondo
}

function cerrarLightbox() {
    document.getElementById('lightbox').classList.add('oculto');
    iniciarTemporizador(); // Reanuda el carrusel al cerrar
}

function cambiarSlideLightbox(direccion) {
    // Primero cambiamos la diapositiva en el carrusel base
    cambiarSlide(direccion);
    // Luego actualizamos la imagen en el lightbox con el nuevo índice
    const slides = document.querySelectorAll('.carrusel-slide img');
    document.getElementById('lightbox-img').src = slides[indiceActual].src;
}


document.addEventListener("DOMContentLoaded", () => {
    // --- Lógica del Carrusel ---
    iniciarTemporizador();

    // Permitir abrir el Lightbox haciendo clic directo sobre las imágenes del carrusel
    const imagenesCarrusel = document.querySelectorAll('.carrusel-slide img');
    imagenesCarrusel.forEach(img => {
        img.style.cursor = 'pointer'; // Cambia el cursor a una manito
        img.addEventListener('click', abrirLightbox);
    });

    // Cerrar Lightbox haciendo clic en el fondo oscuro
    const lightbox = document.getElementById('lightbox');
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            cerrarLightbox();
        }
    });

    const form = document.getElementById("formReserva");
    const mensajeDiv = document.getElementById("mensaje");
    const inputFecha = document.getElementById("fecha");
    const inputTurno = document.getElementById("turno");

    const hoy = new Date().toISOString().split("T")[0];
    inputFecha.setAttribute("min", hoy);

    const reservasExistentes = [
        "2026-12-25-Mañana(08:00 a 14:00)",
        "2026-12-31-Tarde(16:00 a 22:00)"
    ];

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const telefono = document.getElementById("telefono").value.trim();
        const fecha = inputFecha.value;
        const turno = inputTurno.value;
        const metodoPago = document.getElementById("metodoPago").value;

        const claveReserva = `${fecha}-${turno}`;

        if(reservasExistentes.includes(claveReserva)) {
            mostrarMensaje(
                "Lo sentimos, ese turno para esa fecha ya está reservado. Por favor, elige otra opción.",
                "error"
            );
            return;
        }

        // =========================================================================
        // MODIFICADO: CONEXIÓN AUTOMÁTICA CON WHATSAPP LUEGO DE VALIDAR LA RESERVA
        // =========================================================================
        
        // 1. Número de WhatsApp del dueño (Formato internacional sin el símbolo +)
        // Reemplaza este número ficticio por el celular real del quincho.
        const numeroDuenio = "543624123456"; 

        // 2. Armamos el mensaje de texto formateado con saltos de línea (%0A) y negritas (*)
        const mensajeWhatsApp = `*¡Nueva Solicitud de Reserva!*%0A%0A` +
                                `*Nombre:* ${nombre}%0A` +
                                `*Teléfono:* ${telefono}%0A` +
                                `*Fecha:* ${fecha}%0A` +
                                `*Turno:* ${turno}%0A` +
                                `*Pago:* ${metodoPago}`;

        // 3. Unimos el número y el mensaje en la URL oficial de la API de WhatsApp
        const urlFinal = `https://wa.me/${numeroDuenio}?text=${mensajeWhatsApp}`;

        // Guardamos la reserva localmente (Tu lógica original)
        reservasExistentes.push(claveReserva);

        alert("Escribe tus dudas a continuación");

        // Mostramos el mensaje de éxito en pantalla avisando de la redirección
        mostrarMensaje(
            `¡Validación exitosa, ${nombre}! Redirigiéndote a WhatsApp para confirmar los detalles del quincho...`,
            "exito"
        );

        // 4. Esperamos 2 segundos para que el usuario pueda leer tu cartel de éxito antes de abrir el chat
        setTimeout(() => {
            window.open(urlFinal, '_blank'); // Abre WhatsApp en una pestaña nueva sin cerrar tu web
            form.reset(); // Resetea los campos del formulario
            mensajeDiv.className = "oculto"; // Oculta de nuevo el aviso verde
        }, 2000);
    });

    function mostrarMensaje(texto, tipo) {
        mensajeDiv.textContent = texto;
        mensajeDiv.className = tipo;
    }
});
