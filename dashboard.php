<?php
session_start();

// Verifica che l'utente sia loggato
if (!isset($_SESSION['email'])) {
    header("Location: login.php"); // Se l'utente non è loggato, reindirizza alla pagina di login
    exit;
}

// Connessione al database
$conn = pg_connect("host=localhost port=5432 dbname=packwise user=postgres password=postgres")
    or die('Errore nella connessione: ' . pg_last_error());

// Recupera i dati dell'utente loggato
$email = $_SESSION['email'];
$filter = $_POST["filter"];

$date = date("Y-m-d");

if($filter == "all"){
    $query = "SELECT * FROM viaggi WHERE email_utente = $1 ORDER BY data_inizio";
    $result_viaggi = pg_query_params($conn, $query, array($email));
} elseif($filter == "planned"){
    $query = "SELECT * FROM viaggi WHERE email_utente = $1 AND $2 < data_inizio ORDER BY data_inizio";
    $result_viaggi = pg_query_params($conn, $query, array($email, $date));
} elseif($filter == "past"){
    $query = "SELECT * FROM viaggi WHERE email_utente = $1 AND $2 > data_fine ORDER BY data_inizio";
    $result_viaggi = pg_query_params($conn, $query, array($email, $date));
} elseif($filter == "active"){
    $query = "SELECT * FROM viaggi WHERE email_utente = $1 AND data_inizio <= $2 AND $2 <= data_fine";
    $result_viaggi = pg_query_params($conn, $query, array($email, $date));
}else{
    $result_viaggi = false;
}

$viaggi = [];

if(!$result_viaggi){
    echo json_encode(["status" => "error", "error" => pg_last_error()]);
    exit;
}

if (pg_num_rows($result_viaggi) > 0) {
    while ($viaggio = pg_fetch_assoc($result_viaggi)) {
        $viaggi[] = $viaggio;
    }
}

echo json_encode(["status" => "ok", "data" => $viaggi]);
?>
