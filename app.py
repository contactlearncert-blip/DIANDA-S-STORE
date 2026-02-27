from flask import Flask, render_template, jsonify, request
import json
import os
from urllib.parse import quote
from supabase import create_client

app = Flask(__name__)

# Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')
WHATSAPP_NUMBER = "22676593914"

# Initialisation Supabase
supabase = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

def load_products():
    """Charge les produits depuis Supabase ou fallback JSON"""
    try:
        if supabase:
            response = supabase.table('products').select('*').execute()
            if response.data:
                return response.data
    except Exception as e:
        print(f"Erreur Supabase: {e}")
    
    # Fallback JSON
    try:
        with open('products.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/product/<int:product_id>')
def product_detail(product_id):
    products = load_products()
    product = next((p for p in products if p['id'] == product_id), None)
    if product:
        return render_template('product_detail.html', product=product)
    return "Produit non trouvé", 404

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/api/products')
def get_products():
    products = load_products()
    return jsonify(products)

@app.route('/api/whatsapp-link', methods=['POST'])
def whatsapp_link():
    try:
        data = request.json
        items = data.get('items', [])
        
        message = "Bonjour DIANDA S'STORE, je souhaite commander :\n\n"
        total = 0
        
        for item in items:
            item_total = item['price'] * item['quantity']
            total += item_total
            message += f"• {item['name']} x{item['quantity']} = {item_total} FCFA\n"
        
        message += f"\n💰 TOTAL: {total} FCFA"
        message += f"\n\n📞 {WHATSAPP_NUMBER}"
        
        url = f"https://wa.me/{WHATSAPP_NUMBER}?text={quote(message)}"
        return jsonify({'url': url})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)