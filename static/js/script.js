// ========================================
// CONFIGURATION
// ========================================
const CONFIG = {
    API_PRODUCTS: '/api/products',
    WHATSAPP_NUMBER: '22676593914',
    ITEMS_PER_PAGE: 8,
    CART_KEY: 'dianada_cart'
};

// ========================================
// ÉTAT GLOBAL
// ========================================
let state = {
    products: [],
    filteredProducts: [],
    cart: [],
    currentPage: 1,
    currentCategory: 'all'
};

// ========================================
// INITIALISATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DIANDA S\'STORE - Mode Mobile');
    console.log('URL actuelle:', window.location.href);
    console.log('Éléments trouvés:', {
        cartToggle: document.getElementById('cartToggle') ? '✅' : '❌',
        cartModal: document.getElementById('cartModal') ? '✅' : '❌',
        cartItems: document.getElementById('cartItems') ? '✅' : '❌',
        cartTotal: document.getElementById('cartTotal') ? '✅' : '❌',
        checkoutBtn: document.getElementById('checkoutBtn') ? '✅' : '❌'
    });
    
    loadCart();
    loadProducts();
    setupEventListeners();
    
    // Vérification supplémentaire après chargement
    setTimeout(() => {
        console.log('État du panier après chargement:', state.cart);
    }, 500);
});

// ========================================
// CHARGEMENT DES PRODUITS DEPUIS LA BDD
// ========================================
async function loadProducts() {
    try {
        const response = await fetch(CONFIG.API_PRODUCTS);
        if (!response.ok) throw new Error('Erreur réseau');
        
        const data = await response.json();
        
        state.products = data.map(p => ({
            id: parseInt(p.id),
            name: p.name || 'Produit sans nom',
            price: parseInt(p.price) || 0,
            description: p.description || '',
            image: p.image || '/static/img/placeholder.png',
            category: p.category || 'Non catégorisé'
        }));
        
        state.filteredProducts = [...state.products];
        
        // Vérifier s'il y a une catégorie dans l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        if (categoryParam) {
            filterCategory(categoryParam);
        } else {
            renderProducts();
        }
        
        console.log(`${state.products.length} produits chargés depuis la BDD`);
        console.log('Premier produit:', state.products[0]);
        
    } catch (error) {
        console.error('❌ Erreur chargement:', error);
        showNotification('Impossible de charger les produits', 'error');
        
        const grid = document.getElementById('productsGrid');
        if (grid) {
            grid.innerHTML = '<p style="text-align:center; padding:40px; color:#dc3545;">Erreur de chargement des produits</p>';
        }
    }
}

// ========================================
// RENDU DES PRODUITS
// ========================================
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    const start = (state.currentPage - 1) * CONFIG.ITEMS_PER_PAGE;
    const end = start + CONFIG.ITEMS_PER_PAGE;
    const pageProducts = state.filteredProducts.slice(start, end);
    
    if (state.filteredProducts.length === 0) {
        grid.innerHTML = '<p style="text-align:center; padding:40px; grid-column:1/-1;">Aucun produit trouvé</p>';
        return;
    }
    
    grid.innerHTML = pageProducts.map(product => `
        <div class="product-card">
            <a href="/product/${product.id}" class="product-link">
                <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy" 
                     onerror="this.src='/static/img/placeholder.png'">
                <div class="product-info">
                    <div class="product-category">${product.category || 'Non catégorisé'}</div>
                    <h3 class="product-name">${escapeHtml(product.name)}</h3>
                </div>
            </a>
            <div class="product-footer">
                <span class="product-price">${product.price.toLocaleString()} FCFA</span>
                <button class="btn add-to-cart-btn" 
                        data-id="${product.id}"
                        data-name="${escapeJs(product.name)}"
                        data-price="${product.price}">
                    Ajouter
                </button>
            </div>
        </div>
    `).join('');
    
    // Attacher les écouteurs d'événements aux nouveaux boutons
    attachAddToCartListeners();
    renderPagination();
}

// ========================================
// ATTACHER LES ÉCOUTEURS AUX BOUTONS AJOUTER
// ========================================
function attachAddToCartListeners() {
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const id = parseInt(this.dataset.id);
            const name = this.dataset.name;
            const price = parseInt(this.dataset.price);
            
            addToCart(id, name, price);
        });
    });
}

