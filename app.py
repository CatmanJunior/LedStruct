from flask import Flask, render_template, request, redirect, url_for
from livereload import Server
from livereload.watcher import Watcher
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from flask_sqlalchemy import SQLAlchemy
from models import db, User, Task, create_tables

app = Flask(__name__)
app.config['SECRET_KEY'] = 'jhgkjgj7ytddhb78e'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mydatabase.db'

create_tables(app)

with app.app_context():
    all_tasks = Task.query.all()
    tasks_in_category = Task.query.filter_by(category='Work').all()
    print(all_tasks)

class CustomWatcher(Watcher):
    def is_glob_changed(self, path):
        return True
    
class MyForm(FlaskForm):
    name = StringField('Name', render_kw={'class': 'form-control'})
    email = StringField('Email', render_kw={'class': 'form-control'})
    submit = SubmitField('Submit', render_kw={'class': 'btn btn-primary'})

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/form', methods=['GET', 'POST'])
def form():
    form = MyForm()
    if form.validate_on_submit():
        # Process form data
        name = form.name.data
        return f"Hello, {name}!"
    return render_template('forms.html', form=form)

@app.route('/add_task', methods=['POST'])
def add_task():
    task_name = request.form.get('task_name')
    duration_minutes = int(request.form.get('duration_minutes'))
    category = request.form.get('category')
    priority = request.form.get('priority')
    with app.app_context():
        new_task = Task(task_name=task_name, duration_minutes=duration_minutes, category=category, priority=priority)
        db.session.add(new_task)
        db.session.commit()
    return

# @app.route('/tasks')
# def task_list():
#     tasks = Task.query.all()
#     return render_template('task_list.html', tasks=tasks)

if __name__ == '__main__':
    server = Server(app.wsgi_app)
    server.watcher = CustomWatcher()  # Use the custom watcher
    server.serve(port=5000, liveport=35729)  # Specify the liveport for browser synchronization