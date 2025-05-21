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
?>

<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Dashboard</title>
    <link rel="stylesheet" href="bootstrap/css/bootstrap.css">
    <link rel="stylesheet" href="css/commonStyle.css">
</head>
<body>
    <h1>Benvenuto</h1>
    <h2>Crea nuovo</h2>
    <a href="viaggio.html" class="btn btn-primary">Vai a Crea Viaggio</a>
    
    <h2>Viaggi precedenti</h2>
    <?php
        // Recupera i viaggi dell'utente
        $query_viaggi = "SELECT * FROM viaggi WHERE email_utente = $1";
        $result_viaggi = pg_query_params($conn, $query_viaggi, array($email));
        if (pg_num_rows($result_viaggi) > 0) {
            while ($viaggio = pg_fetch_assoc($result_viaggi)) {
                echo "<strong>" . $viaggio['destinazione'] . "</strong> - " . $viaggio['data_inizio'] . " a " . $viaggio['data_fine'];
                echo "<a href='dettagli_viaggio.php?id=" . $viaggio['id'] . "'>Visualizza Dettagli</a><br>";
            }
        } else {
            echo "Non hai ancora registrato alcun viaggio.";
        }
    ?>

</body>
</html>

<?php
pg_close($conn); // Chiudi la connessione al database
?>
