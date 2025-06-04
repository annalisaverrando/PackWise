<?php
//Recupero i dati inviati da js
$data = json_decode(file_get_contents("php://input"), true);

$viaggio_id = $data["viaggio_id"];
$dates = $data["week"];

//Connetto al database
$conn = pg_connect("host=localhost port=5432 dbname=packwise user=postgres password=postgres")
    or die('Errore nella connessione: ' . pg_last_error());

//Creo i prametri per la query
$params = [$viaggio_id];
foreach($dates as $date){
  $params[] = $date;
}

//Ottengo gli eventi della giornata in ordine di tempo
$query = "SELECT * FROM eventi WHERE id_viaggio = $1 AND data_evento in ($2,$3,$4,$5,$6,$7,$8) ORDER BY ora_inizio IS NOT NULL, ora_inizio";

$result = pg_query_params($conn, $query, $params);

$eventi = [];

while($row = pg_fetch_assoc($result)) {
  $eventi[] = $row;
}

echo json_encode($eventi);
exit;