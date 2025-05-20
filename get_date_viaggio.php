<?php
//RECUPERA LE DATE DEL VIAGGIO SU RICHIESTA DEL JAVASCRIPT DEL PLANNER
session_start();

//Connetto al database
$conn = pg_connect("host=localhost port=5432 dbname=packwise user=postgres password=postgres")
    or die('Errore nella connessione: ' . pg_last_error());

$email = $_SESSION['email'];
$viaggio_id = $_POST['viaggio_id'];

$query = "SELECT data_inizio, data_fine, destinazione FROM viaggi WHERE id = $1 and email_utente = $2";
$result = pg_query_params($conn, $query, array($viaggio_id, $email));

$row = pg_fetch_assoc($result);

if($row) {
  header('Content-Type: application/json');

  echo json_encode([
    "data_inizio" => $row['data_inizio'],
    "data_fine" => $row['data_fine'],
    "destinazione" => $row['destinazione']
  ]);
  exit;
} else{
  http_response_code(404);
  exit;
}
