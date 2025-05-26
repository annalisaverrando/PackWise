<?php
session_start();
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    header("Location: login.html");
    exit;
} else {
    $dbconn = pg_connect("host=localhost port=5432 dbname=packwise user=postgres password=postgres")
        or die('Errore nella connessione: ' . pg_last_error());
}
?>
<!DOCTYPE html>
<html lang="it">
    <head>
        <meta charset="UTF-8">
        <title>Login</title>
        <link rel="stylesheet" href="bootstrap/css/bootstrap.css">
        <link rel="stylesheet" href="css/commonStyle.css">
        <link rel="stylesheet" href="css/formStyle.css">
    </head>
    <body>
        <?php
        if ($dbconn) {
            $email = $_POST['email'];

            $q1 = "SELECT * FROM utenti WHERE email = $1";
            $result = pg_query_params($dbconn, $q1, array($email));

            if (!($utente = pg_fetch_array($result, null, PGSQL_ASSOC))) {
                echo "<h1>Utente non registrato</h1>";
                echo "<a href='registrazione.html'>Clicca qui per registrarti</a>";
            } else {
                // Confronta la password inserita con l'hash salvato nel database
                if (password_verify($_POST['password'], $utente['password'])) {
                    $_SESSION['email'] = $email;
                    header("Location: dashboard.html");
                    exit;
                    
                    //echo "<a href='dashboard.php'>clicca</a>";
                } else {
                    echo "<h1>Password errata</h1>";
                    echo "<a href='login.html'>Riprova</a>";
                }
                pg_close($dbconn);
            }
        }
        ?>
    </body>
</html>
