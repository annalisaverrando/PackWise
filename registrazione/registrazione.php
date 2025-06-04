<?php
// Inizializzazione della sessione
session_start();

// Collegamento al database PostgreSQL

$conn = pg_connect("host=localhost port=5432 dbname=packwise user=postgres password=postgres")
    or die('Errore nella connessione: ' . pg_last_error());

header("Content-Type: application/json");

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if ($conn) {
    // Recupera i dati dal form
    $nome = $input['nome'];
    $cognome = $input['cognome'];
    $email = $input['email'];
    $password = $input['password'];

    // Verifica se l'email è già presente
    $checkQuery = "SELECT * FROM utenti WHERE email = $1";
    $checkResult = pg_query_params($conn, $checkQuery, array($email));

    if (pg_num_rows($checkResult) > 0) {
        echo json_encode(["status" => "error", "message" => "utenteRegistrato"]);
        exit;
    } else {
        // Inserimento
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        $query = "INSERT INTO utenti (nome, cognome, email, password) VALUES ($1, $2, $3, $4)";
        $params = array($nome, $cognome, $email, $hashed_password);

        $result = pg_query_params($conn, $query, $params);

        if ($result) {
            // Registrazione riuscita, memorizza i dati dell'utente nella sessione
            $_SESSION['email'] = $email;
            $_SESSION['nome'] = $nome;
            $_SESSION['cognome'] = $cognome;
            //Setta i cookie
            setcookie("email", $email, time() + 3600, "/");
            echo json_encode(["status" => "ok", "message" => "ok"]);
            exit;
        } else {
            echo json_decode(["status" => "error", "message" => "failed"]);
            exit;
        }
    }
}
?>