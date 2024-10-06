from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse

app = FastAPI()

html = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Websocket Chat</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
    <div class="container mt-5">
        <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
                <h3>WebSocket Chat</h3>
                <p>Your ID: <span id="ws-id" class="fw-bold"></span></p>
            </div>
            <div class="card-body">
                <ul id="messages" class="list-group mb-3" style="height: 300px; overflow-y: scroll;"></ul>
                <form class="d-flex" action="" onsubmit="event.preventDefault(); sendMessage(event)">
                    <input type="text" id="messageText" class="form-control me-2" placeholder="Type your message..." autocomplete="off" />
                    <button type="submit" class="btn btn-primary">Send</button>
                </form>
            </div>
        </div>
    </div>

    <script>
        var client_id = Date.now()
        document.querySelector("#ws-id").textContent = client_id;
        const ws = new WebSocket(`ws://localhost:8000/ws/${client_id}`);

        ws.onmessage = e => {
            const messages = document.getElementById("messages");
            const message = document.createElement("li");
            message.classList.add("list-group-item");
            const content = document.createTextNode(e.data);
            message.appendChild(content);
            messages.appendChild(message);
        };

        ws.onclose = e => {
            alert('Connection closed');
        };

        ws.onerror = e => {
            alert('WebSocket error:', e);
        };

        const sendMessage = () => {
            const input = document.getElementById("messageText");
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(input.value);
            } else {
                alert('WebSocket is not open. Cannot send message.');
            }
            input.value = "";
        };
    </script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
"""

class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.get('/')
async def get():
    return HTMLResponse(html)

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(f"You wrote: {data}", websocket)
            await manager.broadcast(f"Client #{client_id} says: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"Client #{client_id} has left the chat")
    finally:
        await websocket.close()
