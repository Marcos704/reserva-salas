import Fastify from 'fastify'
import cors from '@fastify/cors'

import { salasRoutes } from './routes/salas'
import { reservasRoutes } from './routes/reservas'

const app = Fastify()

// ✔ DEBUG GLOBAL DE ERROS (AQUI)
app.addHook('onError', async (request, reply, error) => {
  console.log('🔥 GLOBAL ERROR:')
  console.log(error)
})

async function bootstrap() {

  await app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
  })

  await app.register(salasRoutes)
  await app.register(reservasRoutes)

  app.get('/', async () => {
    return { status: 'online' }
  })

  await app.listen({ port: 3333 })

  console.log('Server running')
}

bootstrap()