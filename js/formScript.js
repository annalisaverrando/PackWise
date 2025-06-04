function checkPassword() {
  var pass1 = document.form_registrazione.password.value;
  var pass2 = document.form_registrazione.ripeti_password.value;
  if (pass1 == pass2) return true;
  else {
    return false;
  }
}

function handlerLogin(event) {
  event.preventDefault();
  let email = document.getElementById("inputEmailLogin").value;
  let password = document.getElementById("inputPasswordLogin").value;

  //Mando i dati al db
  fetch("../login/login.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status == "ok") {
        window.location.href = "../dashboard/dashboard.html";
      } else {
        let alert = document.getElementById("alert");
        if (data.message == "pwdError") {
          alert.textContent = "La password inserita non è corretta. Riprova";
        }
        if (data.message == "noUser") {
          alert.textContent = "Email non registrata. Registrati";
        }

        alert.style.display = "block";
        setTimeout(() => {
          alert.style.display = "none";
        }, 3000);
      }
    })
    .catch((error) => {
      console.error("Errore nella risposta o nella fetch:", error);
    });
}

function handlerRegistration(event) {
  event.preventDefault();
  let nome = document.getElementById("inputNome").value;
  let cognome = document.getElementById("inputCognome").value;
  let email = document.getElementById("inputEmail").value;
  if (!checkPassword()) {
    let alert = document.getElementById("alert");
    alert.textContent = "Le password non coincidono";
    alert.style.display = "block";
    setTimeout(() => {
      alert.style.display = "none";
    }, 3000);
    return;
  }
  let password = document.getElementById("inputPassword").value;

  fetch("../registrazione/registrazione.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nome,
      cognome,
      email,
      password,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status == "ok") {
        window.location.href = "../dashboard/dashboard.html";
        return;
      }
      let alert = document.getElementById("alert");
      if (data.message == "utenteRegistrato") {
        alert.textContent = "Utente già registrato. Accedi";
        alert.style.display = "block";
        setTimeout(() => {
          alert.style.display = "none";
        }, 3000);
        return;
      }
      if (data.message == "failed") {
        alert.textContent = "Errore nella registrazione";
        alert.style.display = "block";
        setTimeout(() => {
          alert.style.display = "none";
        }, 3000);
        return;
      }
    });
}
