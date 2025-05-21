document.addEventListener("DOMContentLoaded", function() {
    // Ottieni il riferimento al bottone di submit
    const submitButton = document.getElementById('submitBtn');
    
    // Aggiungi l'event listener al pulsante
    submitButton.addEventListener('click', submitAttivita);
});

// Funzione per gestire l'invio del form
function submitAttivita() {
    // Recupera l'ID del viaggio dal sessionStorage
    const viaggio_id = sessionStorage.getItem('viaggio_id');
    
    if (!viaggio_id) {
        alert('ID viaggio non trovato. Ritorna alla pagina dei viaggi.');
        return;
    }
    
    // Recupera tutte le attività selezionate
    const selectedActivities = [];
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
        selectedActivities.push(checkbox.value);
    });
    
    if (selectedActivities.length === 0) {
        alert('Seleziona almeno un\'attività prima di continuare.');
        return;
    }
    
    // Crea una richiesta POST a crea_lista.php
    fetch("crea_lista.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `viaggio_id=${encodeURIComponent(viaggio_id)}&selectedActivities=${encodeURIComponent(JSON.stringify(selectedActivities))}`,
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Errore durante la creazione della valigia");
        }
        return response.json(); // Parsing della risposta JSON
    })
    .then(data => {
        console.log("Risposta dal server:", data);
        
        if (data.status === 'success') {
            // Vai direttamente alla pagina dei dettagli del viaggio
            window.location.href = 'dettagli_viaggio.php?id=' + viaggio_id;
        } else {
            // Se c'è stato un errore, mostra il messaggio
            alert(data.message || "Errore durante la creazione della valigia");
        }
    })
    .catch(error => {
        console.error("Errore:", error);
        alert("Si è verificato un errore durante la creazione della valigia.");
    });
} 