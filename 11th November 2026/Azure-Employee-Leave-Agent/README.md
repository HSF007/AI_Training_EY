
# Employee Leave Policy Agent

## Project Structure
```text
Azure-Employee-Leave-Agent/
    .venv/
    .env
    main.py
    requirements.txt
```
* The .env file should contain following parameters:
```text
FOUNDRY_PROJECT_ENDPOINT=[YOUR AZURE PORTAL FOUNDRY ENDPOINT]
FOUNDRY_AGENT_NAME=EmployeeLeaveAgent
REDIS_URL=redis://localhost:6379/0
```

## Installation and Setup

### 1. Python Enviroment (If you want to)
```bash
python -m venv .venv
```

### 2. Install Required Python Libraries
```bash
python -m pip install -r requirements.txt
```

### 3. Install Redis in Docker
```bash
docker run -d --name employee-redis -p 127.0.0.1:6379:6379 -v employee_redis_data:/data redis:7-alpine redis-server --appendonly yes
```

### 4. Check Redis server is running or not (Output: PONG)
```bash
docker exec employee-redis redis-cli ping
```

### 5. Run UviCorn
```bash
python -m uvicorn main:app --reload
```

### 6. Check Health
Open the given URL to try out the POST and GET methods
```http://127.0.0.1:8000/docs?utm_source=chatgpt.com#/default/chat_chat_post```

### 7. If wanted check running Redis
```bash
docker exec -it retail-redis redis-cli
127.0.0.1:6379> KEYS retail:*
```

then to check Redis memory enter ```KEYS retail:*```