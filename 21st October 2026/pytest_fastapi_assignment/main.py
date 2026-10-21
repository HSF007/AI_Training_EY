from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


class Task(BaseModel):
    id: int
    title: str
    status: str

tasks: list[Task] = [
    Task(
         id = 1,
        title = "Prepare report",
        status = "Pending"
    ),
    Task(
        id = 2,
        title = "Review invoice",
        status = "Pending"
    ),
    Task(
        id = 3,
        title = "Update dashboard",
        status = "Pending"
    )
]

app = FastAPI()

@app.get("/tasks")
def get_tasks():
    return tasks

@app.get("/tasks/{task_id}")
def get_task_by_id(task_id: int):
    for task in tasks:
        if task.id == task_id:
            return task
    raise HTTPException(status_code=404, detail="Task not found")

@app.post("/tasks")
def create_task(data: Task):
    tasks.append(data)
    return data

@app.put("/tasks/{task_id}")
def update_task(task_id: int, updated_task: Task):
    for index, task in enumerate(tasks):
        if task.id == task_id:
            tasks[index] = updated_task
            return update_task
    raise HTTPException(status_code=404, detail="Task not found")

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    for index, task in enumerate(tasks):
        if task.id == task_id:
            deleted_task = tasks.pop(index)
            return {
                "Message": "Task deleted",
                "Task": deleted_task
            }
    raise HTTPException(status_code=404, detail="Task not found")