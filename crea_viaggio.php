<?php
session_start();
$email = $_SESSION['email']; // ID dell'utente loggato

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Connessione al database
    $conn = pg_connect("host=localhost port=5432 dbname=packwise user=postgres password=postgres")
        or die('Errore nella connessione: ' . pg_last_error());

    // Recupera i dati dal form
    $nome = $_POST['nome'];
    $destinazione = $_POST['destinazione'];
    $date_range = $_POST['date'];
    
    // Separa le date (formato da Litepicker: "DD/MM/YYYY - DD/MM/YYYY")
    list($data_inizio, $data_fine) = explode(" - ", $date_range);
    
    // Converti dal formato italiano (DD/MM/YYYY) al formato database (YYYY-MM-DD)
    $data_inizio_obj = DateTime::createFromFormat('d/m/Y', $data_inizio);
    $data_fine_obj = DateTime::createFromFormat('d/m/Y', $data_fine);
    
    if ($data_inizio_obj && $data_fine_obj) {
        $data_inizio_db = $data_inizio_obj->format('Y-m-d');
        $data_fine_db = $data_fine_obj->format('Y-m-d');
        
        // Query per inserire il nuovo viaggio
        $query = "INSERT INTO viaggi (email_utente, nome, destinazione, data_inizio, data_fine) 
                VALUES ($1, $2, $3, $4, $5) RETURNING id";
        $result = pg_query_params($conn, $query, array($email, $nome, $destinazione, $data_inizio_db, $data_fine_db));

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
    } else {
        echo "Formato data non valido.";
    }

    pg_close($conn);
}
