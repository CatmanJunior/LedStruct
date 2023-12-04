from flask_sqlalchemy import SQLAlchemy
from datetime import timedelta
db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    def __repr__(self):
        return f'<User {self.username}>'
    
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_name = db.Column(db.String(200), nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False)
    # time_worked = db.Column(db.Interval, default=timedelta())
    category = db.Column(db.String(50))
    priority = db.Column(db.String(20))
    is_done = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<Task {self.task_name}>'

def create_tables(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()
