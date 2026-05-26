// let username = getUserInput("What is your name?"); // COMENTA esta linea cuando empieces a programar.

// ------------------- Función para pedir datos al usuario ----------------------
function getUserInput(question) {
    return prompt(question);
}
//-------------------- Fin del código Espacio Educa ----------------------

// Lista de palabras para el juego
const palabras = ['javascript', 'programacion', 'ahorcado', 'computadora', 'desarrollo', 'algoritmo'];

// Función para elegir una palabra aleatoria
function elegirPalabra() {
    return palabras[Math.floor(Math.random() * palabras.length)];
}

// Función para mostrar el estado actual de la palabra
function mostrarPalabra(palabra, letrasAdivinadas) {
    return palabra.split('').map(letra => letrasAdivinadas.includes(letra) ? letra : '_').join(' ');
}

// Llamada inicial para iniciar el juego.
startGame();

function startGame() {
    // Definición de variables (Esto corrige el error de "ReferenceError")
    const palabraSecreta = elegirPalabra();
    const letrasAdivinadas = [];
    let intentos = 0;
    const maxIntentos = 6;

    console.log("¡Bienvenido al juego del Ahorcado!");
    console.log("Adivina la palabra letra por letra. Tienes 6 intentos.");

    while (intentos < maxIntentos) {
        console.log("Palabra: " + mostrarPalabra(palabraSecreta, letrasAdivinadas));
        console.log("Letras usadas: " + letrasAdivinadas.join(', '));

        const entrada = getUserInput("Ingresa una letra:");

        // Validación por si el usuario cancela o cierra el prompt
        if (entrada === null) {
            console.log("Entrada cancelada. Fin del juego.");
            return;
        }

        const letra = entrada.toLowerCase();

        if (letra.length !== 1 || !/[a-z]/.test(letra)) {
            console.log("Por favor, ingresa una sola letra válida.");
            continue;
        }

        if (letrasAdivinadas.includes(letra)) {
            console.log("Ya has usado esa letra.");
            continue;
        }

        letrasAdivinadas.push(letra);

        if (palabraSecreta.includes(letra)) {
            console.log("¡Bien! La letra está en la palabra.");
        } else {
            console.log("¡Incorrecto! Pierdes un intento.");
            intentos++;
        }

        // Verificar si ganó
        const palabraMostrada = mostrarPalabra(palabraSecreta, letrasAdivinadas).replace(/\s/g, '');
        if (palabraMostrada === palabraSecreta) {
            console.log("¡Felicidades! Has adivinado la palabra: " + palabraSecreta);
            break; // IMPORTANTE: Cambiado return por break para que llegue a la pregunta final
        }
    }

    if (intentos === maxIntentos) {
        console.log("¡Has perdido! La palabra era: " + palabraSecreta);
    }

    // --- BLOQUE DE REINICIO ---
    const respuesta = getUserInput("¿Quieres jugar otra vez? (si/no)");
    
    if (respuesta !== null) {
        const jugarDeNuevo = respuesta.toLowerCase();
        if (jugarDeNuevo === "si" || jugarDeNuevo === "s") {
            console.log("\n--- Nueva Partida ---");
            startGame(); // Vuelve a ejecutar la función
        } else {
            console.log("¡Gracias por jugar! Hasta pronto.");
        }
    }
}