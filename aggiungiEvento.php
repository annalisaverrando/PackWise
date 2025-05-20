<?php

//Recupero i dati inviati dal javascript
$data = json_decode(file_get_contents("php://input"), true);

$title = $data["title"];
$date = $data["date"];
$start = $data["start_time"];
$end = $data["end_time"];
$notes = $data["notes"];
$viaggio_id = $data["viaggio_id"];
$action = $data["action"];

//Connetto al database
$conn = pg_connect("host=localhost port=5432 dbname=packwise user=postgres password=postgres")
    or die('Errore nella connessione: ' . pg_last_error());

if($action == "add"){
  $query = "INSERT INTO eventi (id_viaggio, titolo, data_evento, ora_inizio, ora_fine, note) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id";

  $result = pg_query_params($conn, $query, array($viaggio_id, $title, $date, $start, $end, $notes));  
  if($row = pg_fetch_assoc($result)){
    echo json_encode(["status" => "ok", "id" => $row['id']]);
    exit;
  } else{
    echo json_encode(["status" => "error", "message" => pg_last_error()]);
    exit;
  }
}

if($action == "update"){
  $id_evento = $data["id"];
  $query = "UPDATE eventi SET titolo = $1, data_evento = $2, ora_inizio = $3, ora_fine = $4, note = $5 WHERE id_viaggio = $6 AND id = $7";

  $result = pg_query_params($conn, $query, array($title, $date, $start, $end, $notes, $viaggio_id, $id_evento));
  if($result){
    echo json_encode(["status" => "ok"]);
    exit;
  } else{
    echo json_encode(["status" => "error", "message" => pg_last_error()]);
    exit;
  }
}