document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const numberPlate = urlParams.get('numberPlate');

    if (numberPlate) {
        const fetchUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.carcheck.co.uk/vauxhall/${numberPlate}`)}`;

        fetch(fetchUrl)
            .then(response => response.json())
            .then(data => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data.contents, 'text/html');

                function getValue(label) {
                    const rows = doc.querySelectorAll('table.table.table-striped.table-condensed tr');
                    for (const row of rows) {
                        const header = row.querySelector('th');
                        const data = row.querySelector('td');
                        if (header && header.innerText.trim() === label) {
                            return data ? data.innerText.trim() : 'N/A';
                        }
                    }
                    return 'N/A';
                }

                const make = getValue('Make');
                const model = getValue('Model');
                const colour = getValue('Colour');
                const fuelType = getValue('Fuel Type');
                const power = getValue('Power');
                const engineCapacity = getValue('Engine capacity');

                const carData = {
                    numberPlate: numberPlate,
                    make: make,
                    model: model,
                    colour: colour,
                    fuelType: fuelType,
                    power: power,
                    engineCapacity: engineCapacity
                };

                // Populate the form fields
                document.getElementById('numberPlate').value = numberPlate;
                document.getElementById('make').value = make;
                document.getElementById('model').value = model;
                document.getElementById('colour').value = colour;
                document.getElementById('fuelType').value = fuelType;
                document.getElementById('power').value = power;
                document.getElementById('engineCapacity').value = engineCapacity;

                document.getElementById('nextButton').classList.add('enabled');
                document.getElementById('nextButton').disabled = false;

                // Send data to the server
                document.getElementById('nextButton').addEventListener('click', () => {
                    fetch('/submit-car-info', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(carData)
                    })
                    .then(response => {
                        if (response.ok) {
                            window.location.href = 'driver_information.html';
                        } else {
                            alert('Failed to save car information.');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
                });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                document.getElementById('result').innerHTML = `<p>Error fetching data. Please try again later.</p>`;
            });
    }
});

