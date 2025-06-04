<?php
session_start();

// Verifica che l'utente sia loggato
if (!isset($_SESSION['email'])) {
    // Sessione scaduta? Prova a recuperare dal cookie
    if (isset($_COOKIE['email'])) {
        $_SESSION['email'] = $_COOKIE['email'];
    } else {
        header("Location: ../login/login.php"); // Se l'utente non è loggato, reindirizza alla pagina di login
        exit();
    }
}

// Connessione al database
$conn = pg_connect("host=localhost port=5432 dbname=packwise user=postgres password=postgres")
    or die('Errore nella connessione: ' . pg_last_error());

// Recupera l'ID del viaggio dalla query string
$viaggio_id = $_GET['id'];
$immagini = [
    "abbigliamento",
    "aereo",
    "amici",
    "auto",
    "bambino",
    "barca",
    "bici",
    "campeggio",
    "corriera",
    "corsa",
    "escursionismo",
    "essenziali",
    "festival",
    "fotografia",
    "gala",
    "hotel",
    "internazionale",
    "invernali",
    "lavoro",
    "lista",
    "moto",
    "palestra",
    "piscina",
    "secondaCasa",
    "spiaggia",
    "toeletta",
    "treno",
];


// Recupera i dettagli del viaggio
$query_viaggio = "SELECT * FROM viaggi WHERE id = $1 AND email_utente = $2";
$result_viaggio = pg_query_params($conn, $query_viaggio, array($viaggio_id, $_SESSION['email']));
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Valigia</title>
        <link rel="stylesheet" href="../css/commonStyle.css">
        <link rel="stylesheet" href="../css/valigiaStyle.css">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
        <link href="https://fonts.googleapis.com/css2?family=Rubik&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Work+Sans&display=swap" rel="stylesheet"/>
        <script type="application/javascript" src="../js/valigiaScript.js" defer></script>   
</head>
<body>
    <header class="title-bar">
        <img src="../assets/Logo.png" class="logo" />
        <h1 class="app-title">
            <a href="../dashboard/dashboard.html" class="title-link">PackWise</a>
        </h1>
        <span class="line"></span>
        <h2 class="app-section">Valigia</h2>
        <div class="user-container" id="user-container">
            <img src="../assets/user.png" class="user-logo" id="user-logo" />
            <!--Modal che appare quando l'utente è loggato-->
            <div class="modal-logout active hidden" id="modal-logout">
                <div class="email" id="email"></div>
                <div class="logout">
                    <button class="btn btn-primary logout-btn" id="logout-btn">Logout</button>
                </div>
            </div>
        </div>
    </header>

    
    <div class="wrapper">
        <!-- Prima colonna: Sidebar -->
        <div class="sidebar">
            <div class="banner">
                <div class="decoration">✈️</div>
                <div class="banner-header">🧳 Dettagli viaggio</div>
                <div class="banner-name" id="banner-name"><?php echo $viaggio['nome']?></div>
                <div class="destination" id="destination"><?php echo $viaggio['destinazione']?></div>
                <div class="dates" id="dates"></div>
                <div class="countdown" id="countdown"></div>
                <button class="banner-button btn-secondary" onclick="window.location.href='../planner/planner.html'">
                    📋 Pianifica viaggio
                </button>
            </div>
        </div>
        <div class="page-lista">
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
                            if(in_array($current_category, $immagini)){
                                echo "<img src='../assets/" . $current_category . ".png' class='category-img'>"; 
                            }
                            else {
                                echo "<img src='../assets/matita.png' class='category-img'>"; 
                            }
                            echo "<h2>" . ucfirst($current_category) . "</h2>";
                            echo "<div class='sezione-controls'>";
                            echo "<button class='btn-add' title='Aggiungi elemento'><i class='bi bi-plus-lg'></i></button>";
                            echo "<button class='btn-toggle' title='Espandi/Comprimi'><i class='bi bi-chevron-down' id='icon-$current_category'></i></button>";
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
                echo "<script>";
                echo "sessionStorage.viaggio_id = $viaggio_id";
                echo "</script>";
                ?>
            </div>
        </div>
    </div>
    <button class="add-section-btn" id="add-section-btn">+</button>
</body>
</html>

<?php
pg_close($conn);
?>
