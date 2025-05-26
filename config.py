import os

# IMPORTANT: Use environment variables for sensitive data in production!
# For development, you can put it directly, but still use .env
# For example: export STRIPE_SECRET_KEY='sk_test_...'
STRIPE_SECRET_KEY = os.getenv('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', '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') # <-- REPLACE THIS
# Set a secure secret key for Flask sessions (optional but good practice)
FLASK_SECRET_KEY = os.getenv('527582bee44bb95f60bfb5e2da3adc09ea27ade6fce04dfe', '527582bee44bb95f60bfb5e2da3adc09ea27ade6fce04dfe') # <-- REPLACE THIS

# URLs for redirects after checkout
SUCCESS_URL = 'http://realmstoriches.github.io/success' # <-- Adjust if your domain is different
CANCEL_URL = 'http://realmstoriches.github.io/cancel'   # <-- Adjust if your domain is different
