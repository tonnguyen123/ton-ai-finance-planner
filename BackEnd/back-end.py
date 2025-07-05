from flask import Flask, request, jsonify,send_from_directory
from flask_cors import CORS
from models import db, Expense, Earnings
from datetime import datetime
import base64
import os
from openai import OpenAI
import json
import requests 

from dotenv import load_dotenv
load_dotenv()  # this will read from .env
client = OpenAI() 


app = Flask(__name__)
CORS(app)

# SQLite database config
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///data.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

print("📦 Using database URI:", app.config['SQLALCHEMY_DATABASE_URI'])


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

@app.route('/get-expenses', methods=['GET'])   #Fetch all expenses
def get_expenses():
    expenses = Expense.query.all()
    data = [expense.to_dict() for expense in expenses]
    return jsonify({'expenses': data})


@app.route('/get-earnings', methods=['GET'])
def get_earnings():
    earnings = Earnings.query.all()
    data = [e.to_dict() for e in earnings]
    return jsonify({'earnings': data})


@app.route('/screenshots/<path:filename>')
def get_screenshot(filename):
    return send_from_directory('screenshots', filename)

@app.route('/update-exp/<int:expenseID>', methods = ['PUT']) #Update the infromation of the specific expense
def update_expense(expenseID):
    data = request.json
    expense = Expense.query.get(expenseID)

    if not expense:
        return jsonify({'error':'Expense not found.'}), 404
    if 'date' in data:
        expense.date = data['date']
    if 'total_price' in data:
        expense.total_price = data['total_price']
    if 'receipt_type' in data:
        expense.receipt_type = data['receipt_type']
    db.session.commit()
    return jsonify({'message': 'Expense updated successfully'})


@app.route('/delete/<int:expenseID>', methods = ['DELETE'])  #Delete the expense
def delete_expense(expenseID):
    expense = Expense.query.get(expenseID)
    print('the id needed to be deleted is ', expenseID)

    if not expense:
        return jsonify({'error': 'Expense not found.'}), 404
    if expense.screenshot_path and os.path.exists(expense.screenshot_path):
        os.remove(expense.screenshot_path)
    db.session.delete(expense)
    db.session.commit()
    return jsonify({'message': 'Expense deleted successfully'}), 200


@app.route('/check-affordability', methods=['POST'])
def check_affordability():
    data = request.json
    income = data.get('income')
    expenses = data.get('expenses')
    question = data.get('question')

    prompt = f"""
You are a financial assistant helping someone evaluate affordability. 
Their monthly income is ${income} and expenses are ${expenses}. 
They are asking: "{question}". Give a clear, human explanation whether it’s affordable and why.
"""

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo", 
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        reply = response['choices'][0]['message']['content']
        return jsonify({'reply': reply})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/save-earning', methods=['POST'])
def save_earning():
    try:
        data = request.get_json()
        

        required_fields = ['screenshot', 'date', 'income', 'income_name', 'frequency']
        missing_fields = [field for field in required_fields if not data.get(field)]

        if missing_fields:
            return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400
        screenshot_data = data.get('screenshot')
        date = data.get('date')
        income = data.get('income')
        income_name = data.get('income_name')
        frequency = data.get('frequency')

        if not all([screenshot_data, date, income, income_name, frequency]):
            return jsonify({"error": "Missing fields"}), 400

        filename = f"earning_{datetime.now().strftime('%Y%m%d%H%M%S')}.jpg"
        screenshot_path = os.path.join("screenshots", filename)  # use same folder

        with open(screenshot_path, "wb") as f:
            f.write(base64.b64decode(screenshot_data.split(",")[1]))

        new_earning = Earnings(
            date=date,
            income=income,
            income_name=income_name,
            frequency=frequency,
            screenshot_path=screenshot_path
        )
        db.session.add(new_earning)
        db.session.commit()

        return jsonify({"message": "Earning saved"})
    
    except Exception as e:
        print(" Error saving earning:", e)
        return jsonify({"error": str(e)}), 500
    
    
    


@app.route('/parse-payslip', methods=['POST'])
def parse_payslip():
    data = request.get_json()
    raw_text = data.get("text", "")

    prompt = f"""
You are an assistant that extracts information from payslips. 
Given this OCR text, extract:
- Employer Name
- Net Income
- Payment Date (format: YYYY-MM-DD)
- Payment Frequency (One-time, Monthly, Weekly, Bi-weekly)

If any field is missing, return an empty string.

Text:
{raw_text}

Respond ONLY in JSON like:
{{
  "employer": "...",
  "income": "...",
  "payment_date": "...",
  "frequency": "..."
}}
"""

    try:
        openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
        if not openrouter_api_key:
            return jsonify({"error": "Missing OPENROUTER_API_KEY"}), 500

        headers = {
            "Authorization": f"Bearer {openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost",
            "X-Title": "AI Pay Slip Parser"
        }

        payload = {
            "model": "mistralai/mistral-small-3.2-24b-instruct:free",
            "messages": [{"role": "user", "content": prompt}]
        }

        res = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
        print(" Response status:", res.status_code)
        print(" Response content:", res.text)
        res.raise_for_status()

        response_text = res.json()["choices"][0]["message"]["content"]
        print("🔍 Raw response:", response_text)

        json_start = response_text.find("{")
        json_end = response_text.rfind("}") + 1
        json_string = response_text[json_start:json_end]

        parsed_data = json.loads(json_string)
        print("✅ Parsed:", parsed_data)

        # ✅ RETURN parsed JSON to frontend
        return jsonify(parsed_data)

    except Exception as e:
        print("GPT error:", e)
        return jsonify({"error": str(e)}), 500





if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
