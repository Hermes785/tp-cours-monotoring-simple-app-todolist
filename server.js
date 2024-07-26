const sqlite3 = require('sqlite3').verbose();
const express = require('express');
require('dotenv').config();
const app = express();
app.use(express.json());
const port = process.env.PORT;
const fs = require('fs');
const path = require('path');

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const log = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: duration,
            timestamp: new Date().toISOString(),
            clientIp: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            requestBody: req.body,
            queryParams: req.query
        };
        fs.appendFileSync(path.join(__dirname, 'app.log'), JSON.stringify(log) + '\n');
    });
    next();
});

const dbs = new sqlite3.Database('todolist.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        dbs.serialize(() => {
            dbs.run('CREATE TABLE IF NOT EXISTS Utilisateur (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL, prenom TEXT NOT NULL);');
            dbs.run(`CREATE TABLE IF NOT EXISTS Tache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titre TEXT NOT NULL,
                description TEXT,
                date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                date_echeance TIMESTAMP,
                statut TEXT CHECK(statut IN ('à faire', 'en cours', 'terminé')) DEFAULT 'à faire',
                utilisateur_id INTEGER,
                FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id)
            );`);
        });
    }
});

app.post('/createUser', (req, res) => {
    const { nom, prenom } = req.body;
    const query = 'INSERT INTO Utilisateur (nom, prenom) VALUES (?, ?)';
    dbs.run(query, [nom, prenom], function (err) {
        if (err) {
            res.status(500).json({ message: 'Some error occurred: ' + err.message });
        } else {
            res.status(200).json({ nom, prenom });
        }
    });
});

app.delete('/deleteUser/:id', (req, res) => {
    const userId = req.params.id;
    const query = 'DELETE FROM Utilisateur WHERE id = ?';

    dbs.run(query, [userId], function (err) {
        if (err) {
            res.status(500).json({ message: 'Some error occurred: ' + err.message });
        } else {
            if (this.changes > 0) {
                res.status(200).json({ message: 'User deleted successfully' });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        }
    });
});

app.delete('/deleteTache/:id', (req, res) => {
    const userId = req.params.id;
    const query = 'DELETE FROM Tache WHERE id = ?';

    dbs.run(query, [userId], function (err) {
        if (err) {
            res.status(500).json({ message: 'Some error occurred: ' + err.message });
        } else {
            if (this.changes > 0) {
                res.status(200).json({ message: 'User deleted successfully' });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        }
    });
});

app.get('/allUser', (req, res) => {
    const query = 'SELECT * FROM Utilisateur';
    dbs.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ message: 'Some error occurred: ' + err.message });
        } else {
            res.status(200).json(rows);
        }
    });
});

app.post('/createTache', (req, res) => {
    const { titre, description, date_creation, date_echeance, statut, utilisateur_id } = req.body;
    const query = 'INSERT INTO Tache (titre, description, date_creation, date_echeance, statut, utilisateur_id) VALUES (?, ?, ?, ?, ?, ?)';
    dbs.run(query, [titre, description, date_creation, date_echeance, statut, utilisateur_id], function (err) {
        if (err) {
            res.status(500).json({ message: 'Some error occurred: ' + err.message });
        } else {
            res.status(200).json({ id: this.lastID, titre, description, date_creation, date_echeance, statut, utilisateur_id });
        }
    });
});

app.get('/allTache', (req, res) => {
    const query = 'SELECT * FROM Tache';
    dbs.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ message: 'Some error occurred: ' + err.message });
        } else {
            res.status(200).json(rows);
        }
    });
});

app.get('/TacheWithUserbyId/:id', (req, res) => {
    const userId = req.params.id;
    const query = `
        SELECT Tache.id AS tache_id, Tache.titre, Tache.description, Tache.date_creation, Tache.date_echeance, Tache.statut,
        Utilisateur.id AS utilisateur_id, Utilisateur.nom, Utilisateur.prenom 
        FROM Tache
        JOIN Utilisateur ON Tache.utilisateur_id = Utilisateur.id
        WHERE Utilisateur.id = ?
    `;

    dbs.all(query, [userId], (err, rows) => {
        if (err) {
            res.status(500).json({ message: 'Some error occurred: ' + err.message });
        } else {
            if (rows.length > 0) {
                res.status(200).json(rows);
            } else {
                res.status(404).json({ message: 'No tasks found for this user' });
            }
        }
    });
});

app.get('/AllTacheWithUser', (req, res) => {
    const userId = req.params.id;
    const query = `
        SELECT Tache.id, Tache.titre, Tache.description, Tache.date_creation, Tache.date_echeance, Tache.statut, Utilisateur.nom, Utilisateur.prenom
        FROM Tache
        JOIN Utilisateur ON Tache.utilisateur_id = Utilisateur.id
    `;

    dbs.all(query, [userId], (err, rows) => {
        if (err) {
            res.status(500).json({ message: 'Some error occurred: ' + err.message });
        } else {
            if (rows.length > 0) {
                res.status(200).json(rows);
            } else {
                res.status(404).json({ message: 'No tasks found for this user' });
            }
        }
    });
});

let server = app.listen(port, () => {
    console.log('Server is running on port 3000');
});

module.exports = { app, server };
