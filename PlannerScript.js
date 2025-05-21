const viaggio_id = sessionStorage.getItem("viaggio_id");
let currentDate = new Date();
let currentEventId;

document.addEventListener("DOMContentLoaded", function () {
  //Invio l'id viaggio al server PHP per poter recuperare le informazioni del viaggio
  fetch("get_date_viaggio.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `viaggio_id=${encodeURIComponent(viaggio_id)}`,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Errore del server: ${response.status}`);
      }
      return response.json();
    })
    .then((info) => {
      let data_inizio = info.data_inizio;
      let data_fine = info.data_fine;
      let destinazione = info.destinazione;

      //Setto la data nella sidebar
      document.getElementById("vacation-start").value = data_inizio;
      document.getElementById("vacation-end").value = data_fine;
      document.getElementById("vacation-name").value = destinazione;

      //Calcolo le date della settimana di partenza
      let data = new Date(data_inizio);

      let giornoSettimana = data.getDay();
      let diff = giornoSettimana === 0 ? -6 : 1 - giornoSettimana;
      let lunedi = new Date(data);
      lunedi.setDate(data.getDate() + diff);

      //Setto la data corrente a lunedì
      currentDate = new Date(lunedi);

      //Genero la griglia
      renderCalendar();

      //Setto gli eventListeners
      setupEventListeners();
    })
    .catch((error) => {
      console.error("Errore nella richiesta:", error);
    });
});

function setupEventListeners() {
  //NAVIGAZIONE DATE
  document
    .getElementById("prev-week")
    .addEventListener("click", () => navigateCalendar(-7));
  document
    .getElementById("next-week")
    .addEventListener("click", () => navigateCalendar(7));

  //BOTTONE CREA EVENTO (+)
  document
    .getElementById("add-event-btn")
    .addEventListener("click", () => openAddEventPanel(currentDate));

  //BOTTONE ANNULLA NEL PANEL AGGIUNGI EVENTO
  document
    .getElementById("cancel-add")
    .addEventListener("click", () => closeAddEventPanel());

  //BOTTONE AGGIUNGI EVENTO
  document
    .getElementById("confirm-add")
    .addEventListener("click", () => addEvent());

  //BOTTONE CHIUDI DEL PANNELLO DI DETTGLI EVENTO
  document
    .getElementById("close-event")
    .addEventListener("click", () => closeDetailsEvent());

  //BOTTONE MODIFICA DEL PANNELLO DI DETTAGLI EVENTO
  document
    .getElementById("edit-event")
    .addEventListener("click", () => openEditPanel(currentEventId));

  //BOTTONE ELIMINA DEL PANNELLO DI DETTAGLI EVENTO
  document
    .getElementById("delete-event")
    .addEventListener("click", () => deleteEvent(currentEventId));

  //BOTTONE MODIFICA DEL PANNELLO DI MODIFICA EVENTO
  document
    .getElementById("confirm-edit")
    .addEventListener("click", () => editEvent(currentEventId));

  //BOTTONE ANNULLA NEL PANNELLO DI MODIFICA EVENTO
  document
    .getElementById("cancel-edit")
    .addEventListener("click", () => closeEditPanel());
}

//Crea la cella del giorno 'date'
function createDayCell(date) {
  let giorno = new Date(date);
  let dayCell = document.createElement("div");
  dayCell.className = "day-cell";
  dayCell.setAttribute("data-date", date);

  let numberDiv = document.createElement("div");
  numberDiv.className = "day-number";
  numberDiv.textContent = giorno.getDate().toString();

  dayCell.appendChild(numberDiv);
  //Aggiungo il listener che permette di creare eventi cliccando sulla cella
  dayCell.addEventListener("click", function (e) {
    if (e.target === dayCell || e.target === numberDiv) {
      openAddEventPanel(giorno);
    }
  });
  return dayCell;
}

