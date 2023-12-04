from flask import Flask, render_template, request, redirect, url_for, jsonify
from livereload import Server
from livereload.watcher import Watcher
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from flask_sqlalchemy import SQLAlchemy
from models import db, User, Task, create_tables
from database_routes import database_bp  # Import the Blueprint

app = Flask(__name__)
app.config['SECRET_KEY'] = 'jhgkjgj7ytddhb78e'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mydatabase.db'
app.debug = True  # Enable debug mode
app.register_blueprint(database_bp)
create_tables(app)

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

@app.route('/swipe')
def swipe():
    return render_template('taskSwiper.html')

@app.route('/form', methods=['GET', 'POST']) 
def form():
    form = MyForm()
    if form.validate_on_submit():
        # Process form data
        name = form.name.data
        return f"Hello, {name}!"
    return render_template('forms.html', form=form)

if __name__ == '__main__':
    server = Server(app.wsgi_app)
    server.watcher = CustomWatcher()  # Use the custom watcher
    server.serve(port=5000, liveport=35729)  # Specify the liveport for browser synchronization
