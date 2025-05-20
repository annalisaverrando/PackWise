<?php

$data = json_decode(file_get_contents("php://input"), true);

$event_id = $data["id"];

//Connetto al database
$conn = pg_connect("host=localhost port=5432 dbname=packwise user=postgres password=postgres")
    or die('Errore nella connessione: ' . pg_last_error());

$query = "SELECT * FROM eventi WHERE id = $1";

$result = pg_query_params($conn, $query, array($event_id));
$row = pg_fetch_assoc($result);

echo json_encode($row);
exit;

