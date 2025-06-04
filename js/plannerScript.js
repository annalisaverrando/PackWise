const viaggio_id = sessionStorage.getItem("viaggio_id");
let currentDate = new Date();
let currentEventId;
let departure_date;
let return_date;

document.addEventListener("DOMContentLoaded", function () {
  //Invio l'id viaggio al server PHP per poter recuperare le informazioni del viaggio
  fetch("../php/get_date_viaggio.php", {
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
      departure_date = info.data_inizio;
      return_date = info.data_fine;

      //Setto le informazioni del viaggio nel banner
      document.getElementById("banner-name").textContent = info.nome;
      document.getElementById(
        "destination"
      ).textContent = `${info.destinazione}`;
      document.getElementById("dates").textContent = getDateRange(
        departure_date,
        return_date
      );

      let today = new Date();
      let start = new Date(departure_date);
      let diffMill = start - today;
      let diffDays = Math.ceil(diffMill / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        document.getElementById(
          "countdown"
        ).textContent = `Partenza avvenuta ${-diffDays} giorni fa`;
      } else {
        document.getElementById(
          "countdown"
        ).textContent = `${diffDays} giorni rimanenti`;
      }

      //Calcolo le date della settimana di partenza
      calculateMonday();

      //Genero la griglia
      renderCalendar();

      //Setto gli eventListeners
      setupEventListeners();

      setEmail();
    })
    .catch((error) => {
      console.error("Errore nella richiesta:", error);
    });
});

function setupEventListeners() {
  //CLICK SU ICONA UTENTE
  document
    .getElementById("user-logo")
    .addEventListener("click", () => logoutPanel());

  //CLICK SU BOTTONE LOGOUT
  document
    .getElementById("logout-btn")
    .addEventListener("click", () => logoutButton());

  //BOTTONE SALVA NEL PANNELLO MODIFICA DETTAGLI
  document
    .getElementById("save-btn")
    .addEventListener("click", () => updateVacationDetails());

  //NAVIGAZIONE DATE
  document
    .getElementById("prev-week")
    .addEventListener("click", () => navigateCalendar(-7));
  document
    .getElementById("next-week")
    .addEventListener("click", () => navigateCalendar(7));

  //BOTTONE TORNA ALLA VALIGIA
  document
    .getElementById("valigiaBtn")
    .addEventListener("click", () => goToBag());

  //BOTTONE MODIFICA DETTAGLI
  document
    .getElementById("detail-button")
    .addEventListener("click", () => openTripPanel());

  //BOTTONE CREA EVENTO (+)
  document
    .getElementById("add-event-btn")
    .addEventListener("click", () => openAddEventPanel(currentDate));

  //BOTTONE AGGIUNGI EVENTO
  document
    .getElementById("confirm-add")
    .addEventListener("click", () => addEvent());

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
}

//---FUNZIONI USER---

//Setta l'email nel container per il logout
function setEmail() {
  fetch("../php/emailUtente.php")
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
  fetch("../php/logout.php").then(() => {
    window.location.href = "../login/login.html";
  });
}

//--FUNZIONI PER APERTURA E CHIUSURA DEI PANNELLI MODALI---

//Apre il pannello di modifica viaggio
function openTripPanel() {
  fetch("../php/get_date_viaggio.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `viaggio_id=${encodeURIComponent(viaggio_id)}`,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status == "error") {
        alert("Error: ", data.error);
      }

      document.getElementById("trip-name").value = data.nome;
      document.getElementById("trip-destination").value = data.destinazione;
      document.getElementById("trip-start").value = data.data_inizio;
      document.getElementById("trip-end").value = data.data_fine;

      currentTrip = viaggio_id;
      let modal = document.getElementById("trip-modal");
      modal.style.display = "flex";
    })
    .catch((error) => {
      console.error("Errore durante il caricamento:", error);
    });
}

//Chiude il pannello di modifica viaggio
function closeTripPanel() {
  let modal = document.getElementById("trip-modal");
  modal.style.display = "none";
}

//Apre il pannello per inserimento di un nuovo evento
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

//Chiude il pannello per inserimento di nuovo evento
function closeAddEventPanel() {
  let panel = document.getElementById("modal-add");
  panel.style.display = "none";
}

