from flask import Flask, jsonify, request


students = [
    {
        "id": 1,
        "name": "Rhea Kapoor",
        "course": "Python",
        "score": 82
    },
    {
        "id": 2,
        "name": "Zain Malik",
        "course": "SQL",
        "score": 76
    },
    {
        "id": 3,
        "name": "Devika Rao",
        "course": "Cloud",
        "score": 91
    }
]

app = Flask(__name__)

@app.get("/students")
def get_students():
    return jsonify(students)

@app.get("/students/<int:id>")
def get_student(id):
    for student in students:
        if student["id"] == id:
            return jsonify(student)
    return jsonify({"message": "Student not found"}), 404

@app.post("/students")
def create_student():
    student_data = request.get_json()
    students.append(student_data)
    return jsonify({"message": "Student added successfully"})

@app.put("/students/<int:id>")
def update_student(id):
    update_data = request.get_json()
    for index, student in enumerate(students):
        if student["id"] == id:
            update_data["id"] = id
            students[index] = update_data
            return jsonify({"message": "Student updated successfully"})
    return jsonify({"message": "Student not found"}), 404

@app.delete("/students/<int:id>")
def delete_student(id):
    for index, student in enumerate(students):
        if student["id"] == id:
            deleted_student = students.pop(index)
            return jsonify({"message": "Student deleted successfully"})
    return jsonify({"message": "Student not found"}), 404


if __name__ == "__main__":
    app.run(debug=True)