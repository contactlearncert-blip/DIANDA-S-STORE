from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Données produits - information uniquement pour la librairie physique
PRODUITS = [
    # Livres
    {
        "id": 1,
        "nom": "Le Petit Prince",
        "categorie": "livre",
        "description": "Un classique intemporel pour tous les âges",
        "image": "petit-prince.jpg",
        "disponible": True,
        "auteur": "Antoine de Saint-Exupéry"
    },
    {
        "id": 2,
        "nom": "1984",
        "categorie": "livre",
        "description": "Roman dystopique de George Orwell",
        "image": "1984.jpg",
        "disponible": True,
        "auteur": "George Orwell"
    },
    {
        "id": 3,
        "nom": "Le Seigneur des Anneaux",
        "categorie": "livre",
        "description": "L'épopée fantastique de Tolkien",
        "image": "seigneur-anneaux.jpg",
        "disponible": True,
        "auteur": "J.R.R. Tolkien"
    },
    {
        "id": 4,
        "nom": "Harry Potter",
        "categorie": "livre",
        "description": "La saga magique de J.K. Rowling",
        "image": "harry-potter.jpg",
        "disponible": True,
        "auteur": "J.K. Rowling"
    },
    {
        "id": 5,
        "nom": "Orgueil et Préjugés",
        "categorie": "livre",
        "description": "Roman d'amour et de société",
        "image": "orgueil-prejuges.jpg",
        "disponible": True,
        "auteur": "Jane Austen"
    },
    
    # Fournitures
    {
        "id": 6,
        "nom": "Cahier Moleskine",
        "categorie": "fourniture",
        "description": "Cahier de qualité supérieure pour vos notes",
        "image": "moleskine.jpg",
        "disponible": True
    },
    {
        "id": 7,
        "nom": "Stylo-plume Parker",
        "categorie": "fourniture",
        "description": "Élégance et précision pour l'écriture",
        "image": "parker.jpg",
        "disponible": True
    },
    {
        "id": 8,
        "nom": "Trousse scolaire",
        "categorie": "fourniture",
        "description": "Trousse en tissu avec fermeture éclair",
        "image": "trousse.jpg",
        "disponible": True
    },
    {
        "id": 9,
        "nom": "Crayons de couleur",
        "categorie": "fourniture",
        "description": "Boîte de 24 crayons de couleur",
        "image": "crayons.jpg",
        "disponible": True
    },
    {
        "id": 10,
        "nom": "Règle 30cm",
        "categorie": "fourniture",
        "description": "Règle transparente graduée",
        "image": "regle.jpg",
        "disponible": True
    },
        {
        "id": 11,
        "nom": "Crayon à papier",
        "categorie": "fourniture",
        "description": "Crayon HB pour écriture et dessin",
        "image": "crayon-papier.jpg",
        "disponible": True
    },
    {
        "id": 12,
        "nom": "Gomme",
        "categorie": "fourniture",
        "description": "Gomme blanche douce",
        "image": "gomme.jpg",
        "disponible": True
    },
    {
        "id": 13,
        "nom": "Taille-crayon",
        "categorie": "fourniture",
        "description": "Taille-crayon en plastique avec lame acier",
        "image": "taille_crayon.jpg",
        "disponible": True
    },
    {
        "id": 14,
        "nom": "Cahier 100 pages",
        "categorie": "fourniture",
        "description": "Cahier grand format, couverture souple",
        "image": "cahier.jpg",
        "disponible": True
    },
    {
        "id": 15,
        "nom": "Classeur",
        "categorie": "fourniture",
        "description": "Classeur rigide A4",
        "image": "classeur.jpg",
        "disponible": False
    },
    {
        "id": 16,
        "nom": "Feutres de couleur",
        "categorie": "fourniture",
        "description": "Boîte de 12 feutres",
        "image": "feutres.jpg",
        "disponible": True
    },
    {
        "id": 17,
        "nom": "Ciseaux",
        "categorie": "fourniture",
        "description": "Ciseaux scolaires bout rond",
        "image": "ciseaux.jpg",
        "disponible": True
    },
    {
        "id": 18,
        "nom": "Colle",
        "categorie": "fourniture",
        "description": "Colle en stick",
        "image": "colle.jpg",
        "disponible": True
    },
    
    # Outils artistiques
    {
        "id": 11,
        "nom": "Set de peinture acrylique",
        "categorie": "outils_artistique",
        "description": "12 couleurs vibrantes pour vos créations",
        "image": "peinture.jpg",
        "disponible": True
    },
    {
        "id": 12,
        "nom": "Toile à peindre 50x60cm",
        "categorie": "outils_artistique",
        "description": "Toile de qualité professionnelle",
        "image": "toile.jpg",
        "disponible": True
    },
    {
        "id": 13,
        "nom": "Pinceaux artistiques",
        "categorie": "outils_artistique",
        "description": "Set de 10 pinceaux de différentes tailles",
        "image": "pinceaux.jpg",
        "disponible": True
    },
    {
        "id": 14,
        "nom": "Chevalet en bois",
        "categorie": "outils_artistique",
        "description": "Chevalet réglable pour peinture",
        "image": "chevalet.jpg",
        "disponible": True
    },
    {
        "id": 15,
        "nom": "Cahier de croquis",
        "categorie": "outils_artistique",
        "description": "Cahier à spirale pour dessins et croquis",
        "image": "croquis.jpg",
        "disponible": True
    }
]

CATEGORIES = [
    {"id": "livre", "name": "Livres"},
    {"id": "fourniture", "name": "Fournitures"},
    {"id": "outils_artistique", "name": "Outils artistique & décoration"}
]

@app.route('/')
def index():
    carousel_images = [
        {
            "id": 1, 
            "src": "carousel1.jpg", 
            "alt": "Notre librairie",
            "title": "Bienvenue chez nous",
            "description": "Découvrez notre univers chaleureux et accueillant"
        },
        {
            "id": 2, 
            "src": "carousel2.jpg", 
            "alt": "Nos rayons",
            "title": "Large choix",
            "description": "Des milliers de références pour tous les goûts"
        },
        {
            "id": 3, 
            "src": "carousel3.jpg", 
            "alt": "Événements",
            "title": "Venez voir l'exceptionnel",
            "description": "Votre librairie de référence pour livres et fournitures scolaires"
        }
    ]
    
    return render_template('index.html', 
                          carousel_images=carousel_images,
                          categories=CATEGORIES)

@app.route('/catalogue')
def catalogue():
    categorie = request.args.get('categorie', '')
    recherche = request.args.get('recherche', '').lower()
    
    produits_filtres = PRODUITS
    if categorie:
        produits_filtres = [p for p in produits_filtres if p['categorie'] == categorie]
    if recherche:
        produits_filtres = [p for p in produits_filtres if recherche in p['nom'].lower() or recherche in p['description'].lower()]
    
    return render_template('catalogue.html', 
                          produits=produits_filtres,
                          categories=CATEGORIES,
                          categorie_active=categorie,
                          recherche=recherche)

@app.route('/contact')
def contact():
    return render_template('contact.html', categories=CATEGORIES)

@app.route('/api/message', methods=['POST'])
def envoyer_message():
    data = request.json
    return jsonify({"success": True, "message": "Message envoyé avec succès!"})

if __name__ == '__main__':
    app.run(debug=True)