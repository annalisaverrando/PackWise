<?php

session_start();

$data = json_decode(file_get_contents("php://input"), true);

$id_viaggio = $data["id"];

$conn = pg_connect("host=localhost port=5432 dbname=packwise user=postgres password=postgres")
    or die('Errore nella connessione: ' . pg_last_error());

$email = $_SESSION["email"];

$query = "DELETE FROM viaggi WHERE id = $1 AND email_utente = $2";

$result = pg_query_params($conn, $query, array($id_viaggio, $email));

if(!$result){
  echo json_encode(["status" => "error", "message" => pg_last_error()]);
  exit;
}

if(pg_affected_rows($result) > 0){
  echo json_encode(["status" => "ok", "message" => "Eliminazione avvenuta con successo"]);
  exit;
} else{
  echo json_encode(["status" => "error", "message" => "Nessun viaggio eliminato"]);
}