// ========================================
// PAGINATION
// ========================================
function renderPagination() {
    const container = document.getElementById('pagination');
    if (!container) return;
    
    const totalPages = Math.ceil(state.filteredProducts.length / CONFIG.ITEMS_PER_PAGE);
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '<div class="pagination-controls">';
    
    // Bouton précédent
    html += `<button class="pagination-btn prev-btn" onclick="goToPage(${state.currentPage - 1})" 
             ${state.currentPage === 1 ? 'disabled' : ''}>‹</button>`;
    
    // Numéros de page
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= state.currentPage - 1 && i <= state.currentPage + 1)) {
            html += `<button class="pagination-btn ${i === state.currentPage ? 'active' : ''}" 
                           onclick="goToPage(${i})">${i}</button>`;
        } else if (i === state.currentPage - 2 || i === state.currentPage + 2) {
            html += `<span class="pagination-dots">...</span>`;
        }
    }
    
    // Bouton suivant
    html += `<button class="pagination-btn next-btn" onclick="goToPage(${state.currentPage + 1})" 
             ${state.currentPage === totalPages ? 'disabled' : ''}>›</button>`;
    
    html += '</div>';
    container.innerHTML = html;
}

function goToPage(page) {
    const totalPages = Math.ceil(state.filteredProducts.length / CONFIG.ITEMS_PER_PAGE);
    if (page < 1 || page > totalPages) return;
    
    state.currentPage = page;
    renderProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================================
// FILTRAGE PAR CATÉGORIE
// ========================================
function filterCategory(category) {
    state.currentCategory = category;
    state.currentPage = 1;
    
    if (category === 'all' || category === 'Tous') {
        state.filteredProducts = [...state.products];
    } else {
        state.filteredProducts = state.products.filter(p => 
            p.category && p.category.toLowerCase() === category.toLowerCase()
        );
    }
    
    renderProducts();
    
    document.querySelectorAll('.category-nav li, .mobile-menu-nav a').forEach(el => {
        if (el.tagName === 'LI') {
            el.classList.remove('active');
            if ((category === 'all' || category === 'Tous') && el.textContent.trim() === 'Tous') {
                el.classList.add('active');
            } else if (el.textContent.trim() === category) {
                el.classList.add('active');
            }
        }
    });
}

// ========================================
// GESTION DU PANIER
// ========================================
function addToCart(id, name, price) {
    console.log('Ajout au panier:', { id, name, price });
    
    if (!id || !name || !price) {
        console.error('Paramètres invalides pour addToCart');
        return;
    }
    
    // Conversion en nombres
    id = parseInt(id);
    price = parseInt(price);
    
    const existing = state.cart.find(item => item.id === id);
    
    if (existing) {
        existing.quantity++;
    } else {
        state.cart.push({ id, name, price, quantity: 1 });
    }
    
    saveCart();
    updateCartCount();
    showNotification(`✅ ${name} ajouté au panier`);
    animateCartCount();
}

function updateCartCount() {
    const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
    });
}

function animateCartCount() {
    const badges = document.querySelectorAll('.cart-count');
    badges.forEach(badge => {
        badge.style.transform = 'scale(1.3)';
        setTimeout(() => {
            badge.style.transform = 'scale(1)';
        }, 200);
    });
}

function saveCart() {
    try {
        localStorage.setItem(CONFIG.CART_KEY, JSON.stringify(state.cart));
        console.log('Panier sauvegardé:', state.cart);
    } catch (e) {
        console.warn('Erreur sauvegarde panier:', e);
    }
}

function loadCart() {
    const saved = localStorage.getItem(CONFIG.CART_KEY);
    if (saved) {
        try {
            state.cart = JSON.parse(saved);
            updateCartCount();
            console.log('Panier chargé:', state.cart);
        } catch (e) {
            state.cart = [];
        }
    }
}

// ========================================
// AFFICHAGE DU PANIER
// ========================================
function displayCart() {
    console.log('🛒 Affichage du panier');
    
    const container = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    
    if (!container) {
        console.error('❌ Élément #cartItems non trouvé dans le DOM');
        return;
    }
    
    if (!totalEl) {
        console.error('❌ Élément #cartTotal non trouvé dans le DOM');
        return;
    }
    
    console.log('Contenu du panier:', state.cart);
    
    if (state.cart.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px;">
                <span style="font-size:50px;">🛒</span>
                <p style="color:#999; margin-top:10px;">Votre panier est vide</p>
            </div>
        `;
        totalEl.textContent = '0';
        return;
    }
    
    let total = 0;
    let html = '';
    
    state.cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        html += `
            <div class="cart-item" style="border-bottom:1px solid #eee; padding:10px; margin-bottom:10px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <strong>${escapeHtml(item.name)}</strong>
                    <span style="color:#0d6efd;">${item.price.toLocaleString()} FCFA</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; gap:10px; align-items:center;">
                        <button class="qty-delete-btn" data-index="${index}" 
                                style="width:36px; height:36px; border:1px solid #ddd; background:white; border-radius:4px; cursor:pointer;">−</button>
                        <span style="font-weight:bold; min-width:30px; text-align:center;">${item.quantity}</span>
                        <button class="qty-add-btn" data-index="${index}" 
                                style="width:36px; height:36px; border:1px solid #ddd; background:white; border-radius:4px; cursor:pointer;">+</button>
                    </div>
                    <button class="remove-item-btn" data-index="${index}"
                            style="background:#dc3545; color:white; border:none; padding:8px 15px; border-radius:4px; cursor:pointer;">
                        Supprimer
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    totalEl.textContent = total.toLocaleString();
    
    // Attacher les écouteurs
    attachSimpleCartListeners();
}

// Version simple des écouteurs pour tester
function attachSimpleCartListeners() {
    document.querySelectorAll('.qty-delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            updateQuantity(index, -1);
        });
    });
    
    document.querySelectorAll('.qty-add-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            updateQuantity(index, 1);
        });
    });
    
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            removeFromCart(index);
        });
    });
}

