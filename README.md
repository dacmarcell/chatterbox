# ChatterBox

ChatterBox é um aplicativo de chat em tempo real desenvolvido com WebSockets utilizando FastAPI. Ele permite que os usuários se comuniquem de forma instantânea e eficiente, proporcionando uma experiência de chat simples e interativa.

## 🔍 Funcionalidades

- **Comunicação em Tempo Real**: Utilize WebSockets para comunicação bidirecional instantânea entre clientes e servidor.
- **Interface Amigável**: Design responsivo e intuitivo, com uso do Bootstrap para estilização.
- **Notificações**: Notificações que aparecem no canto inferior da tela sempre que uma nova mensagem é recebida.

## ⚙️ Tecnologias Utilizadas

- **FastAPI**: Framework web moderno e rápido para a construção de APIs.
- **HTML5 & CSS3**: Estrutura e estilo da aplicação.
- **Bootstrap**: Framework CSS para design responsivo.

## 📦 Instalação

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/dacmarcell/chatterbox
   cd chatterbox
   ```

2. **Crie um ambiente virtual (recomendado):**

   ```bash
   python -m venv venv
   source venv/bin/activate  # No Windows, use `venv\Scripts\activate`
   ```

3. **Instale as dependências:**

   ```bash
   pip install fastapi uvicorn
   ```

## 🚀 Execução

Para rodar a aplicação, execute o seguinte comando:

```bash
uvicorn main:app --reload
```

A aplicação estará disponível em `http://localhost:8000`.

## 🖥️ Estrutura de Pastas

```plaintext
chatterbox/
│
├── static/
│   ├── css/
│   │   └── index.css
│   ├── html/
│   │   └── index.html
│   └── js/
│       └── main.js
│
├── main.py
└── README.md
```

## 📈 Próximos Passos

- Adicionar suporte a chat em grupo.
- Implementar armazenamento de histórico de mensagens.
- Melhorar a experiência do usuário com novas funcionalidades.

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

## 📫 Contato

Se você tiver alguma dúvida ou sugestão, fique à vontade para me contatar através do LinkedIn ou e-mail.
