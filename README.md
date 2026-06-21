# 📅 Sistema de Reserva de Salas

Sistema fullstack para gerenciamento de salas e reservas, desenvolvido com **Node.js (Fastify + Prisma + PostgreSQL)** no backend e **React + Axios + Bootstrap** no frontend.

O sistema permite criar salas, agendar reservas e evita conflitos de horário automaticamente.

---

# 🚀 Tecnologias utilizadas

## Backend
- Node.js
- Fastify
- Prisma ORM
- PostgreSQL (Supabase compatível)
- TypeScript
- CORS

## Frontend
- React
- Vite
- Axios
- Bootstrap 5

---

# 📁 Estrutura do projeto
reserva-salas/
│
├── backend/
│ ├── prisma/
│ ├── src/
│ │ ├── routes/
│ │ ├── lib/
│ │ └── server.ts
│ ├── .env
│ └── package.json
│
├── frontend/
│ ├── src/
│ │ ├── pages/
│ │ ├── services/
│ │ └── App.tsx
│ └── package.json
│
└── README.md

---

# ⚙️ Funcionalidades

## 📌 Salas
- Criar sala
- Listar salas
- Editar sala
- Excluir sala

## 📌 Reservas
- Criar reserva por sala
- Listar reservas por sala
- Remover reserva
- Validação de conflito de horário
- Bloqueio automático de horários ocupados

---

# 🧠 Regra de negócio principal

O sistema impede reservas conflitantes com base na lógica:
nicio_existente < fim_novo AND fim_existente > inicio_novo


Se houver conflito, a API retorna:


409 CONFLICT
{
code: "RESERVA_CONFLITO",
message: "Já existe uma reserva nesse período"
}


---

# 🔧 Backend - Instalação

bash
cd backend
npm install
Configurar ambiente (.env)

Criar arquivo .env:

DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/postgres"
Rodar migrations (Prisma)
npx prisma generate
npx prisma db push
Iniciar servidor
npm run dev

Backend rodará em:

http://localhost:3333
🌐 Frontend - Instalação
cd frontend
npm install
Configurar API

Arquivo:

src/services/api.ts
import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:3333'
})
Iniciar frontend
npm run dev

Frontend rodará em:

http://localhost:5173
🔗 Endpoints da API
Salas
GET /salas
POST /salas
GET /salas/:id
PUT /salas/:id
DELETE /salas/:id
Reservas
GET /reservas
POST /reservas
GET /reservas/:id
DELETE /reservas/:id
⚠️ Regras importantes
Não é possível criar reservas com horários conflitantes na mesma sala
Datas inválidas são rejeitadas
inicio deve ser menor que fim
capacidade deve ser número inteiro
🧪 Exemplo de criação de reserva
POST /reservas

{
  "titulo": "Reunião de equipe",
  "participantes": 5,
  "inicio": "2026-06-21T10:00:00Z",
  "fim": "2026-06-21T11:00:00Z",
  "salaId": "uuid-da-sala"
}
❌ Resposta de conflito
HTTP 409

{
  "code": "RESERVA_CONFLITO",
  "message": "Já existe uma reserva nesse período"
}
🛠 Melhorias futuras
Calendário visual de reservas
Drag and drop de horários
Autenticação de usuários
Perfis (admin / usuário)
Notificações em tempo real
Deploy em produção (Vercel + Render + Supabase)
👨‍💻 Autor

Projeto desenvolvido como sistema de estudo fullstack com foco em:

APIs robustas
validação de regras de negócio
integração frontend/backend
banco de dados relacional
📌 Status do projeto

✔ Backend funcional
✔ Frontend funcional
✔ Validação de conflitos
✔ Integração completa

📄 Licença

Este projeto é livre para fins educacionais e pode ser modificado livremente.
