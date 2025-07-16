from flask import Flask, request, jsonify,send_from_directory
from flask_cors import CORS
from models import db, Expense, Earnings, Passowrd, BudgetLimit, Theme, SavingsGoal
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

print("Using database URI:", app.config['SQLALCHEMY_DATABASE_URI'])


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

# Save 4-digit PIN
@app.route('/set-pin', methods=['POST'])
def set_pin():
    data = request.get_json()
    pin = data.get('pin')
    print('pin sent from front end is ' + pin)
    if not pin or len(pin) != 4:
        return jsonify({'error': 'PIN must be 4 digits'}), 400

    existing = Passowrd.query.first()
    if existing:
        existing.password = pin
    else:
        new_pin = Passowrd(password=pin)
        db.session.add(new_pin)
    db.session.commit()
    return jsonify({'message': 'PIN saved'}), 200


# Get existing PIN (to check if one exists)
@app.route('/get-pin', methods=['GET'])
def get_pin():
    pin_entry = Passowrd.query.first()
    return jsonify({'pin': pin_entry.password if pin_entry else None}), 200


#Create monthly budget or by specific month and year
@app.route('/create-budget-limit', methods=['POST'])
def create_budget_limit():
    data = request.get_json()
    print("Incoming data:", data) 

    limit = data.get('limit')
    month = data.get('month')
    year = data.get('year')
    
    try:
        print("Parsed limit:", limit, "month:", month, "year:", year)

        existing = BudgetLimit.query.filter_by(month=month, year=year).first()
        print("Existing budget:", existing)

        if existing:
            existing.limit = limit
            message = "Budget limit updated"
        else:
            new_budget = BudgetLimit(limit=limit, month=month, year=year)
            db.session.add(new_budget)
            message = "Budget limit created."
        
        db.session.commit()
        return jsonify({'message': message}), 200
    
    except Exception as e:
        print(" Error creating budget limit:", e)
        return jsonify({'error': str(e)}), 500

#Get the theme for the app
@app.route('/get-theme', methods=['GET'])
def get_theme():
    theme = Theme.query.first()
    if not theme:
        theme = Theme(textColor="#000000", background="#FFFFFF")  # default colors
        db.session.add(theme)
        db.session.commit()
    return jsonify(theme.to_dict())


#Update the theme colors for the app
@app.route('/update-theme', methods=['POST'])
def update_theme():
    data = request.get_json()
    theme = Theme.query.first()
    if theme:
        theme.textColor = data.get('textColor', theme.textColor)
        theme.background = data.get('background', theme.background)
    else:
        theme = Theme(textColor=data.get('textColor'), background=data.get('background'))
        db.session.add(theme)
    db.session.commit()
    return jsonify(theme.to_dict())

#get all budget limits
@app.route('/get-limits', methods = ['GET'])
def get_limit():
    limits = BudgetLimit.query.all()
    data = [l.to_dict() for l in limits]
    return jsonify({'limits': data})


@app.route('/create-goal', methods=['POST'])
def create_goal():
    try:
        data = request.get_json()

        goal_name = data.get('goal_name')
        target_amount = float(data.get('target_amount', 0))
        start_time = datetime.fromisoformat(data.get('start_time'))
        end_time = datetime.fromisoformat(data.get('end_time'))

        if not goal_name or not target_amount or not start_time or not end_time:
            return jsonify({'error': 'Missing required fields'}), 400

        new_goal = SavingsGoal(
            goal_name=goal_name,
            target_amount=target_amount,
            start_time=start_time,
            end_time=end_time,
        )

        db.session.add(new_goal)
        db.session.commit()

        return jsonify({'message': 'Goal created successfully!', 'goal': new_goal.to_dict()}), 201

    except Exception as e:
        print("Error creating goal:", e)
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/get-goals', methods=['GET'])
def get_goals():
    goals = SavingsGoal.query.all()
    data = [g.to_dict() for g in goals]
    return jsonify({'limits': data})

@app.route('/delete-goal/<int:goalID>',methods=['DELETE'])
def delete_goal(goalID):
    goal = SavingsGoal.query.get(goalID)
    if not goal:
        return jsonify({'error': 'Goal not found.'}), 404

    db.session.delete(goal)
    db.session.commit()
    return jsonify({'message': 'Goal deleted successfully'}), 200

@app.route('/update-goal/<int:goalID>', methods=['PUT'])
def update_goal(goalID):
    data = request.get_json()
    goal = SavingsGoal.query.get(goalID)

    if not goal:
        return jsonify({'error': 'Goal not found.'}), 404

    # Update fields if they exist in the request body
    if 'goal_name' in data:
        goal.goal_name = data['goal_name']

    if 'target_amount' in data:
        try:
            goal.target_amount = float(data['target_amount'])
        except ValueError:
            return jsonify({'error': 'Invalid target amount.'}), 400

    # Optional: add more fields if needed
    # e.g., start_time, end_time

    try:
        db.session.commit()
        return jsonify({'message': 'Goal updated successfully.'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update goal.', 'details': str(e)}), 500




@app.route('/chatbot', methods=['POST'])
def chatbot():
    try:
        # Step 1: Get user question
        data = request.get_json()
        question = data.get("question", "")

        # Step 2: Load data from your DB
        goals = SavingsGoal.query.all()
        limits = BudgetLimit.query.all()
        earnings = Earnings.query.all()
        expenses = Expense.query.all()

        # Step 3: Format data for GPT prompt
        goal_summary = goal_summary = "\n".join([
    f"- Goal: {g.goal_name}, Target: ${g.target_amount}, From: {g.start_time.date()} to {g.end_time.date()}"
    for g in goals
])

        
        earning_summary = "\n".join([f"- {e.income_name}, ${e.income}, {e.date}, {e.frequency}" for e in earnings])
        expense_summary = "\n".join([f"- {x.receipt_type}, ${x.total_price}, {x.date}" for x in expenses])

        # Step 4: Build prompt
        prompt = f"""
You are a financial assistant AI helping the user understand their personal finances.

Here is the user’s financial data:
Goals:
{goal_summary}



 Earnings:
{earning_summary}

 Expenses:
{expense_summary}

Now, answer this question from the user:
"{question}"

Be concise, friendly, and helpful.
"""

        # Step 5: Send to OpenRouter
        openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
        if not openrouter_api_key:
            return jsonify({"error": "Missing OPENROUTER_API_KEY"}), 500

        headers = {
            "Authorization": f"Bearer {openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost",
            "X-Title": "AI Financial Assistant"
        }

        payload = {
            "model": "mistralai/mistral-small-3.2-24b-instruct:free",
            "messages": [
                {"role": "system", "content": "You are a helpful AI financial assistant."},
                {"role": "user", "content": prompt}
            ]
        }

        res = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
        res.raise_for_status()
        response_text = res.json()["choices"][0]["message"]["content"]

        return jsonify({"answer": response_text})

    except Exception as e:
        print("Chatbot error:", e)
        return jsonify({"error": str(e)}), 500




if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
    
