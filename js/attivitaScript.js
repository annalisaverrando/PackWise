document.addEventListener("DOMContentLoaded", function () {
  // Ottieni il riferimento al bottone di submit
  const submitButton = document.getElementById("submitBtn");

  //EventListener per attivare il bottone solo quando almeno un attività è selezionata
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((cb) => {
    cb.addEventListener("change", () => {
      const almenoUnaSelezionata = Array.from(checkboxes).some(
        (cb) => cb.checked
      );
      submitButton.disabled = !almenoUnaSelezionata;
    });
  });

  // Aggiungi l'event listener al pulsante
  submitButton.addEventListener("click", submitAttivita);

  // Chiamata alla funzione setupEventListeners per gestire le interazioni con l'utente
  setupEventListeners();

  // Imposta l'email dell'utente nel pannello di logout
  setEmail();
});

// Funzione per gestire l'invio del form
function submitAttivita() {
  // Recupera l'ID del viaggio dal sessionStorage
  const viaggio_id = sessionStorage.getItem("viaggio_id");

  if (!viaggio_id) {
    alert("ID viaggio non trovato. Ritorna alla pagina dei viaggi.");
    return;
  }

  const selectedActivities = [];
  document
    .querySelectorAll('input[type="checkbox"]:checked')
    .forEach((checkbox) => {
      selectedActivities.push(checkbox.value);
    });

  // Crea una richiesta POST a crea_lista.php
  fetch("crea_lista.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `viaggio_id=${encodeURIComponent(
      viaggio_id
    )}&selectedActivities=${encodeURIComponent(
      JSON.stringify(selectedActivities)
    )}`,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Errore durante la creazione della valigia");
      }
      return response.json(); // Parsing della risposta JSON
    })
    .then((data) => {
      console.log("Risposta dal server:", data);

      if (data.status === "success") {
        // Vai direttamente alla pagina dei dettagli del viaggio
        window.location.href = "valigia.php?id=" + viaggio_id;
      } else {
        // Se c'è stato un errore, mostra il messaggio
        alert(data.message || "Errore durante la creazione della valigia");
      }
    })
    .catch((error) => {
      console.error("Errore:", error);
      alert("Si è verificato un errore durante la creazione della valigia.");
    });
}

function setupEventListeners() {
  //CLICK SU ICONA UTENTE
  document
    .getElementById("user-logo")
    .addEventListener("click", () => logoutPanel());

  //CLICK SU BOTTONE LOGOUT
  document
    .getElementById("logout-btn")
    .addEventListener("click", () => logoutButton());
}

//Setta l'email nel container per il logout
function setEmail() {
  fetch("emailUtente.php")
    .then((response) => response.json())
    .then((data) => {
      if (data.email) {
        let emailDiv = document.getElementById("email");
        emailDiv.textContent = `${data.email}`;
      }
    });
}

//Gestisce il pannello che si apre al click dell'icona profilo
function logoutPanel() {
  let modalLogout = document.getElementById("modal-logout");
  modalLogout.classList.toggle("hidden");
}

function logoutButton() {
  fetch("logout.php").then(() => {
    window.location.href = "login.html";
  });
}
