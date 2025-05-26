<?php

$data = json_decode(file_get_contents("php://input"), true);

$name = $data["name"];
$destination = $data["destination"];
$start = $data["start"];
$end = $data["end"];
$viaggio_id = $data["viaggio_id"];

$conn = pg_connect("host=localhost port=5432 dbname=packwise user=postgres password=postgres")
    or die('Errore nella connessione: ' . pg_last_error());

$query = "UPDATE viaggi SET nome = $1, destinazione = $2, data_inizio = $3, data_fine = $4 WHERE id = $5";

$result = pg_query_params($conn, $query, array($name, $destination, $start, $end, $viaggio_id));

if($result){
  echo json_encode(["status" => "ok"]);
  exit;
} else{
  echo json_encode(["status" => "error", "message" => pg_last_error()]);
  exit;
}