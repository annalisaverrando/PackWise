<?php
session_start();

// Verifica che l'utente sia loggato
if (!isset($_SESSION['email'])) {
    echo "Utente non autenticato.";
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Recupera i dati inviati dalla richiesta AJAX
    $action = $_POST['action'];
    $viaggio_id = $_POST['viaggio_id'];
    $oggetto = isset($_POST['oggetto']) ? $_POST['oggetto'] : null;
    $quantita = isset($_POST['quantita']) ? $_POST['quantita'] : null;
    $stato = isset($_POST['stato']) ? $_POST['stato'] : null;
    $categoria = isset($_POST['categoria']) ? $_POST['categoria'] : null;
    // Controlla che i dati necessari siano presenti
    if (empty($viaggio_id) || empty($oggetto)) {
        echo "Dati mancanti.";
        exit;
    }
    // Connessione al database
    $conn = pg_connect("host=localhost port=5432 dbname=packwise user=postgres password=postgres")
        or die('Errore nella connessione: ' . pg_last_error());
    // Debug: Verifica che la connessione sia riuscita
    if (!$conn) {
        echo "Errore di connessione al database.";
        exit;
    }

    // Debug: Visualizza i dati che stai ricevendo
    error_log("Dati ricevuti: action=$action, viaggio_id=$viaggio_id, oggetto=$oggetto, quantita=$quantita, stato=$stato, categoria=$categoria");

    if ($action == 'update') {
        // Aggiorna lo stato e la quantità dell'oggetto
        $update_query = "
            UPDATE valigia 
            SET quantita = $1, stato = $2 
            WHERE id_viaggio = $3 AND nome_oggetto = $4
        ";
        $result = pg_query_params($conn, $update_query, array($quantita, $stato ? true : false, $viaggio_id, $oggetto));
        if ($result) {
            echo "Oggetto aggiornato con successo!";
        } else {
            echo "Errore nell'aggiornamento: " . pg_last_error($conn);
        }
    } else if ($action == 'delete') {
        // Elimina l'oggetto dal viaggio
        $delete_query = "DELETE FROM valigia WHERE id_viaggio = $1 AND nome_oggetto = $2";
        $result = pg_query_params($conn, $delete_query, array($viaggio_id, $oggetto));
        if ($result) {
            echo "Oggetto eliminato con successo!";
        } else {
            echo "Errore nell'eliminazione: " . pg_last_error($conn);
        }
    } elseif ($action == 'add') {
        // Aggiungi un nuovo oggetto
        $insert_query = "
            INSERT INTO valigia (id_viaggio, nome_oggetto, categoria, quantita, stato)
            VALUES ($1, $2, $3, 1, FALSE)
        ";
        $result = pg_query_params($conn, $insert_query, array($viaggio_id, $oggetto, $categoria));
        if ($result) {
            echo "Oggetto aggiunto con successo!";
        } else {
            echo "Errore nell'aggiunta: " . pg_last_error($conn);
        }
    }

    pg_close($conn);
}
?>