//Apre il pannello dei dettagli di un evento
function openDetailsPanel(id) {
  //Prendere dal db le info dell'evento e mostrarle a schermo
  fetch("../planner/infoEvento.php", {
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

//Apre il pannello di modifica evento
function openEditPanel(id) {
  fetch("../planner/infoEvento.php", {
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

//Chiude il pannello di modifica evento
function closeEditPanel() {
  let editPanel = document.getElementById("modal-edit");
  editPanel.style.display = "none";
}

//---ALTRE FUNZIONI---

//Calcola la stringa che indica le date del viaggio
function getDateRange(start, end) {
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
  start = new Date(start);
  end = new Date(end);

  let startDay = start.getDate();
  let endDay = end.getDate();

  let startMonth = italianMonth[start.getMonth()];
  let endMonth = italianMonth[end.getMonth()];

  let startYear = start.getFullYear();
  let endYear = end.getFullYear();

  if (startMonth == endMonth && startYear == endYear) {
    return `${startDay}-${endDay} ${startMonth} ${startYear}`;
  }
  if (startMonth != endMonth && startYear == endYear) {
    return `${startDay} ${startMonth.slice(0, 3)} - ${endDay} ${endMonth.slice(
      0,
      3
    )} ${startYear}`;
  }
  return `${startDay} ${startMonth.slice(
    0,
    3
  )} ${startYear} - ${endDay} ${endMonth.slice(0, 3)} ${endYear}`;
}

//Calcola il lunedì della settimana di partenza
function calculateMonday() {
  let data = new Date(departure_date);

  let giornoSettimana = data.getDay();
  let diff = giornoSettimana === 0 ? -6 : 1 - giornoSettimana;
  let lunedi = new Date(data);
  lunedi.setDate(data.getDate() + diff);

  //Setto la data corrente a lunedì
  currentDate = new Date(lunedi);
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

//Crea la cella del giorno 'date'
function createDayCell(date) {
  let giorno = new Date(date);
  let dayCell = document.createElement("div");
  dayCell.className = "day-cell";
  dayCell.setAttribute("data-date", date);

  let numberDiv = document.createElement("div");
  numberDiv.className = "day-number";

  let daySpan = document.createElement("span");
  daySpan.textContent = giorno.getDate().toString();
  numberDiv.appendChild(daySpan);
  dayCell.appendChild(numberDiv);

  if (date == departure_date) {
    let departureBadge = document.createElement("span");
    departureBadge.classList.add("badge", "badge-start");
    departureBadge.textContent = "Partenza✈️";
    dayCell.appendChild(departureBadge);
  }

  if (date == return_date) {
    let returnBadge = document.createElement("span");
    returnBadge.classList.add("badge", "badge-end");
    returnBadge.textContent = "Ritorno🏠";
    dayCell.appendChild(returnBadge);
  }

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

//Passa alla settimana successiva/precedente e genera nuovamente le celle del calendario
function navigateCalendar(days) {
  currentDate.setDate(currentDate.getDate() + days);
  renderCalendar();
}

//Torna alla valigia
function goToBag() {
  window.location.href = `../valigia/valigia.php?id=${encodeURIComponent(
    viaggio_id
  )}`;
}

//Aggiorna nome, date di inizio e fine vacanza
function updateVacationDetails() {
  let name = document.getElementById("trip-name").value;
  let destination = document.getElementById("trip-destination").value;
  let start = document.getElementById("trip-start").value;
  let end = document.getElementById("trip-end").value;

  fetch("../php/aggiornaViaggio.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      destination,
      start,
      end,
      viaggio_id,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.status == "ok") {
        console.log(data.message);
        alert("Errore durante l'inserimento");
      } else {
        departure_date = start;
        return_date = end;

        //Calcolo il lunedì della nuova settimana di vacanza
        calculateMonday(new Date(start));
        //Aggiorno la data corrente
        renderCalendar();
        closeTripPanel();
      }
    });
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
  fetch("../planner/gestisciEvento.php", {
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
  fetch("../planner/caricaEventi.php", {
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

//Elimina l'evento selezionato
function deleteEvent(id) {
  let action = "delete";
  fetch("../planner/gestisciEvento.php", {
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

  fetch("../planner/gestisciEvento.php", {
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
