from fastapi.testclient import TestClient
from main import app


client = TestClient(app)

def test_read_task():
    response = client.get("/tasks")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_read_tasks_id():
    response = client.get("/tasks/1")
    data = response.json()
    assert response.status_code == 200
    assert data["id"] == 1

def test_not_found():
    response = client.get("/tasks/999")
    assert response.status_code == 404

def test_add_task():
    response = client.post(
        "/tasks",
        json={
            "id": 4,
            "title": "Check server logs",
            "status": "Pending"
        }
    )

    data = response.json()
    assert response.status_code == 200
    assert data["id"] == 4
    assert data["title"] == "Check server logs"

def test_invalid_task_add():
    response = client.post(
        "/tasks",
        json={
            "id": 5,
            "title": "Check server logs",
            "status": 100
        }
    )
    assert response.status_code == 422

def tast_update_task():
    response = client.put(
        "/tasks/2",
        json={
            "id": 2,
            "title": "Review invoice",
            "status": "Completed"
        }
    )
    data = response.json()
    assert response.status_code == 200
    assert data["status"] == "Completed"

def test_deleting_task():
    response = client.delete("/tasks/3")
    data = response.json()
    assert response.status_code == 200
    assert data["Message"] == "Task deleted"

def test_getting_deleted_task():
    response = client.get("/tasks/3")
    assert response.status_code == 404
