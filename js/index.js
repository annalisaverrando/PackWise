function checkPassword() {
    var pass1 = document.form_registrazione.password.value;
    var pass2 = document.form_registrazione.ripeti_password.value;
    if(pass1==pass2) return true;
    else{
        window.alert("Errore: le due password non coincidono");
        return false;
    }
}

