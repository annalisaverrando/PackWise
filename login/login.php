<?php
session_start();

$dbconn = pg_connect("host=localhost port=5432 dbname=packwise user=postgres password=postgres")
    or die('Errore nella connessione: ' . pg_last_error());
    
header("Content-Type: application/json");

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if ($dbconn) {
    $email = $input['email'];

$q1 = "SELECT * FROM utenti WHERE email = $1";
$result = pg_query_params($dbconn, $q1, array($email));

if (!($utente = pg_fetch_array($result, null, PGSQL_ASSOC))) {
    echo json_encode(["status" => "error", "message" => "noUser"]);
} else {
    // Confronta la password inserita con l'hash salvato nel database
    if (password_verify($input['password'], $utente['password'])) {
        $_SESSION['email'] = $email;
        setcookie("email", $email, time() + 3600, "/");

        echo json_encode(["status" => "ok", "message" => "ok"]);
        exit;
        
    } else {
        echo json_encode(["status" => "error", "message" => "pwdError"]);
        exit;
    }
    pg_close($dbconn);
        }
    }
?>
