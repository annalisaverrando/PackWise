<?php
// Inizializzazione della sessione
session_start();

// Collegamento al database PostgreSQL
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    header("Location: registrazione.html");
    exit;
} else {
    $conn = pg_connect("host=localhost port=5432 dbname=packwise user=postgres password=postgres")
        or die('Errore nella connessione: ' . pg_last_error());
}
?>
<!DOCTYPE html>
<html lang="it">
    <head>
        <meta charset="UTF-8">
        <title>Registrazione</title>
        <link rel="stylesheet" href="bootstrap/css/bootstrap.css">
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
        <?php
        if ($conn) {
            // Recupera i dati dal form
            $nome = $_POST['nome'];
            $cognome = $_POST['cognome'];
            $email = $_POST['email'];
            $password = $_POST['password'];
            $ripeti_password = $_POST['ripeti_password'];

            // Controlla che le password coincidano 
            if ($password !== $ripeti_password) {
                echo "<h1>Le password non coincidono.</h1>";
                exit;
            }

            // Verifica se l'email è già presente
            $checkQuery = "SELECT * FROM utenti WHERE email = $1";
            $checkResult = pg_query_params($conn, $checkQuery, array($email));

            if (pg_num_rows($checkResult) > 0) {
                echo "<h1>Email già registrata.</h1>";
                echo "<a href='login.html'>Vai al login</a>";
            } else {
                // Inserimento
                $hashed_password = password_hash($password, PASSWORD_DEFAULT);
                $query = "INSERT INTO utenti (nome, cognome, email, password) VALUES ($1, $2, $3, $4)";
                $params = array($nome, $cognome, $email, $hashed_password);

                $result = pg_query_params($conn, $query, $params);

                if ($result) {
                    // Registrazione riuscita, memorizza i dati dell'utente nella sessione
                    $_SESSION['email'] = $email;
                    $_SESSION['nome'] = $nome;
                    $_SESSION['cognome'] = $cognome;
                    header("Location: dashboard.php");
                    exit;
                } else {
                    echo "<h1>Errore nella registrazione: " . pg_last_error($conn) . "</h1>";
                }
            }

            pg_close($conn);
        }
        ?>
    </body>
</html>
