# app.py
from flask import Flask, request, jsonify, render_template
import stripe
import sqlite3 # Using sqlite3 as an example for database access
from config import STRIPE_SECRET_KEY, FLASK_SECRET_KEY, SUCCESS_URL, CANCEL_URL
import os

app = Flask(__name__)
app.secret_key = FLASK_SECRET_KEY # Needed for Flask's internal security features

stripe.api_key = STRIPE_SECRET_KEY

# --- Database setup and helper functions ---
DATABASE = 'your_ecommerce_db.db' # Path to your SQLite database file

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row # This makes rows behave like dictionaries
    return conn

def init_db():
    # This function should only be called once to create tables
    with app.app_context():
        db = get_db()
        cursor = db.cursor()
        # CREATE TABLE statements as provided in the previous turn
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                service_id VARCHAR(255) NOT NULL UNIQUE,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price_cents INT NOT NULL,
                type VARCHAR(50) NOT NULL DEFAULT 'one-time',
                stripe_product_id VARCHAR(255) NOT NULL,
                stripe_price_id VARCHAR(255) NOT NULL
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INT,
                stripe_checkout_session_id VARCHAR(255) UNIQUE,
                total_amount_cents INT NOT NULL,
                currency VARCHAR(10) NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                price_at_purchase_cents INT NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
            )
        ''')
        db.commit()
        # You'll run your INSERT statements (from previous turn) separately or here after creation
        # Example:
        # cursor.execute("INSERT INTO products (service_id, name, description, price_cents, type, stripe_product_id, stripe_price_id) VALUES ('consultation', 'Business Management Consultation', '...', 30000, 'one-time', 'prod_...', 'price_...')")
        # db.commit()
        print("Database initialized or already exists.")


# --- Main Route for your index.html (Optional, if Flask serves your frontend) ---
@app.route('/')
def index():
    # If Flask serves your frontend, you would render your index.html here
    # For simplicity, we assume your HTML files are served statically (e.g., by Apache/Nginx or directly from browser)
    # You might just return a simple message, or your actual index.html if Flask handles it.
    return render_template('index.html') # Requires a 'templates' folder with index.html

# --- Backend Endpoint to Create Stripe Checkout Session ---
@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        data = request.json
        service_id = data.get('service_id')

        if not service_id:
            return jsonify({'error': 'service_id is required'}), 400

        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT stripe_price_id, type FROM products WHERE service_id = ?", (service_id,))
        product_info = cursor.fetchone()

        if not product_info:
            return jsonify({'error': 'Service not found in database'}), 404

        stripe_price_id = product_info['stripe_price_id']
        product_type = product_info['type']

        # Prepare line_items for Stripe Checkout Session
        line_items = [{
            'price': stripe_price_id,
            'quantity': 1, # Always 1 for services/subscriptions
        }]

        if product_type == 'subscription':
            session_mode = 'subscription'
        else:
            session_mode = 'payment'

        checkout_session = stripe.checkout.Session.create(
            line_items=line_items,
            mode=session_mode,
            success_url=SUCCESS_URL + '?session_id={CHECKOUT_SESSION_ID}', # Pass session ID to success page
            cancel_url=CANCEL_URL,
            # Optional: Add customer email if you have it
            # customer_email='customer@example.com',
        )

        return jsonify({'id': checkout_session.id})

    except stripe.error.StripeError as e:
        # Handle Stripe API errors
        print(f"Stripe Error: {e}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        # Handle other unexpected errors
        print(f"Server Error: {e}")
        return jsonify({'error': 'An internal server error occurred.'}), 500

# --- Success and Cancel Redirect Routes ---
@app.route('/success')
def success():
    session_id = request.args.get('session_id')
    if session_id:
        # Optional: Retrieve the session to confirm payment status
        # try:
        #     checkout_session = stripe.checkout.Session.retrieve(session_id)
        #     # You can log this or update your database here
        #     print(f"Successful checkout: {checkout_session.id} for customer {checkout_session.customer}")
        # except stripe.error.StripeError as e:
        #     print(f"Error retrieving session: {e}")
        pass # For now, just render the success page
    return "<h1>Payment Successful!</h1><p>Thank you for your purchase.</p><p>Your Session ID: " + (session_id or 'N/A') + "</p><a href='/'>Go Home</a>"


@app.route('/cancel')
def cancel():
    return "<h1>Payment Canceled</h1><p>Your payment was not processed. Please try again.</p><a href='/'>Go Home</a>"

if __name__ == '__main__':
    # Initialize database tables if they don't exist
    init_db()
    # If you serve frontend statically, you'd just run app.run()
    # If you want Flask to serve index.html, create a 'templates' folder and put index.html inside
    app.run(debug=True) # debug=True is for development, set to False in production
