
    // script.js
    document.addEventListener('DOMContentLoaded', function () {
        const notification = document.getElementById('notification');

        // Mostra la notifica dopo 1 secondo
        setTimeout(() => {
            notification.classList.add('show');
        }, 1000);

        // Nascondi la notifica dopo 7 secondi
        setTimeout(() => {
            notification.classList.remove('show');
        }, 7000);
    });

    // Riproduci l'audio di benvenuto automaticamente quando la pagina viene caricata
    document.addEventListener('DOMContentLoaded', () => {
        const audio = document.getElementById('background-audio');
        audio.play().catch(error => {
            console.error("Errore nella riproduzione dell'audio di benvenuto:", error);
        });
    });

    // Configurazione iniziale di Particles.js (non modificata)
    particlesJS("particles-js", {
        particles: {
            number: {
                value: 50,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: "#2A5D67"
            },
            shape: {
                type: "circle",
                stroke: {
                    width: 0,
                    color: "#000000"
                },
                polygon: {
                    nb_sides: 5
                }
            },
            opacity: {
                value: 0.5,
                random: false,
                anim: {
                    enable: false,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 4,
                random: true,
                anim: {
                    enable: false,
                    speed: 40,
                    size_min: 0.1,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: "#2A5D67",
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 6,
                direction: "none",
                random: false,
                straight: false,
                out_mode: "out",
                bounce: false,
                attract: {
                    enable: false,
                    rotateX: 600,
                    rotateY: 1200
                }
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: {
                    enable: true,
                    mode: "grab"
                },
                onclick: {
                    enable: true,
                    mode: "push"
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 200,
                    line_linked: {
                        opacity: 1
                    }
                },
                bubble: {
                    distance: 200,
                    size: 10,
                    duration: 2,
                    opacity: 0.8,
                    speed: 3
                },
                repulse: {
                    distance: 200,
                    duration: 0.4
                },
                push: {
                    particles_nb: 4
                },
                remove: {
                    particles_nb: 2
                }
            }
        },
        retina_detect: true
    });

    // Funzione per ottenere gli orari delle preghiere dall'API
    async function getPrayerTimes(latitude, longitude) {
        const date = new Date().toISOString().split('T')[0]; // Ottieni la data corrente in formato YYYY-MM-DD
        const url = `https://api.aladhan.com/v1/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=2`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            return data.data.timings;
        } catch (error) {
            console.error("Errore nel recupero degli orari delle preghiere:", error);
            return null;
        }
    }

    // Funzione per aggiornare gli orari delle preghiere
    async function updatePrayerTimes() {
        const latitude = 45.6975; // Latitudine di Mariano Comense
        const longitude = 9.1833; // Longitudine di Mariano Comense

        const timings = await getPrayerTimes(latitude, longitude);
        if (!timings) return;

        const prayerTimes = [
            { name: 'Fajr', time: timings.Fajr, icon: 'fa-moon' },
            { name: 'Dhuhr', time: timings.Dhuhr, icon: 'fa-sun' },
            { name: 'Asr', time: timings.Asr, icon: 'fa-sun-cloud' },
            { name: 'Maghrib', time: timings.Maghrib, icon: 'fa-moon-star' },
            { name: 'Isha', time: timings.Isha, icon: 'fa-stars' }
        ];

        const container = document.getElementById('prayer-container');
        container.innerHTML = '';

        prayerTimes.forEach(prayer => {
            const card = document.createElement('div');
            card.className = 'prayer-card';

            const now = new Date();
            const prayerTime = new Date(`${now.toDateString()} ${prayer.time}`);
            let diff = (prayerTime - now) / 1000;

            if (diff < 0) diff += 86400; // Aggiungi 24 ore se il tempo è passato

            const hours = Math.floor(diff / 3600);
            const minutes = Math.floor((diff % 3600) / 60);
            const seconds = Math.floor(diff % 60);

            // Controlla se il countdown ha raggiunto lo zero
            if (hours === 0 && minutes === 0 && seconds === 0) {
                playAdhan(); // Riproduci l'Adhan
                showNotification(`È ora di ${prayer.name}`, {
                    body: `È il momento di ${prayer.name}. Preparati per la preghiera.`,
                    icon: 'jjj.png'
                });
            }

            card.innerHTML = `
                <div class="card-header">
                    <i class="fas ${prayer.icon} prayer-icon"></i>
                    <h2 class="prayer-name">${prayer.name}</h2>
                </div>
                <div class="prayer-time">${prayer.time}</div>
                <div class="countdown">
                    ${hours}h ${minutes}m ${seconds}s
                </div>
                <div class="current-day">${getCurrentDay()}</div>
            `;

            container.appendChild(card);
        });
    }

    // Funzione per ottenere il giorno corrente in formato leggibile
    function getCurrentDay() {
        const days = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
        const months = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
        const now = new Date();
        const dayName = days[now.getDay()];
        const dayNumber = now.getDate();
        const monthName = months[now.getMonth()];
        const year = now.getFullYear();
        return `${dayName}, ${dayNumber} ${monthName} ${year}`;
    }

    // Funzione per riprodurre l'Adhan
    function playAdhan() {
        const adhanAudio = new Audio('adhan.mp3');
        adhanAudio.play().then(() => {
            console.log("Adhan riprodotto con successo");
        }).catch(error => {
            console.error("Errore nella riproduzione dell'Adhan:", error);
        });
    }

    // Funzione per richiedere il permesso di notifica
    function requestNotificationPermission() {
        if (Notification.permission !== 'granted') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Permesso per le notifiche concesso');
                }
            });
        }
    }

    // Funzione per mostrare una notifica
    function showNotification(title, options) {
        if (Notification.permission === 'granted') {
            new Notification(title, options);
        } else if (Notification.permission !== 'denied') {
            requestNotificationPermission();
        }
    }

    // Richiedi il permesso per le notifiche al caricamento della pagina
    document.addEventListener('DOMContentLoaded', () => {
        requestNotificationPermission();
    });

    // Gestione del cambio tema
    const scenarySwitch = document.querySelector('.scenary-switch');
    scenarySwitch.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const icon = scenarySwitch.querySelector('i');
        if (document.body.classList.contains('dark-theme')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });

    // Inizializzazione della mappa della Qibla
    const map = L.map('qibla-map').setView([45.6975, 9.1833], 13); // Coordinate di Mariano Comense

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Aggiungi un marker per la posizione corrente
    const marker = L.marker([45.6975, 9.1833]).addTo(map)
        .bindPopup('Sei qui!')
        .openPopup();

    // Aggiungi una linea per indicare la direzione della Qibla
    const qiblaLine = L.polyline([
        [45.6975, 9.1833], // Posizione corrente
        [21.4225, 39.8262] // Coordinate della Kaaba (Mecca)
    ], {
        color: 'red',
        weight: 3
    }).addTo(map);

    setInterval(updatePrayerTimes, 1000);
    updatePrayerTimes();
