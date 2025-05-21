<?php

$data = json_decode(file_get_contents("php://input"), true);

$titolo = $data["titolo"];
$start = $data["start"];
$end = $data["end"];
$viaggio_id = $data["viaggio_id"];

$conn = pg_connect("host=localhost port=5432 dbname=packwise user=postgres password=postgres")
    or die('Errore nella connessione: ' . pg_last_error());

$query = "UPDATE viaggi SET destinazione = $1, data_inizio = $2, data_fine = $3 WHERE id = $4";

$result = pg_query_params($conn, $query, array($titolo, $start, $end, $viaggio_id));

if($result){
  echo json_encode(["status" => "ok"]);
  exit;
} else{
  echo json_encode(["status" => "error", "message" => pg_last_error()]);
  exit;
}