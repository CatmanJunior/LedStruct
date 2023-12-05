from flask import Blueprint, jsonify, request
from models import db, Task

database_bp = Blueprint('database_bp', __name__)

@database_bp.route('/add_task', methods=['POST'])
def add_task():
    '''
    This route adds a task to the database.
    It expects the following data in the request body:
    - task_name : String
    - duration_minutes : Integer
    - category : String
    - priority : String
    '''
    task_name = request.form.get('task_name')
    duration_minutes = int(request.form.get('duration_minutes'))
    category = request.form.get('category')
    priority = request.form.get('priority')
    
    new_task = Task(task_name=task_name, duration_minutes=duration_minutes, category=category, priority=priority)
    db.session.add(new_task)
    db.session.commit()
    return jsonify({'message': 'Task added successfully'})

@database_bp.route('/get_tasks')
def get_tasks():
    '''
    This route returns all tasks from the database.
    Returns a list of dictionaries. Each dictionary represents a task.
    '''
    tasks = Task.query.all()  # Fetch all tasks from the database
    task_list = [
        {
            'id': task.id,
            'task_name': task.task_name,
            'duration_minutes': task.duration_minutes,
            'category': task.category,
            'priority': task.priority,
            'task_done': task.is_done
        }
        for task in tasks
    ]
    return jsonify(task_list)

@database_bp.route('/update_task/<int:task_id>', methods=['PUT'])
def update_task(task_id: int):
    '''
    This route updates a task in the database.
    '''
    task = Task.query.get(task_id)

    if task is None:
        return jsonify({"error": "Task not found"}), 404

    data = request.get_json()
    task.task_name = data.get('taskName', task.task_name)
    task.duration_minutes = data.get('duration', task.duration_minutes)
    task.category = data.get('category', task.category)
    task.priority = data.get('priority', task.priority)

    db.session.commit()

    return jsonify({"message": "Task updated successfully"})

@database_bp.route('/get_unique_categories')
def get_unique_categories():
    '''
    This route returns all unique categories from the database.
    '''
    unique_categories = Task.query.with_entities(Task.category).distinct().all()
    unique_categories = [category[0] for category in unique_categories]
    return jsonify(unique_categories)

@database_bp.route('/remove_task/<int:task_id>', methods=['DELETE'])
def remove_task(task_id: int):
    '''
    This route removes a task from the database.
    '''
    task = Task.query.get(task_id)
    
    if task:
        db.session.delete(task)
        db.session.commit()
        return jsonify(message="Task removed successfully"), 200
    else:
        return jsonify(message="Task not found"), 404

@database_bp.route('/toggle_task/<int:task_id>', methods=['POST'])
def toggle_task_done(task_id: int):
    '''
    This route toggles the is_done status of a task in the database.
    '''
    task = Task.query.get(task_id)
    if task:
        task.is_done = not task.is_done
        db.session.commit()
        return jsonify({'message': 'Task status updated successfully'})
    return jsonify({'error': 'Task not found'}), 404

@database_bp.cli.command("clear_db")
def clear_database_entries():
    '''
    This command deletes all entries from the database.
    '''
    try:
        db.session.query(Task).delete()
        db.session.commit()
        print("All entries deleted from the database.")
    except Exception as e:
        db.session.rollback()
        print("Error deleting entries:", str(e))
    finally:
        db.session.close()