<?php
// Verifica che l'utente sia loggato
session_start();
if (!isset($_SESSION['email'])) {
    echo "Utente non autenticato.";
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Recupera i dati inviati dalla richiesta AJAX
    $viaggio_id = $_POST['viaggio_id'];
    $selectedActivities = json_decode($_POST['selectedActivities'], true);

    // Connessione al database
    $conn = pg_connect("host=localhost port=5432 dbname=packwise user=postgres password=postgres")
        or die('Errore nella connessione: ' . pg_last_error());
    // Debug: Verifica che la connessione sia riuscita
    if (!$conn) {
        echo "Errore di connessione al database.";
        exit;
    }

    // CREAZIONE VALIGIA
    // Definizione degli oggetti per ogni attività
    $oggetti_per_attivita = [
        // Alloggio
        'hotel' => [
            ['nome' => 'Prenotazione camera', 'categoria' => 'hotel']
        ],
        'secondaCasa' => [
            ['nome' => 'Chiavi della seconda casa', 'categoria' => 'secondaCasa']
        ],
        'amici' => [
            ['nome' => 'Regalo', 'categoria' => 'amici']
        ],
        'campeggio' => [
            ['nome' => 'Tenda', 'categoria' => 'campeggio'],
            ['nome' => 'Sacco a pelo', 'categoria' => 'campeggio'],
            ['nome' => 'Materassino', 'categoria' => 'campeggio'],
            ['nome' => 'Torcia', 'categoria' => 'campeggio'],
            ['nome' => 'Kit di pronto soccorso', 'categoria' => 'campeggio']
        ],
        
        // Trasporti
        'aereo' => [
            ['nome' => 'Passaporto', 'categoria' => 'aereo'],
            ['nome' => 'Carta d\'imbarco', 'categoria' => 'aereo'],
            ['nome' => 'Cuscino per il collo', 'categoria' => 'aereo']
        ],
        'auto' => [
            ['nome' => 'Chiavi dell\'auto', 'categoria' => 'auto'],
            ['nome' => 'Patente', 'categoria' => 'auto'],
            ['nome' => 'Assicurazione', 'categoria' => 'auto']
        ],
        'treno' => [
            ['nome' => 'Biglietto del treno', 'categoria' => 'treno']
        ],
        'moto' => [
            ['nome' => 'Chiavi della moto', 'categoria' => 'moto'],
            ['nome' => 'Patente', 'categoria' => 'moto'],
            ['nome' => 'Casco', 'categoria' => 'moto'],
            ['nome' => 'Guanti', 'categoria' => 'moto'],
            ['nome' => 'Giacca da moto', 'categoria' => 'moto'],
            ['nome' => 'Documenti moto', 'categoria' => 'moto']
        ],
        'barca' => [
            ['nome' => 'Biglietto', 'categoria' => 'barca'],
            ['nome' => 'Occhiali da sole', 'categoria' => 'barca'],
            ['nome' => 'Pillole per il mal di mare', 'categoria' => 'barca']
        ],
        'corriera' => [
            ['nome' => 'Biglietto', 'categoria' => 'corriera']
        ],
        
        // Articoli e attività
        'essenziali' => [
            ['nome' => 'Caricatore del cellulare', 'categoria' => 'essenziali'],
            ['nome' => 'Cellulare', 'categoria' => 'essenziali'],
            ['nome' => 'Chiavi di casa', 'categoria' => 'essenziali'],
            ['nome' => 'Cuffie', 'categoria' => 'essenziali'],
            ['nome' => 'Documento d\'identità', 'categoria' => 'essenziali'],
            ['nome' => 'Farmaci', 'categoria' => 'essenziali'],
            ['nome' => 'Portafoglio', 'categoria' => 'essenziali']
        ],
        'abbigliamento' => [
            ['nome' => 'Biancheria', 'categoria' => 'abbigliamento'],
            ['nome' => 'Calzini', 'categoria' => 'abbigliamento'],
            ['nome' => 'Cintura', 'categoria' => 'abbigliamento'],
            ['nome' => 'Giaccone', 'categoria' => 'abbigliamento'],
            ['nome' => 'Gonna', 'categoria' => 'abbigliamento'],
            ['nome' => 'Magliette', 'categoria' => 'abbigliamento'],
            ['nome' => 'Maglioni', 'categoria' => 'abbigliamento'],
            ['nome' => 'Pantaloni', 'categoria' => 'abbigliamento'],
            ['nome' => 'Pigiama', 'categoria' => 'abbigliamento'],
            ['nome' => 'Scarpe', 'categoria' => 'abbigliamento'],
            ['nome' => 'Sciarpa', 'categoria' => 'abbigliamento'],
            ['nome' => 'Vestito', 'categoria' => 'abbigliamento']
        ],
        'toeletta' => [
            ['nome' => 'Cotton fioc', 'categoria' => 'toeletta'],
            ['nome' => 'Crema solare', 'categoria' => 'toeletta'],
            ['nome' => 'Crema viso', 'categoria' => 'toeletta'],
            ['nome' => 'Dentifricio', 'categoria' => 'toeletta'],
            ['nome' => 'Deodorante', 'categoria' => 'toeletta'],
            ['nome' => 'Pettine', 'categoria' => 'toeletta'],
            ['nome' => 'Profumo', 'categoria' => 'toeletta'],
            ['nome' => 'Rasoio', 'categoria' => 'toeletta'],
            ['nome' => 'Sapone', 'categoria' => 'toeletta'],
            ['nome' => 'Shampoo', 'categoria' => 'toeletta'],
            ['nome' => 'Spazzola', 'categoria' => 'toeletta'],
            ['nome' => 'Spazzolino', 'categoria' => 'toeletta'],
            ['nome' => 'Struccante', 'categoria' => 'toeletta'],
            ['nome' => 'Tagliaunghie', 'categoria' => 'toeletta'],
            ['nome' => 'Trucco', 'categoria' => 'toeletta']
        ],
        'internazionale' => [
            ['nome' => 'Adattatore', 'categoria' => 'internazionale'],
            ['nome' => 'Passaporto', 'categoria' => 'internazionale'],
            ['nome' => 'Tessera sanitaria', 'categoria' => 'internazionale'],
            ['nome' => 'Visto', 'categoria' => 'internazionale']
        ],
        'lavoro' => [
            ['nome' => 'Caricatore computer', 'categoria' => 'lavoro'],
            ['nome' => 'Computer portatile', 'categoria' => 'lavoro'],
            ['nome' => 'Documenti di lavoro', 'categoria' => 'lavoro'],
            ['nome' => 'Penne', 'categoria' => 'lavoro'],
            ['nome' => 'Taccuino', 'categoria' => 'lavoro']
        ],
        'escursionismo' => [
            ['nome' => 'Abbigliamento da trekking', 'categoria' => 'escursionismo'],
            ['nome' => 'Bastoncini da trekking', 'categoria' => 'escursionismo'],
            ['nome' => 'Borraccia', 'categoria' => 'escursionismo'],
            ['nome' => 'Cappello', 'categoria' => 'escursionismo'],
            ['nome' => 'Scarpe da trekking', 'categoria' => 'escursionismo']
        ],
        'gala' => [
            ['nome' => 'Abito elegante', 'categoria' => 'cena-di-gala'],
            ['nome' => 'Cravatta', 'categoria' => 'cena-di-gala'],
            ['nome' => 'Gioielli', 'categoria' => 'cena-di-gala'],
            ['nome' => 'Scarpe eleganti', 'categoria' => 'cena-di-gala']
        ],
        'fotografia' => [
            ['nome' => 'Caricabatterie', 'categoria' => 'fotografia'],
            ['nome' => 'Macchina fotografica', 'categoria' => 'fotografia'],
            ['nome' => 'Obiettivi', 'categoria' => 'fotografia'],
            ['nome' => 'Schede di memoria', 'categoria' => 'fotografia'],
            ['nome' => 'Treppiede', 'categoria' => 'fotografia']
        ],
        'palestra' => [
            ['nome' => 'Asciugamano', 'categoria' => 'palestra'],
            ['nome' => 'Borraccia', 'categoria' => 'palestra'],
            ['nome' => 'Scarpe da ginnastica', 'categoria' => 'palestra'],
            ['nome' => 'Tuta da ginnastica', 'categoria' => 'palestra']
        ],
        'spiaggia' => [
            ['nome' => 'Asciugamano da spiaggia', 'categoria' => 'spiaggia'],
            ['nome' => 'Costume da bagno', 'categoria' => 'spiaggia'],
            ['nome' => 'Crema solare', 'categoria' => 'toeletta'],
            ['nome' => 'Infradito', 'categoria' => 'spiaggia'],
            ['nome' => 'Occhiali da sole', 'categoria' => 'spiaggia'],
            ['nome' => 'Ombrellone', 'categoria' => 'spiaggia'],
            ['nome' => 'Telo mare', 'categoria' => 'spiaggia']
        ],
        'piscina' => [
            ['nome' => 'Asciugamano', 'categoria' => 'piscina'],
            ['nome' => 'Ciabatte', 'categoria' => 'piscina'],
            ['nome' => 'Costume da bagno', 'categoria' => 'piscina'],
            ['nome' => 'Cuffia', 'categoria' => 'piscina'],
            ['nome' => 'Occhialini', 'categoria' => 'piscina']
        ],
        'invernali' => [
            ['nome' => 'Guanti', 'categoria' => 'invernali'],
            ['nome' => 'Maschera da sci', 'categoria' => 'invernali'],
            ['nome' => 'Scarponi da sci', 'categoria' => 'invernali'],
            ['nome' => 'Tuta da sci', 'categoria' => 'invernali']
        ],
        
        // Altro
        'lista' => [
            ['nome' => 'Chiudere acqua e gas', 'categoria' => 'lista'],
            ['nome' => 'Chiudere finestre', 'categoria' => 'lista'],
            ['nome' => 'Prenotare hotel', 'categoria' => 'lista'],
            ['nome' => 'Prenotare volo', 'categoria' => 'lista'],
            ['nome' => 'Staccare la corrente', 'categoria' => 'lista'],
        ],
        'bambino' => [
            ['nome' => 'Biberon', 'categoria' => 'bambino'],
            ['nome' => 'Ciuccio', 'categoria' => 'bambino'],
            ['nome' => 'Giocattoli', 'categoria' => 'bambino'],
            ['nome' => 'Pannolini', 'categoria' => 'bambino'],
            ['nome' => 'Passeggino', 'categoria' => 'bambino'],
            ['nome' => 'Salviettine umidificate', 'categoria' => 'bambino'],
            ['nome' => 'Vestiti per bambino', 'categoria' => 'bambino']
        ]
    ];

    // Array per tenere traccia degli oggetti già aggiunti
    $oggetti_aggiunti = [];
    $success = true; // Variabile per tenere traccia del successo delle operazioni

    // Per ogni attività selezionata, aggiungi gli oggetti corrispondenti
    foreach ($selectedActivities as $attivita) {
        if (isset($oggetti_per_attivita[$attivita])) {
            foreach ($oggetti_per_attivita[$attivita] as $oggetto) {
                $nome_oggetto = $oggetto['nome'];
                $categoria = $oggetto['categoria'];
                
                // Controlla se l'oggetto è già stato aggiunto
                if (!in_array($nome_oggetto, $oggetti_aggiunti)) {
                    $oggetti_aggiunti[] = $nome_oggetto;
                    
                    // Inserisci l'oggetto nella valigia
                    $query = "INSERT INTO valigia (id_viaggio, nome_oggetto, categoria, quantita, stato) 
                             VALUES ($1, $2, $3, 1, FALSE)
                             ON CONFLICT (id_viaggio, nome_oggetto) DO NOTHING";
                    $result = pg_query_params($conn, $query, array($viaggio_id, $nome_oggetto, $categoria));
                    
                    // Se una query fallisce, imposta success a false
                    if (!$result) {
                        $success = false;
                    }
                }
            }
        }
    }
    
    // Imposta l'header per indicare che la risposta è in formato JSON
    header('Content-Type: application/json');
    
    // Restituisci una risposta JSON con lo stato dell'operazione
    if ($success) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Valigia creata con successo',       
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Errore durante la creazione della valigia'
        ]);
    }

    pg_close($conn);
}