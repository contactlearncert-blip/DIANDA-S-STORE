document.addEventListener('DOMContentLoaded', function() {
    initHamburgerMenu();
    initCarousel();
    initSearch();
    initContactForm();
    initImageModal();
});

// Menu hamburger
function initHamburgerMenu() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mainNav = document.getElementById('main-nav');
    
    if (hamburgerBtn && mainNav) {
        hamburgerBtn.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            hamburgerBtn.classList.toggle('active');
        });
        
        // Fermer le menu en cliquant sur un lien
        document.querySelectorAll('.main-nav a').forEach(link => {
            link.addEventListener('click', function() {
                mainNav.classList.remove('active');
                hamburgerBtn.classList.remove('active');
            });
        });
        
        // Fermer le menu en cliquant en dehors
        document.addEventListener('click', function(e) {
            if (!mainNav.contains(e.target) && 
                !hamburgerBtn.contains(e.target) && 
                mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                hamburgerBtn.classList.remove('active');
            }
        });
    }
}

// Carousel
function initCarousel() {
    const items = document.querySelectorAll('.carousel-item');
    const indicators = document.querySelectorAll('.indicator');
    let currentIndex = 0;
    let interval;
    
    function showSlide(index) {
        items.forEach(item => item.style.display = 'none');
        indicators.forEach(ind => ind.classList.remove('active'));
        
        items[index].style.display = 'block';
        indicators[index].classList.add('active');
    }
    
    function nextSlide() {
        currentIndex = (currentIndex + 1) % items.length;
        showSlide(currentIndex);
    }
    
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            clearInterval(interval);
            currentIndex = index;
            showSlide(currentIndex);
            startAutoSlide();
        });
    });
    
    function startAutoSlide() {
        interval = setInterval(nextSlide, 5000);
    }
    
    showSlide(currentIndex);
    startAutoSlide();
}

// Recherche
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

function performSearch() {
    const searchTerm = document.getElementById('search-input').value.trim();
    if (searchTerm) {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('recherche', searchTerm);
        window.location.href = currentUrl.toString();
    }
}

// Formulaire de contact
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nom = document.getElementById('nom').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            const messageDiv = document.getElementById('form-message');
            
            if (!nom || !email || !message) {
                showMessage(messageDiv, 'Veuillez remplir tous les champs obligatoires', 'error');
                return;
            }
            
            // Simuler l'envoi du formulaire
            setTimeout(() => {
                showMessage(messageDiv, 'Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.', 'success');
                contactForm.reset();
            }, 1000);
        });
    }
}

function showMessage(element, message, type) {
    element.textContent = message;
    element.className = 'form-message ' + type;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Modal pour afficher les images en grand
function initImageModal() {
    var modal = document.getElementById('image-modal');
    var modalImg = document.getElementById('modal-image');
    var closeBtn = document.querySelector('.close-modal');
    
    // Récupérer toutes les images de produits
    var productImages = document.querySelectorAll('.product-image');
    
    // Ajouter un événement de clic à chaque image
    productImages.forEach(function(img) {
        img.addEventListener('click', function(e) {
            e.preventDefault();
            modal.style.display = 'flex';
            modalImg.src = this.src;
        });
    });
    
    // Fermer le modal en cliquant sur le bouton de fermeture
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // Fermer le modal en cliquant en dehors de l'image
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}