from flask import Flask, request, jsonify,send_from_directory
from flask_cors import CORS
from models import db, Expense
from datetime import datetime
import base64
import os

from dotenv import load_dotenv
load_dotenv()  # this will read from .env


app = Flask(__name__)
CORS(app)

# SQLite database config
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///data.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Init DB
db.init_app(app)

# ✅ Ensure tables are created
with app.app_context():
    db.create_all()

# Make sure folder for screenshots exists
os.makedirs("screenshots", exist_ok=True)

@app.route('/save-expense', methods=['POST'])
def save_expense():
    data = request.json
    screenshot_base64 = data.get('screenshot')
    date = data.get('date')
    total = data.get('total_price')
    receipt_type = data.get('receipt_type')

    print ("date is ", date)
    print ("total is ", total)
    print ("receipt type is ", receipt_type)

    if not screenshot_base64:
        return jsonify({'error': 'No screenshot provided'}), 400

    # Decode screenshot and save it
    filename = f"screenshots/{datetime.now().strftime('%Y%m%d%H%M%S')}.jpg"
    with open(filename, "wb") as f:
        f.write(base64.b64decode(screenshot_base64.split(",")[1]))

    # Save record in database
    expense = Expense(date=date, total_price=total, receipt_type=receipt_type, screenshot_path=filename)
    db.session.add(expense)
    db.session.commit()

    return jsonify({'message': 'Expense saved successfully'})

@app.route('/get-expenses', methods=['GET'])
def get_expenses():
    expenses = Expense.query.all()
    data = [expense.to_dict() for expense in expenses]
    return jsonify({'expenses': data})

@app.route('/screenshots/<path:filename>')
def get_screenshot(filename):
    return send_from_directory('screenshots', filename)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
