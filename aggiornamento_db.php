<?php
session_start();

// Verifica che l'utente sia loggato
if (!isset($_SESSION['email'])) {
    echo "Utente non autenticato.";
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Leggi i dati JSON dalla richiesta
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);
    
     // Estrai i dati dal JSON
    $action = $data['action'];
    $viaggio_id = $data['viaggio_id'];
    $oggetto = isset($data['oggetto']) ? $data['oggetto'] : null;
    $quantita = isset($data['quantita']) ? $data['quantita'] : null;
    $stato = isset($data['stato']) ? $data['stato'] : null;
    $categoria = isset($data['categoria']) ? $data['categoria'] : null;
    
    
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

    if ($action == 'updateQuantity') {
        // Aggiorna solo la quantità dell'oggetto
        $update_query = "
            UPDATE valigia 
            SET quantita = $1 
            WHERE id_viaggio = $2 AND nome_oggetto = $3
        ";
        $result = pg_query_params($conn, $update_query, array($quantita, $viaggio_id, $oggetto));
        
        if ($result) {
            echo "Quantità aggiornata con successo!";
        } else {
            echo "Errore nell'aggiornamento della quantità: " . pg_last_error($conn);
        }
    } else if ($action == 'updateStatus') {
        // Aggiorna lo stato dell'oggetto
        $update_query = "
            UPDATE valigia 
            SET stato = $1 
            WHERE id_viaggio = $2 AND nome_oggetto = $3
        ";
        $result = pg_query_params($conn, $update_query, array($stato ? true : false, $viaggio_id, $oggetto));
        
        if ($result) {
            echo "Stato aggiornato con successo!";
        } else {
            echo "Errore nell'aggiornamento dello stato: " . pg_last_error($conn);
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