function updateQuantity(index, change) {
    const item = state.cart[index];
    if (!item) return;
    
    const newQty = item.quantity + change;
    
    if (newQty <= 0) {
        removeFromCart(index);
    } else {
        item.quantity = newQty;
        saveCart();
        updateCartCount();
        displayCart();
    }
}

function removeFromCart(index) {
    const itemName = state.cart[index].name;
    state.cart.splice(index, 1);
    saveCart();
    updateCartCount();
    displayCart();
    showNotification(`🗑️ ${itemName} supprimé`);
}

// ========================================
// COMMANDE WHATSAPP AVEC IMAGES DEPUIS LA BDD
// ========================================
function checkout() {
    console.log('Checkout déclenché');
    
    if (state.cart.length === 0) {
        showNotification('Panier vide', 'warning');
        return;
    }
    
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = 'Préparation...';
    }
    
    // Récupérer l'URL de base du site
    const baseUrl = window.location.origin;
    
    // Construire le message
    let message = "🛍️ *NOUVELLE COMMANDE DIANDA S'STORE*\n\n";
    let total = 0;
    
    // Pour chaque article dans le panier
    state.cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        // Récupérer les détails complets du produit depuis state.products (BDD)
        const productDetails = state.products.find(p => p.id === item.id);
        
        // Ajouter les informations du produit
        message += `📦 *${item.name}*\n`;
        message += `   Quantité: ${item.quantity}\n`;
        message += `   Prix unitaire: ${item.price.toLocaleString()} FCFA\n`;
        message += `   Sous-total: ${itemTotal.toLocaleString()} FCFA\n`;
        
        // AJOUT DE L'IMAGE DU PRODUIT DEPUIS LA BDD
        if (productDetails && productDetails.image) {
            let imageUrl = productDetails.image;
            
            // Si l'image est relative, construire l'URL complète
            if (!imageUrl.startsWith('http')) {
                // Nettoyer le chemin
                imageUrl = imageUrl.replace(/^\.?\//, '');
                if (!imageUrl.startsWith('static/') && !imageUrl.startsWith('img/')) {
                    imageUrl = `static/${imageUrl}`;
                }
                // S'assurer que l'URL commence par static/
                if (!imageUrl.startsWith('static/')) {
                    imageUrl = `static/${imageUrl}`;
                }
                imageUrl = `${baseUrl}/${imageUrl}`;
            }
            
            message += `   📸 *Image:* ${imageUrl}\n`;
            console.log(`Image ajoutée pour ${item.name}:`, imageUrl);
        } else {
            // Chercher dans tous les produits si non trouvé
            const fallbackProduct = state.products.find(p => p.id === item.id);
            if (fallbackProduct && fallbackProduct.image) {
                let imageUrl = fallbackProduct.image;
                if (!imageUrl.startsWith('http')) {
                    imageUrl = imageUrl.replace(/^\.?\//, '');
                    if (!imageUrl.startsWith('static/') && !imageUrl.startsWith('img/')) {
                        imageUrl = `static/${imageUrl}`;
                    }
                    if (!imageUrl.startsWith('static/')) {
                        imageUrl = `static/${imageUrl}`;
                    }
                    imageUrl = `${baseUrl}/${imageUrl}`;
                }
                message += `   📸 *Image:* ${imageUrl}\n`;
            } else {
                message += `   📸 *Image:* ${baseUrl}/static/img/placeholder.png\n`;
            }
        }
        
        message += `\n`;
    });
    
    // Ajouter le récapitulatif
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💰 *TOTAL: ${total.toLocaleString()} FCFA*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Ajouter les informations de contact
    message += `📞 *Téléphone:* +226 ${CONFIG.WHATSAPP_NUMBER}\n`;
    message += `📍 *Boutique:* Ouagadougou, Burkina Faso\n\n`;
    
    // Ajouter la date et heure
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    message += `🕐 *Commande passée le:* ${dateStr}\n\n`;
    
    message += `Merci de confirmer ma commande ! 🙏`;
    
    // Afficher le message dans la console pour déboguer
    console.log('Message WhatsApp généré:', message);
    
    // Encoder le message et ouvrir WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // Ouvrir WhatsApp dans un nouvel onglet
    window.open(url, '_blank');
    
    // Notification de succès
    showNotification('✅ Commande préparée ! Vérifiez WhatsApp', 'success');
    
    // Réactiver le bouton
    setTimeout(() => {
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = 'Commander sur WhatsApp';
        }
    }, 3000);
}

