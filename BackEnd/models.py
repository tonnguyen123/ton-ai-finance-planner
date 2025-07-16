from flask_sqlalchemy import SQLAlchemy
from datetime import datetime


db = SQLAlchemy()  #Initialize the datbase


class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(50))
    total_price = db.Column(db.Float)
    receipt_type = db.Column(db.String(100))
    screenshot_path = db.Column(db.String(200))

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date,
            'total_price': self.total_price,
            'receipt_type': self.receipt_type,
            'screenshot_path': self.screenshot_path,
        }
    
class Earnings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(50))
    income = db.Column(db.Float)
    income_name = db.Column(db.String(100))
    frequency = db.Column(db.String(200))
    screenshot_path = db.Column(db.String(200))

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date,
            'income': self.income,
            'income_name': self.income_name,
            'frequency': self.frequency,
            'screenshot_path': self.screenshot_path.replace("\\", "/")

        }
    
class Passowrd(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    password = db.Column(db.String(4))
    def to_dict(self):
        return {
            'id': self.id,
            'password': self.password
        }

class BudgetLimit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    limit = db.Column(db.Float)
    month = db.Column(db.String)
    year = db.Column(db.String)
    def to_dict(self):
        return {
            'id': self.id,
            'limit': self.limit,
            'month': self.month,
            'year': self.year,
        }
    
class Theme(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    textColor = db.Column(db.String, default="#000000")  # default to black
    background = db.Column(db.String, default="#FFFFFF")  # default to white

    def to_dict(self):
        return {
            'id': self.id,
            'textColor': self.textColor,
            'background': self.background
        }
    


from datetime import datetime  # <-- Add this at the top

class SavingsGoal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    goal_name = db.Column(db.String(100))
    target_amount = db.Column(db.Float)
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


    def to_dict(self):
        return {
            'id': self.id,
            'goal_name': self.goal_name,
            'target_amount': self.target_amount,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'created_at': self.created_at.isoformat(),
        }



