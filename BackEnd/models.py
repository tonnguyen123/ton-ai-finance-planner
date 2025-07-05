from flask_sqlalchemy import SQLAlchemy

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