//Genera le celle html e i relativi eventi della settimana visualizzata
function renderCalendar() {
  //Aggiorno mese e anno correnti
  setMonthYear();

  //Pulisco la griglia prima di aggiungere gli elementi
  let calendarGrid = document.getElementById("calendar-grid");
  calendarGrid.innerHTML = "";

  week = [];

  for (let i = 0; i < 7; i++) {
    let giorno = new Date(currentDate);
    giorno.setDate(currentDate.getDate() + i);

    let isoDay = giorno.toISOString().split("T")[0];
    week.push(isoDay);

    //Genero il codice html delle celle del calendario
    dayCell = createDayCell(isoDay);

    calendarGrid.appendChild(dayCell);
  }
  loadEvents(week);
}

//Aggiorna mese e anno del calendario
function setMonthYear() {
  //Imposto mese e anno
  const italianMonth = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ];

  let month = italianMonth[currentDate.getMonth()];
  let year = currentDate.getFullYear();
  document.getElementById(
    "current-month"
  ).innerHTML = `<strong>${month}</strong> - ${year}`;
}

//Passa alla settimana successiva/precedente e genera nuovamente le celle del calendario
function navigateCalendar(days) {
  currentDate.setDate(currentDate.getDate() + days);
  renderCalendar();
}

//Mostra il pannello per inserimento di un nuovo evento
function openAddEventPanel(dateParam) {
  let panel = document.getElementById("modal-add");

  //Resetto tutti i campi
  document.getElementById("event-title").value = "";
  document.getElementById("start-time").value = "";
  document.getElementById("end-time").value = "";
  document.getElementById("event-notes").value = "";
  document.getElementById("event-date").valueAsDate = dateParam;

  panel.style.display = "flex";
}

//Chiude il pannello senza salvare i dati inseriti
function closeAddEventPanel() {
  let panel = document.getElementById("modal-add");
  panel.style.display = "none";
}

//Inserisce l'evento all'interno del db e lo aggiunge al calendario
function addEvent() {
  let title = document.getElementById("event-title").value;
  let date = document.getElementById("event-date").value;
  let start_time = document.getElementById("start-time").value;
  let end_time = document.getElementById("end-time").value;
  let notes = document.getElementById("event-notes").value;

  //Setto gli orari a null se non sono stati specificati
  if (start_time == "") {
    start_time = null;
  }
  if (end_time == "") {
    end_time = null;
  }

  let action = "add";

  //Invio i dati al PHP che li aggiungerà al db
  fetch("gestisciEvento.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      date,
      start_time,
      end_time,
      notes,
      viaggio_id,
      action,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status != "ok") {
        console.log(data.error);
        alert("Errore durante l'inserimento");
      } else {
        renderCalendar();
      }
      closeAddEventPanel();
    });
}

//Crea l'evento HTML
function createEventHTML(eventId, start_time, title) {
  let div = document.createElement("div");
  div.className = "event";
  div.dataset.id = eventId;
  if (start_time) {
    div.textContent = `${start_time} - ${title}`;
  } else {
    div.textContent = `${title}`;
  }
  div.addEventListener("click", () => openDetailsPanel(eventId));
  return div;
}

//Prende dal db gli eventi della data selezionata e li aggiunge al calendario
function loadEvents(week) {
  fetch("caricaEventi.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      viaggio_id,
      week,
    }),
  })
    .then((result) => result.json())
    .then((list) => {
      for (let i = 0; i < 7; i++) {
        let date = week[i];
        let dayCell = document.querySelector(`[data-date="${date}"]`);
        let fragment = document.createDocumentFragment();
        list.forEach((evento) => {
          if (evento.data_evento == date) {
            let ora = evento.ora_inizio ? evento.ora_inizio.slice(0, 5) : null;
            eventDiv = createEventHTML(evento.id, ora, evento.titolo);
            fragment.appendChild(eventDiv);
          }
        });
        dayCell.appendChild(fragment);
      }
    })
    .catch((error) => {
      console.error("Errore nel caricamento degli eventi: ", error);
    });
}

