<?php
session_start();

// Verifica che l'utente sia loggato
if (!isset($_SESSION['email'])) {
    header("Location: login.php");
    exit;
}

// Connessione al database
$conn = pg_connect("host=localhost port=5432 dbname=packwise user=postgres password=postgres")
    or die('Errore nella connessione: ' . pg_last_error());

// Recupera l'ID del viaggio dalla query string
$viaggio_id = $_GET['id'];

// Recupera i dettagli del viaggio
$query_viaggio = "SELECT * FROM viaggi WHERE id = $1";
$result_viaggio = pg_query_params($conn, $query_viaggio, array($viaggio_id));
$viaggio = pg_fetch_assoc($result_viaggio);

// Recupera gli oggetti associati al viaggio
$query_oggetti = "
    SELECT categoria, nome_oggetto, quantita, stato
    FROM valigia 
    WHERE id_viaggio = $1
    ORDER BY categoria, nome_oggetto
";
$result_oggetti = pg_query_params($conn, $query_oggetti, array($viaggio_id));
$current_category = '';
?>

<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Dettagli Viaggio</title>
        <link rel="stylesheet" href="bootstrap/css/bootstrap.css">
        <link rel="stylesheet" href="css/commonStyle.css">
        <link rel="stylesheet" href="css/listaStyle.css">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
        <script type="application/javascript" src="js/listaScript.js" defer></script>   
</head>
<body>
    <h1>Dettagli del Viaggio: <?php echo $viaggio['nome']; ?></h1>
    <p>Destinazione: <?php echo $viaggio['destinazione']; ?></p>
    <p>Data di inizio: <?php echo $viaggio['data_inizio']; ?></p>
    <p>Data di fine: <?php echo $viaggio['data_fine']; ?></p>

    <div class="page-lista">
        <h1>Lista del viaggio</h1>
        <div class="lista-container">
            <?php
            while ($oggetto = pg_fetch_assoc($result_oggetti)) {
                // Se la categoria cambia, inizia una nuova sezione
                if ($oggetto['categoria'] != $current_category) {
                    if ($current_category != '') {
                        // Chiude la sezione precedente
                        echo "</div></div></div>";
                    }

                    // Inizia una nuova sezione per la categoria
                        $current_category = $oggetto['categoria'];
                        echo "<div class='sezione' id='$current_category'>";
                        echo "<div class='sezione-header'>";
                        echo "<h2>" . ucfirst($current_category) . "</h2>";
                        echo "<div class='sezione-controls'>";
                        echo "<button class='btn-add' title='Aggiungi elemento'><i class='bi bi-plus-lg'></i></button>";
                        echo "<button class='btn-toggle' title='Espandi/Comprimi' onclick='toggleContent(\"$current_category\");'><i class='bi bi-chevron-down' id='icon-$current_category'></i></button>";
                        echo "</div>";
                        echo "</div>";
                        echo "<div class='sezione-content'>";
                        echo "<div class='item-list'>";
                }

                // Stampa l'oggetto
                echo "<div class='check-item'>";
                echo "<input type='checkbox' name='" . $current_category . "' value='" . $oggetto['nome_oggetto'] . "' id='" . $oggetto['nome_oggetto'] . "' " . (($oggetto['stato']=='t') ? 'checked' : '') . ">";
                echo "<label for='" . $oggetto['nome_oggetto'] . "'>" . ucfirst($oggetto['nome_oggetto']) . "</label>";
                $quantity_display_style = ($oggetto['quantita'] > 1) ? 'inline' : 'none';
                $minus_button_style = ($oggetto['quantita'] > 1) ? 'flex' : 'none';

                // Stampa i controlli della quantità
                echo "<div class='quantity-controls'>";
                echo "<button class='quantity-btn minus-btn' style='display: $minus_button_style;'><i class='bi bi-dash'></i></button>";
                echo "<span class='quantity-display' style='display: $quantity_display_style;'>" . $oggetto['quantita'] . "</span>";
                echo "<button class='quantity-btn plus-btn'><i class='bi bi-plus'></i></button>";
                echo "</div>";
                echo "<button class='btn-delete' title='Elimina'><i class='bi bi-x-lg'></i></button>";
                echo "</div>";
            }

            // Chiudi l'ultima sezione della categoria
            if ($current_category != '') {
                echo "</div></div></div>";
            }
        ?>
        </div>
        <a href="dashboard.html">Torna ai tuoi viaggi</a>
        <?php
        echo "<script>";
        echo "sessionStorage.viaggio_id = $viaggio_id";
        echo "</script>";
        ?>
        <a href="planner.html">Vai al planner</a>
    </div>
</body>
</html>

<?php
pg_close($conn);
?>
