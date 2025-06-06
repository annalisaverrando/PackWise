// Funzione che invia la richiesta al server per aggiungere, aggiornare o eliminare un oggetto
function updateItem(
  action,
  viaggio_id,
  oggetto,
  quantita = null,
  stato = null,
  categoria = null
) {
  // Crea un oggetto con i dati da inviare
  const payload = {
    action: action,
    viaggio_id: viaggio_id,
    oggetto: oggetto,
  };

  if (quantita !== null) payload.quantita = quantita;
  if (stato !== null) payload.stato = Boolean(stato);
  if (categoria !== null) payload.categoria = categoria;

  console.log("Dati inviati:", payload);

  fetch("../valigia/aggiornaValigia.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Errore durante l'aggiornamento");
      }
      return response.text();
    })
    .then((data) => {
      console.log("Response from server:", data);
    })
    .catch((error) => {
      console.error("Errore:", error);
    });
}

// Funzione per inizializzare i bottoni di un elemento
function initializeItem(item) {
  const viaggio_id = new URLSearchParams(window.location.search).get("id");
  const checkbox = item.querySelector('input[type="checkbox"]');
  // Inizializza i controlli di quantità
  const minusBtn = item.querySelector(".minus-btn");
  const plusBtn = item.querySelector(".plus-btn");
  const quantityDisplay = item.querySelector(".quantity-display");
  let quantity = parseInt(quantityDisplay.textContent) || 1;

  function updateQuantityDisplay() {
    if (quantity > 1) {
      minusBtn.style.display = "flex";
      quantityDisplay.style.display = "inline";
      quantityDisplay.textContent = quantity;
    } else {
      minusBtn.style.display = "none";
      quantityDisplay.style.display = "none";
    }
  }

  plusBtn.addEventListener("click", () => {
    quantity++;
    updateQuantityDisplay();
    updateItem("updateQuantity", viaggio_id, checkbox.id, quantity);
  });

  minusBtn.addEventListener("click", () => {
    if (quantity > 1) {
      quantity--;
      updateQuantityDisplay();
      updateItem("updateQuantity", viaggio_id, checkbox.id, quantity);
    }
  });

  // Checkbox
  checkbox.addEventListener("change", () => {
    updateItem("updateStatus", viaggio_id, checkbox.id, null, checkbox.checked);
    console.log("Checkbox: ", checkbox.checked);
  });

  // Inizializza il pulsante elimina
  const deleteBtn = item.querySelector(".delete-element");
  deleteBtn.addEventListener("click", () => {
    item.style.opacity = "0";
    item.style.transform = "scale(0.9)";
    setTimeout(() => item.remove(), 200);
    updateItem("delete", viaggio_id, checkbox.id);
  });
}

// Funzione per inizializzare i pulsanti toggle (espandi/comprimi)
function initializeToggle(toggleBtn) {
  const sezione = toggleBtn.closest(".sezione");
  const sectionContent = sezione.querySelector(".sezione-content");
  const icon = toggleBtn.querySelector("i");

  if (sectionContent.style.display === "none") {
    //Espandi
    sectionContent.style.display = "block";
    icon.classList.replace("bi-chevron-down", "bi-chevron-up");
  } else {
    //Comprimi
    sectionContent.style.display = "none";
    icon.classList.replace("bi-chevron-up", "bi-chevron-down");
  }
}

// Funzione per inizializzare i pulsanti per aggiungere elementi
function initializeAddBtn(addBtn) {
  const sezione = addBtn.closest(".sezione");
  const itemList = sezione.querySelector(".item-list");

  const newItem = document.createElement("div");
  newItem.className = "check-item";
  newItem.innerHTML = `
        <input type="checkbox" name="${sezione.id}" value="" id="" disabled>
        <input type="text" class="edit-label" placeholder="Inserisci nome elemento" autofocus>
        <div class="quantity-controls">
            <button class="quantity-btn minus-btn" style="display: none;">
                <i class="bi bi-dash"></i>
            </button>
            <span class="quantity-display" style="display: none;">1</span>
            <button class="quantity-btn plus-btn">
                <i class="bi bi-plus"></i>
            </button>
        </div>
        <button class="delete-element" title="Elimina">
            <i class="bi bi-x-lg"></i>
        </button>`;
  itemList.appendChild(newItem);

  const textInput = newItem.querySelector(".edit-label");
  textInput.focus();

  function saveItem() {
    const elementName = textInput.value.trim();

    if (!elementName) {
      newItem.remove();
      return;
    }

    const elementId = elementName
      .toLowerCase()
      .replace(/\s+/g, "-") // Sostituisci spazi con trattini
      .replace(/[^\w-]/g, "") // Rimuovi caratteri non alfanumerici
      .replace(/--+/g, "-"); // Riduci trattini multipli a uno solo

    const checkbox = newItem.querySelector('input[type="checkbox"]');
    checkbox.id = elementId;
    checkbox.value = elementId;
    checkbox.disabled = false;

    const label = document.createElement("label");
    label.setAttribute("for", elementId);
    label.textContent = elementName;
    textInput.replaceWith(label);

    initializeItem(newItem);
    const viaggio_id = new URLSearchParams(window.location.search).get("id");
    updateItem("add", viaggio_id, elementName, 1, false, sezione.id);
  }

  textInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      saveItem();
    }
  });
  textInput.addEventListener("blur", saveItem);
}

