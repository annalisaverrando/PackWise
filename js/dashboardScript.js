let currentTrip;

document.addEventListener("DOMContentLoaded", function () {
  loadTripPanel("all");
  setEmail();
  setupEventListeners();
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

  //BOTTONI PER FILTRARE I VIAGGI

  //TUTTI
  document
    .getElementById("filter-all")
    .addEventListener("click", () => loadTripPanel("all"));
  document
    .getElementById("filter-all")
    .addEventListener("click", () => tripFilters(event));

  //IN ARRIVO
  document
    .getElementById("filter-planned")
    .addEventListener("click", () => loadTripPanel("planned"));
  document
    .getElementById("filter-planned")
    .addEventListener("click", () => tripFilters(event));

  //COMPLETATI
  document
    .getElementById("filter-past")
    .addEventListener("click", () => loadTripPanel("past"));
  document
    .getElementById("filter-past")
    .addEventListener("click", () => tripFilters(event));

  //BOTTONE NUOVO VIAGGIO
  document.getElementById("new-trip").addEventListener("click", () => {
    window.location.href = "viaggio.html";
  });

  //BOTTONE SALVA NEL PANNELLO MODIFICA VIAGGIO
  document
    .getElementById("save-btn")
    .addEventListener("click", () => editTrip(currentTrip));
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

async function setBanner() {
  let tripList = await loadTrip("planned");
  let incomingTrip = tripList[0];

  document.getElementById("banner-name").textContent = incomingTrip.nome;
  document.getElementById(
    "destination"
  ).textContent = `${incomingTrip.destinazione}`;
  document.getElementById("dates").textContent = getDateRange(
    incomingTrip.data_inizio,
    incomingTrip.data_fine
  );

  let today = new Date();
  let start = new Date(incomingTrip.data_inizio);
  let diffMill = start - today;
  let diffDays = Math.ceil(diffMill / (1000 * 60 * 60 * 24));

  document.getElementById(
    "countdown"
  ).textContent = `${diffDays} giorni rimanenti`;

  sessionStorage.viaggio_id = incomingTrip.id;
}

async function loadTrip(filter) {
  try {
    const response = await fetch("dashboard.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `filter=${encodeURIComponent(filter)}`,
    });

    const json = await response.json();

    if (json.status === "error") {
      console.log(json.error);
      return [];
    }

    return json.data;
  } catch (error) {
    console.error("Errore fetch:", error);
    return [];
  }
}

async function loadTripPanel(filter) {
  let tripList = await loadTrip(filter);
  let container = document.getElementById("main-container");
  container.textContent = "";
  if (tripList == []) {
    let content = document.createElement("div");
    content.textContent = "Non hai ancora nessun viaggio";
    container.appendChild(content);
  } else {
    for (let trip of tripList) {
      let tripElement = createTripPanel(trip);
      container.appendChild(tripElement);
    }
    setBanner();
  }
}

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

function getTripStatus(start, end) {
  let date = new Date();
  start = new Date(start);
  end = new Date(end);
  if (date > end) return { status: "trip-completed", text: "COMPLETATO" };
  if (date < start) return { status: "trip-planned", text: "IN PROGRAMMA" };
  return { status: "trip-active", text: "ATTIVO" };
}

function timeToGo(start) {
  let today = new Date();
  start = new Date(start);
  let diffMill = start - today;
  let diffDays = Math.ceil(diffMill / (1000 * 60 * 60 * 24));

  if (start >= today) {
    return `<span class="weight">Partenza tra: </span>${diffDays}g`;
  } else {
    return `<span class="weight">Partenza avvenuta: </span>${-diffDays}g fa`;
  }
}

function createTripPanel(tripData) {
  let tripContainer = document.createElement("div");
  tripContainer.className = "trip-container";
  tripContainer.onclick = () => openDetails(tripData.id);

  let status = getTripStatus(tripData.data_inizio, tripData.data_fine);

  tripContainer.innerHTML = `<div class="trip-header">
    <h3 class="trip-name">${tripData.nome}</h3>
    <span class="trip-status ${status.status}">${status.text}</span>
  </div>
  <div class=trip-details>
    <p class="detail"><span class="weight">Destinazione: </span>${
      tripData.destinazione
    }</p>
    <p class="detail"><span class="weight">Date: </span>${getDateRange(
      tripData.data_inizio,
      tripData.data_fine
    )}</p>
    <p class="datail">${timeToGo(tripData.data_inizio)}</p>
    <div class="trip-actions">
      <button class="btn-primary btn-edit"> Modifica</button>
      <button class="btn-primary btn-delete"> Elimina</button>
    </div>
  </div>`;

  tripContainer
    .querySelector(".btn-edit")
    .addEventListener("click", (event) => {
      event.stopPropagation();
      openModal(tripData.id);
    });

  tripContainer
    .querySelector(".btn-delete")
    .addEventListener("click", (event) => {
      event.stopPropagation();
      deleteTrip(tripData.id);
    });

  return tripContainer;
}

function tripFilters(filter) {
  document.querySelectorAll(".filter-tab").forEach((tab) => {
    tab.classList.remove("active");
  });
  filter.target.classList.add("active");
}

function openDetails(id) {
  window.location.href = `valigia.php?id=${encodeURIComponent(id)}`;
}

function editTrip(viaggio_id) {
  let name = document.getElementById("trip-name").value;
  let destination = document.getElementById("trip-destination").value;
  let start = document.getElementById("trip-start").value;
  let end = document.getElementById("trip-end").value;

  fetch("aggiornaViaggio.php", {
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
        alert("Errore nella modifica del viaggio");
      } else {
        loadTripPanel("all");
        closeModal();
      }
    });
}

function deleteTrip(id) {
  fetch("eliminaViaggio.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status == "error") {
        alert("Error: ", data.error);
      }
      alert("Eliminazione avvenuta con successo");
      loadTripPanel("all");
    })
    .catch((error) => {
      console.error("Errore durante l'eliminazione:", error);
    });
}

function openModal(id) {
  fetch("get_date_viaggio.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `viaggio_id=${encodeURIComponent(id)}`,
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

      currentTrip = id;
      let modal = document.getElementById("trip-modal");
      modal.style.display = "flex";
    })
    .catch((error) => {
      console.error("Errore durante il caricamento:", error);
    });
}

function closeModal() {
  let modal = document.getElementById("trip-modal");
  modal.style.display = "none";
}
