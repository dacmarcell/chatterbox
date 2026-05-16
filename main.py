from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

class ConnectionManager:
    def __init__(self) -> None:
        # Mapeia websocket -> dados do usuário
        self.active_connections: dict[WebSocket, dict] = {}

    async def connect(self, websocket: WebSocket, client_id: str, username: str):
        await websocket.accept()
        self.active_connections[websocket] = {
            "id": client_id,
            "name": username
        }
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            del self.active_connections[websocket]

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast(self, message: dict, exclude: WebSocket = None):
        for connection in self.active_connections:
            if connection != exclude:
                await connection.send_json(message)

    def get_users_list(self):
        return list(self.active_connections.values())

manager = ConnectionManager()

@app.get('/')
async def get():
    file_path = os.path.join("static", "html", "index.html")
    return FileResponse(file_path)

@app.websocket("/ws/{client_id}/{username}")
async def websocket_endpoint(websocket: WebSocket, client_id: str, username: str):
    await manager.connect(websocket, client_id, username)
    
    # Ao conectar, avisa todos da nova lista de usuários
    await manager.broadcast({
        "type": "users_update",
        "users": manager.get_users_list()
    })
    
    # Mensagem de sistema indicando que entrou
    await manager.broadcast({
        "type": "system",
        "text": f"{username} joined the chat"
    })

    try:
        while True:
            data = await websocket.receive_json()
            
            if data.get("type") == "chat":
                msg_payload = {
                    "type": "chat",
                    "sender_id": client_id,
                    "sender_name": username,
                    "text": data.get("text")
                }
                # Envia confirmação local para o próprio sender
                await manager.send_personal_message({
                    "type": "chat_ack",
                    "text": data.get("text"),
                    "sender_name": username
                }, websocket)
                
                # Faz o broadcast para o resto
                await manager.broadcast(msg_payload, exclude=websocket)
            
            elif data.get("type") == "typing":
                await manager.broadcast({
                    "type": "typing",
                    "sender_id": client_id,
                    "sender_name": username,
                    "is_typing": data.get("is_typing", False)
                }, exclude=websocket)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        # Avisa que saiu e atualiza lista
        await manager.broadcast({
            "type": "system",
            "text": f"{username} left the chat"
        })
        await manager.broadcast({
            "type": "users_update",
            "users": manager.get_users_list()
        })