// Funzione per inizializzare tutti i controlli e gli eventi
function initializeApp() {
  // Inizializza i controlli di quantità
  document.querySelectorAll(".check-item").forEach((item) => {
    initializeItem(item);
  });

  // Inizializza i pulsanti toggle (espandi/comprimi)
  document.querySelectorAll(".btn-toggle").forEach((toggleBtn) => {
    toggleBtn.addEventListener("click", () => {
      initializeToggle(toggleBtn);
    });
  });

  // Inizializza i pulsanti per aggiungere elementi
  document.querySelectorAll(".btn-add").forEach((addBtn) => {
    addBtn.addEventListener("click", () => {
      initializeAddBtn(addBtn);
    });
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

  //CLICK BOTTONE +
  document
    .getElementById("add-section-btn")
    .addEventListener("click", () => addButton());
}

//Calcola la stringa che indica le date del viaggio che verrà mostrata nel banner
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

//Aggiorna i dettagli presenti nel banner
function updateDetails() {
  const viaggio_id = new URLSearchParams(window.location.search).get("id");
  fetch("../php/infoViaggio.php", {
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
    })
    .catch((error) => {
      console.error("Errore nella richiesta:", error);
    });
}

function addButton() {
  const sectionsContainer = document.querySelector(".lista-container");
  const newSection = document.createElement("div");
  newSection.className = "sezione";
  newSection.innerHTML = `
        <div class="sezione-header">
            <img src="../assets/matita.png" / class="category-img">
            <input type="text" class="edit-section-name" placeholder="Inserisci nome sezione" autofocus>
            <div class="sezione-controls">
                <button class='btn-add' title='Aggiungi elemento'><i class='bi bi-plus-lg'></i></button>
                <button class='btn-toggle' title='Espandi/Comprimi'><i class='bi bi-chevron-down'></i></button>
            </div>
        </div>
        <div class="sezione-content">
            <div class="item-list">
                <!-- Gli elementi verranno aggiunti qui -->
            </div>
        </div>
    `;
  sectionsContainer.appendChild(newSection);
  const editNameInput = newSection.querySelector(".edit-section-name");
  editNameInput.focus();

  function saveSectionName() {
    const sectionName = editNameInput.value.trim();

    if (!sectionName) {
      newSection.remove();
      return;
    }

    const sectionId = sectionName
      .toLowerCase()
      .replace(/\s+/g, "-") // Sostituisci spazi con trattini
      .replace(/[^\w-]/g, "") // Rimuovi caratteri non alfanumerici
      .replace(/--+/g, "-"); // Riduci trattini multipli a uno solo

    newSection.id = sectionId;

    const h2 = document.createElement("h2");
    h2.textContent = sectionName;
    editNameInput.replaceWith(h2);

    const toggleBtn = newSection.querySelector(".btn-toggle");
    toggleBtn.addEventListener("click", () => {
      initializeToggle(toggleBtn);
    });

    const addBtn = newSection.querySelector(".btn-add");
    addBtn.addEventListener("click", () => {
      initializeAddBtn(addBtn);
    });
  }

  editNameInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      saveSectionName();
    }
  });

  editNameInput.addEventListener("blur", saveSectionName);
}

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

// Gestisce il pannello che si apre al click dell'icona profilo
function logoutPanel() {
  let modalLogout = document.getElementById("modal-logout");
  modalLogout.classList.toggle("hidden");
}

function logoutButton() {
  fetch("../php/logout.php").then(() => {
    window.location.href = "../login/login.html";
  });
}

// Inizializza tutto quando il documento è caricato
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();

  // Chiamata alla funzione setupEventListeners per gestire le interazioni con l'utente
  setupEventListeners();

  //Imposta i dettagli nel viaggio nel banner
  updateDetails();

  // Imposta l'email dell'utente nel pannello di logout
  setEmail();
});
