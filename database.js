// database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./user_data.db');

// Create tables if they don't exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS car_information (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            number_plate TEXT,
            make TEXT,
            model TEXT,
            colour TEXT,
            fuel_type TEXT,
            power TEXT,
            engine_capacity TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS driver_information (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            first_name TEXT,
            last_name TEXT,
            dob TEXT,
            license_number TEXT,
            address TEXT,
            postcode TEXT,
            number_plate TEXT,
            quote_price INTEGER,
            quote_id TEXT
            
        )
    `);
});

module.exports = db;

