<?php
// Verifica che l'utente sia loggato
if (!isset($_SESSION['email'])) {
    echo "Utente non autenticato.";
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Recupera i dati inviati dalla richiesta AJAX
    $viaggio_id = $_POST['viaggio_id'];
    $selectedActivities = $_POST['selectedActivities'];
    $activitiesWithDates = $_POST['activitiesWithDates'];

    // Connessione al database
    $conn = pg_connect("host=localhost port=5432 dbname=packwise user=postgres password=postgres")
        or die('Errore nella connessione: ' . pg_last_error());
    // Debug: Verifica che la connessione sia riuscita
    if (!$conn) {
        echo "Errore di connessione al database.";
        exit;
    }

    // CREAZIONE VALIGIA 
    // (direi di fare un while su selectedActivities, per ogni selezione aggiungi nel database gli oggetti corrispondenti vedendo lista.html)
    
    // INSERIMENTO COPPIE ATTIVITA-DATA DENTRO IL DATABASE
    
    // if ($result) {
        echo "<script>
                window.location.href = 'dettagli_viaggio.php?id=" . $viaggio_id . "';
              </script>";
    //} else {
        //echo "Errore durante la creazione della valigia.";
    //}

    pg_close($conn);
}