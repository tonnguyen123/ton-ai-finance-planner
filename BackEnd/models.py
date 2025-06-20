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