// ========================================
// NOTIFICATION
// ========================================
function showNotification(msg, type = 'success') {
    const oldNotif = document.querySelector('.notification');
    if (oldNotif) oldNotif.remove();
    
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    
    const icon = type === 'success' ? '✅' : 
                 type === 'error' ? '❌' : 
                 type === 'warning' ? '⚠️' : 'ℹ️';
    
    notif.innerHTML = `<span style="margin-right:8px;">${icon}</span>${msg}`;
    document.body.appendChild(notif);
    
    setTimeout(() => notif.classList.add('show'), 10);
    
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// ========================================
// GESTION DES ÉVÉNEMENTS
// ========================================
function setupEventListeners() {
    console.log('Configuration des écouteurs...');
    
    // Menu mobile
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuBackdrop = document.getElementById('menuBackdrop');
    const closeMenu = document.getElementById('closeMenu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            console.log('Menu toggle cliqué');
            if (mobileMenu) mobileMenu.classList.add('active');
            if (menuBackdrop) menuBackdrop.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    window.closeMobileMenu = function() {
        if (mobileMenu) mobileMenu.classList.remove('active');
        if (menuBackdrop) menuBackdrop.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    if (closeMenu) {
        closeMenu.addEventListener('click', window.closeMobileMenu);
    }
    
    if (menuBackdrop) {
        menuBackdrop.addEventListener('click', window.closeMobileMenu);
    }
    
    // PANIER
    const cartToggle = document.getElementById('cartToggle');
    const cartModal = document.getElementById('cartModal');
    
    if (cartToggle) {
        console.log('✅ Bouton panier trouvé');
        
        cartToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🛒 Clic sur le panier');
            console.log('Modal trouvé?', cartModal ? 'Oui' : 'Non');
            
            if (cartModal) {
                // Afficher le contenu du panier
                displayCart();
                
                // Afficher la modal
                cartModal.style.display = 'flex';
                cartModal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                console.log('Modal ouverte');
            } else {
                console.error('❌ Modal panier non trouvé!');
                alert('Erreur: Modal panier non trouvé');
            }
        });
    } else {
        console.error('❌ Bouton panier non trouvé!');
    }
    
    // Fermeture de la modal
    const closeCart = document.getElementById('closeCart');
    if (closeCart) {
        closeCart.addEventListener('click', function() {
            if (cartModal) {
                cartModal.style.display = 'none';
                cartModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Fermeture en cliquant sur l'arrière-plan
    if (cartModal) {
        cartModal.addEventListener('click', function(e) {
            if (e.target === cartModal) {
                cartModal.style.display = 'none';
                cartModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Bouton checkout
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    }
    
    // Fermeture avec la touche Échap
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (cartModal && cartModal.style.display === 'flex') {
                cartModal.style.display = 'none';
                cartModal.classList.remove('active');
                document.body.style.overflow = '';
            }
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                window.closeMobileMenu();
            }
        }
    });
    
    console.log('Écouteurs configurés');
}

// ========================================
// UTILITAIRES D'ÉCHAPPEMENT
// ========================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function escapeJs(text) {
    if (!text) return '';
    return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// ========================================
// FONCTIONS GLOBALES
// ========================================
window.filterCategory = filterCategory;
window.addToCart = addToCart;
window.goToPage = goToPage;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.closeMobileMenu = window.closeMobileMenu;
window.closeCartModal = function() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};
window.checkout = checkout;
window.displayCart = displayCart;
window.showNotification = showNotification;

console.log('✅ Script chargé - Fonctions disponibles:', Object.keys(window).filter(k => 
    k.includes('addToCart') || k.includes('displayCart') || k.includes('checkout')
));