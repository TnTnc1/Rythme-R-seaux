document.addEventListener('DOMContentLoaded', () => {
    // Éléments du DOM
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const endScreen = document.getElementById('end-screen');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    
    const scoreDisplay = document.getElementById('score');
    const timerDisplay = document.getElementById('timer');
    const comboDisplay = document.getElementById('combo');
    const finalScoreDisplay = document.getElementById('final-score');
    const feedbackDisplay = document.getElementById('feedback');
    
    const gameTrack = document.getElementById('game-track');
    const targetZone = document.getElementById('target-zone');

    // Paramètres du jeu
    let score = 0;
    let timer = 60;
    let combo = 1;
    let gameInterval;
    let iconInterval;
    let timerInterval;

    // Icônes possibles (vous pouvez ajouter les vôtres !)
    // Important : Créez un dossier "icons" à côté de vos fichiers et mettez-y des images PNG.
    // Nommez-les par exemple fb.png, insta.png, etc.
    const iconSources = ['fb.png', 'insta.png', 'x.png', 'code.png', 'mail.png'];

    // Démarrage du jeu
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);

    function startGame() {
        // Réinitialisation
        score = 0;
        timer = 60;
        combo = 1;
        updateHUD();
        
        startScreen.classList.add('hidden');
        endScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        
        // Démarrage des boucles de jeu
        gameInterval = setInterval(gameLoop, 1000 / 60); // 60 FPS
        iconInterval = setTimeout(spawnIcon, 1500); // Première icône après 1.5s
        timerInterval = setInterval(updateTimer, 1000);

        // Ajout de l'écouteur de clic pour le jeu
        gameTrack.addEventListener('click', handleTrackClick);
    }

    // Boucle de jeu principale
    function gameLoop() {
        if (timer <= 0) {
            endGame();
        }
    }

    // Mise à jour du timer
    function updateTimer() {
        timer--;
        updateHUD();
        if (timer <= 0) {
            endGame();
        }
    }
    
    // Fin du jeu
    function endGame() {
        clearInterval(gameInterval);
        clearTimeout(iconInterval);
        clearInterval(timerInterval);
        
        finalScoreDisplay.textContent = score;
        gameScreen.classList.add('hidden');
        endScreen.classList.remove('hidden');

        // Nettoyage des icônes restantes et de l'écouteur
        document.querySelectorAll('.icon').forEach(icon => icon.remove());
        gameTrack.removeEventListener('click', handleTrackClick);
    }

    // Mise à jour de l'affichage (Score, Temps, Combo)
    function updateHUD() {
        scoreDisplay.textContent = score;
        timerDisplay.textContent = timer;
        comboDisplay.textContent = `x${combo.toFixed(1)}`;
    }

    // Création d'une icône
    function spawnIcon() {
        const icon = document.createElement('div');
        icon.classList.add('icon');
        const randomIcon = iconSources[Math.floor(Math.random() * iconSources.length)];
        // Assurez-vous d'avoir un dossier "icons" avec vos images
        icon.style.backgroundImage = `url(icons/${randomIcon})`; 
        
        gameTrack.appendChild(icon);
        
        // Supprime l'icône si elle sort de l'écran sans être cliquée
        setTimeout(() => {
            if (icon.parentElement) {
                icon.remove();
                showFeedback("Raté");
                resetCombo();
            }
        }, 4000); // 4000ms correspond à la durée de l'animation CSS

        // Prochaine icône
        const nextSpawnTime = Math.random() * 1200 + 600; // entre 0.6s et 1.8s
        iconInterval = setTimeout(spawnIcon, nextSpawnTime);
    }

    // Gestion du clic du joueur
    function handleTrackClick() {
        const allIcons = document.querySelectorAll('.icon');
        let hit = false;
        
        allIcons.forEach(icon => {
            const iconRect = icon.getBoundingClientRect();
            const targetRect = targetZone.getBoundingClientRect();

            // Vérifie si l'icône est dans la zone cible
            if (iconRect.left < targetRect.right && iconRect.right > targetRect.left) {
                const distanceToCenter = Math.abs(iconRect.x - targetRect.x);
                
                if (distanceToCenter < 15) { // Parfait
                    score += Math.floor(150 * combo);
                    combo += 0.2;
                    showFeedback("Parfait !");
                } else if (distanceToCenter < 35) { // Bien
                    score += Math.floor(50 * combo);
                    combo += 0.1;
                    showFeedback("Bien");
                } else { // Pas assez précis mais dans la zone
                    return; 
                }

                hit = true;
                icon.remove();
                updateHUD();
            }
        });

        // Si le joueur clique dans le vide (ou trop loin des icônes)
        if (!hit) {
            score -= 25; // Petite pénalité
            if (score < 0) score = 0;
            resetCombo();
            updateHUD();
        }
    }

    function resetCombo() {
        combo = 1;
        updateHUD();
    }
    
    function showFeedback(text) {
        feedbackDisplay.textContent = text;
        feedbackDisplay.style.animation = 'none';
        // Force le reflow pour redémarrer l'animation
        void feedbackDisplay.offsetWidth; 
        feedbackDisplay.style.animation = 'fadeUp 0.6s ease-out';
    }
});
