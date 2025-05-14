<?php
session_start();
$email = $_SESSION['email']; // ID dell'utente loggato

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Connessione al database
    $conn = pg_connect("host=localhost port=5432 dbname=packwise user=postgres password=postgres")
        or die('Errore nella connessione: ' . pg_last_error());

    // Recupera i dati dal form
    $destinazione = $_POST['destinazione'];
    $date_range = $_POST['date'];
    list($data_inizio, $data_fine) = explode(" to ", $date_range);

    // Query per inserire il nuovo viaggio
    $query = "INSERT INTO viaggi (email_utente, destinazione, data_inizio, data_fine) 
              VALUES ($1, $2, $3, $4) RETURNING id";
    $result = pg_query_params($conn, $query, array($email, $destinazione, $data_inizio, $data_fine));

    if ($result) {
        $row = pg_fetch_assoc($result);
        $viaggio_id = $row['id']; // Ottieni l'ID del viaggio appena creato
        $_SESSION['viaggio_id'] = $viaggio_id;
        // Salva i dati in sessionStorage 
        echo "<script>
                sessionStorage.setItem('viaggio_id', '$viaggio_id');
                sessionStorage.setItem('user_id', '$email');
                window.location.href = 'attivita.html';
              </script>";
    } else {
        echo "Errore durante la creazione del viaggio.";
    }

    pg_close($conn);
}
