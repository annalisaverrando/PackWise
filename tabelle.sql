CREATE TABLE utenti (
    email VARCHAR(255) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cognome VARCHAR(255) NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE viaggi (
    id SERIAL PRIMARY KEY,
    email_utente VARCHAR(255) REFERENCES utenti(email) ON DELETE CASCADE,
    destinazione VARCHAR(255) NOT NULL,
    data_inizio DATE NOT NULL,
    data_fine DATE NOT NULL
);

CREATE TABLE valigia (
    id_viaggio INTEGER REFERENCES viaggi(id) ON DELETE CASCADE,
    nome_oggetto VARCHAR(255) NOT NULL,
    categoria VARCHAR(255) NOT NULL,
    quantita INTEGER NOT NULL DEFAULT 1,  -- Quantità dell'oggetto
    stato BOOLEAN NOT NULL DEFAULT FALSE, -- Stato della checkbox 
    PRIMARY KEY (id_viaggio, nome_oggetto)
);

CREATE TABLE eventi (
    id SERIAL PRIMARY KEY,
    id_viaggio INTEGER REFERENCES viaggi(id) ON DELETE CASCADE,
    titolo VARCHAR(255) NOT NULL,
    data_evento DATE NOT NULL,
    ora_inizio TIME,
    ora_fine TIME,
    note TEXT
);
