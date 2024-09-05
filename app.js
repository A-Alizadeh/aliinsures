const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const db = require('./database');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'adminSecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Serve HTML Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/car_information', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'car_information.html'));
});

app.get('/driver_information', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'driver_information.html'));
});

// Modify the quote route to serve dynamic HTML
app.get('/quote', (req, res) => {
    const { firstName, numberPlate, price } = req.session;

    // Read the quote.html file
    fs.readFile(path.join(__dirname, 'public', 'quote.html'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send("Error reading quote.html.");
        }

        // Replace placeholders with session data
        let html = data
            .replace('{{firstName}}', firstName || 'Guest')
            .replace('{{numberPlate}}', numberPlate || 'N/A')
            .replace('{{price}}', price || '0.00');

        res.send(html);
    });
});

// Admin Login Route
app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin_login.html'));
});

// Handle admin login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === 'admin' && password === 'admin') {
        req.session.isLoggedIn = true;
        res.redirect('/admin-dashboard');
    } else {
        res.send('Invalid credentials. <a href="/admin-login">Try again</a>');
    }
});

// Admin Dashboard Route (protected)
app.get('/admin-dashboard', (req, res) => {
    if (req.session.isLoggedIn) {
        res.sendFile(path.join(__dirname, 'public', 'admin_dashboard.html'));
    } else {
        res.redirect('/admin-login');
    }
});

// API route to get all form submissions (car and driver data)
app.get('/admin-data', (req, res) => {
    if (req.session.isLoggedIn) {
        db.all('SELECT * FROM car_information', (err, carRows) => {
            if (err) {
                return res.status(500).send("Error retrieving car data.");
            }
            db.all('SELECT * FROM driver_information', (err, driverRows) => {
                if (err) {
                    return res.status(500).send("Error retrieving driver data.");
                }

                res.json({
                    car: carRows,
                    driver: driverRows
                });
            });
        });
    } else {
        res.status(401).send('Unauthorized');
    }
});

// Handle Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/admin-login');
    });
});

// API route to get the power value
app.get('/api/power', (req, res) => {
    const power = req.session.power || 'N/A';
    res.json({ power });
});

// Handle Car Info Submission
app.post('/submit-car-info', (req, res) => {
    const { numberPlate, make, model, colour, fuelType, power, engineCapacity } = req.body;

    console.log("Received car data:", req.body);

    const query = `INSERT INTO car_information (number_plate, make, model, colour, fuel_type, power, engine_capacity)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.run(query, [numberPlate, make, model, colour, fuelType, power, engineCapacity], function (err) {
        if (err) {
            console.error("Error storing car information:", err);
            return res.status(500).send("Error storing car information.");
        }

        req.session.numberPlate = numberPlate;
        req.session.power = power;

        console.log("Redirecting to /driver_information");
        res.redirect('/driver_information');
    });
});

app.post('/submit-driver-info', (req, res) => {
    const { title, firstName, lastName, dob, licenseNumber, address, postcode, quotePrice, quoteId } = req.body;
    const numberPlate = req.session.numberPlate;

    if (!numberPlate) {
        return res.status(400).send("Car number plate is missing. Please submit car information first.");
    }

    const query = `INSERT INTO driver_information (title, first_name, last_name, dob, license_number, address, postcode, number_plate, quote_price, quote_id)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(query, [title, firstName, lastName, dob, licenseNumber, address, postcode, numberPlate, quotePrice, quoteId], function (err) {
        if (err) {
            console.error("Error storing driver information:", err.message);
            return res.status(500).send("Error storing driver information: " + err.message);
        }

        req.session.firstName = firstName;
        req.session.price = quotePrice;
        req.session.quoteId = quoteId;

        console.log("Redirecting to /quote");
        res.redirect('/quote');
    });
});

// Catch-all route handler for undefined routes
app.use((req, res) => {
    res.redirect('/');
});

// Handle deletion of car entries
app.delete('/delete-car/:id', (req, res) => {
    const carId = req.params.id;

    db.run('DELETE FROM car_information WHERE id = ?', [carId], function(err) {
        if (err) {
            console.error('Error deleting car entry:', err.message);
            return res.status(500).send('Error deleting car entry');
        }

        res.sendStatus(200);
    });
});

// Handle deletion of driver entries
app.delete('/delete-driver/:id', (req, res) => {
    const driverId = req.params.id;

    db.run('DELETE FROM driver_information WHERE id = ?', [driverId], function(err) {
        if (err) {
            console.error('Error deleting driver entry:', err.message);
            return res.status(500).send('Error deleting driver entry');
        }

        res.sendStatus(200);
    });
});



// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

