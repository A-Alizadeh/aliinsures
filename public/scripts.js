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

                // Populate form fields
                document.getElementById('numberPlate').value = numberPlate;
                document.getElementById('make').value = make;
                document.getElementById('model').value = model;
                document.getElementById('colour').value = colour;
                document.getElementById('fuelType').value = fuelType;
                document.getElementById('power').value = power;
                document.getElementById('engineCapacity').value = engineCapacity;

                document.getElementById('nextButton').classList.add('enabled');
                document.getElementById('nextButton').disabled = false;
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                document.getElementById('result').innerHTML = `<p>Error fetching data. Please try again later.</p>`;
            });
    }

    // Slideshow
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slideshow-slide');
    const totalSlides = slides.length;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.style.display = i === index ? 'block' : 'none';
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(currentSlide);
    }

    showSlide(currentSlide);
    setInterval(nextSlide, 5000);

    document.querySelector('.next').addEventListener('click', nextSlide);
    document.querySelector('.prev').addEventListener('click', prevSlide);
});

// Slideshow functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.slideshow-slide');
const totalSlides = slides.length;

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.style.display = i === index ? 'block' : 'none';
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    showSlide(currentSlide);
}

// Auto-play the slideshow
showSlide(currentSlide); // Show the first slide
setInterval(nextSlide, 5000); // Change slide every 5 seconds

// Navigation controls
document.querySelector('.next').addEventListener('click', nextSlide);
document.querySelector('.prev').addEventListener('click', prevSlide);

// Search button functionality for the Car Insurance service
document.getElementById('searchButtonCar').addEventListener('click', () => {
    const numberPlate = document.getElementById('numberPlateCar').value.trim();
    if (numberPlate) {
        window.location.href = `car_information.html?numberPlate=${numberPlate}`;
    } else {
        alert('Please enter a number plate.');
    }
});

// Search button functionality for the Home Insurance service
document.getElementById('searchButtonHome').addEventListener('click', () => {
    const postcode = document.getElementById('postcode').value.trim();
    if (postcode) {
        window.location.href = `home_information.html?postcode=${postcode}`;
    } else {
        alert('Please enter a postcode.');
    }
});

// Search button functionality for the Travel Insurance service
document.getElementById('searchButtonTravel').addEventListener('click', () => {
    const holidayDestination = document.getElementById('holidayDestination').value.trim();
    if (holidayDestination) {
        window.location.href = `travel_information.html?destination=${holidayDestination}`;
    } else {
        alert('Please enter a holiday destination.');
    }
});