//Apre il pannello dei dettagli di un evento
function openDetailsPanel(id) {
  //Prendere dal db le info dell'evento e mostrarle a schermo
  fetch("infoEvento.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Errore nella risposta dal server (infoEvento)");
      }
      return response.json();
    })
    .then((info) => {
      let detailsDiv = document.getElementById("event-details");
      detailsDiv.innerHTML = "";

      document.getElementById("event-details-title").innerText = info.titolo;

      let data = document.createElement("div");
      data.innerHTML = `<strong>Data:</strong> ${info.data_evento}`;
      data.className = "event-detail";
      detailsDiv.appendChild(data);

      if (info.ora_inizio) {
        let start = document.createElement("div");
        start.innerHTML = `<strong>Ora inizio:</strong> ${info.ora_inizio.slice(
          0,
          5
        )}`;
        start.className = "event-detail";
        detailsDiv.appendChild(start);
      }

      if (info.ora_fine) {
        let end = document.createElement("div");
        end.innerHTML = `<strong>Ora fine:</strong> ${info.ora_fine.slice(
          0,
          5
        )}`;
        end.className = "event-detail";
        detailsDiv.appendChild(end);
      }

      let notes = document.createElement("div");
      notes.innerHTML = `<strong>Note:</strong> ${info.note}`;
      notes.className = "event-detail";
      detailsDiv.appendChild(notes);

      document.getElementById("modal-details").style.display = "flex";

      currentEventId = id;
    })
    .catch((error) => {
      console.error("Errore nel caricamento delle info dell'evento: ", error);
    });
}

//Chiude il pannello dettagli evento
function closeDetailsEvent() {
  let panel = document.getElementById("modal-details");
  panel.style.display = "none";
}

//Elimina l'evento selezionato
function deleteEvent(id) {
  let action = "delete";
  fetch("gestisciEvento.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action,
      id,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status != "ok") {
        console.log("Status: error:2", data.message);
        alert("Errore durante l'eliminzazione");
      } else {
        renderCalendar();
        document.getElementById("modal-details").style.display = "none";
      }
    });
}

//Apre il pannello di modifica evento
function openEditPanel(id) {
  fetch("infoEvento.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Errore nella risposta dal server (infoEvento)");
      }
      return response.json();
    })
    .then((info) => {
      let title = document.getElementById("edit-event-title");
      let date = document.getElementById("edit-event-date");
      let start_time = document.getElementById("edit-start-time");
      let end_time = document.getElementById("edit-end-time");
      let notes = document.getElementById("edit-event-notes");

      title.value = info.titolo;
      date.value = info.data_evento;
      start_time.value = info.ora_inizio;
      end_time.value = info.ora_fine;
      notes.value = info.note;

      closeDetailsEvent();
      document.getElementById("modal-edit").style.display = "flex";

      currentEventId = id;
    });
}

//Scarta le modifiche e chiude il pannello di modifica
function closeEditPanel() {
  let editPanel = document.getElementById("modal-edit");
  editPanel.style.display = "none";
}

//Salva le modifiche apportate all'evento
function editEvent(id) {
  let action = "update";

  let title = document.getElementById("edit-event-title").value;
  let date = document.getElementById("edit-event-date").value;
  let start_time = document.getElementById("edit-start-time").value;
  start_time = start_time == "" ? null : start_time;
  let end_time = document.getElementById("edit-end-time").value;
  end_time = end_time == "" ? null : end_time;
  let notes = document.getElementById("edit-event-notes").value;

  fetch("gestisciEvento.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      date,
      start_time,
      end_time,
      notes,
      viaggio_id,
      action,
      id,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status != "ok") {
        console.log(data.message);
        alert("Errore durante l'inserimento");
      } else {
        renderCalendar();
        closeEditPanel();
      }
    })
    .catch((error) => {
      console.error("Errore : ", error);
    });
}