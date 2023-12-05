'''
This file contains the models for the database. It also contains the function to create the tables.
'''
from flask_sqlalchemy import SQLAlchemy
from datetime import timedelta
db = SQLAlchemy()

class User(db.Model):
    '''
    This class represents a user in the database.

    ---
    | Attribute        | Type    | Description                      |
    |------------------|---------|----------------------------------|
    | `id`             | Integer | (primary key) Id of the user     |
    | `username`       | String  | Username of the user             |
    | `email`          | String  | Email of the user                |
    '''
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    def __repr__(self):
        return f'<User {self.username}>'

class Task(db.Model):
    '''
     This class represents a task in the database.

    ---
    | Attribute        | Type    | Description                      |
    |------------------|---------|----------------------------------|
    | `id`             | Integer | (primary key) Id of the task     |
    | `task_name`      | String  | Name of the task           |
    | `duration_minutes`| Integer| Duration of the task in minutes |
    | `category`       | String  | Category of the task        |
    | `priority`       | String  | Priority of the task        |
    | `is_done`        | Boolean | (default=False) Task status      |
    '''
    #how to create better docstrings with markdown

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
