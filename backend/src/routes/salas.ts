import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'

export async function salasRoutes(app: FastifyInstance) {

    // ✔ LISTAR TODAS
    app.get('/salas', async () => {
        const salas = await prisma.sala.findMany()
        return salas
    })

    // ✔ BUSCAR POR ID
    app.get('/salas/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string }

            const sala = await prisma.sala.findUnique({
                where: { id }
            })

            if (!sala) {
                return reply.status(404).send({
                    error: 'Sala não encontrada'
                })
            }

            return sala

        } catch (error) {
            console.error('GET /salas/:id erro:', error)

            return reply.status(500).send({
                error: 'Erro interno ao buscar sala'
            })
        }
    })

    // ✔ CRIAR SALA
    app.post('/salas', async (request, reply) => {
        try {
            const body = request.body as {
                nome: string
                capacidade: number
            }

            if (!body.nome || typeof body.nome !== 'string') {
                return reply.status(400).send({
                    error: 'Nome inválido'
                })
            }

            const capacidade = Number(body.capacidade)

            if (!capacidade || capacidade <= 0) {
                return reply.status(400).send({
                    error: 'Capacidade inválida'
                })
            }

            const sala = await prisma.sala.create({
                data: {
                    nome: body.nome,
                    capacidade
                }
            })

            return sala

        } catch (error) {
            console.error('POST /salas erro:', error)

            return reply.status(500).send({
                error: 'Erro ao criar sala'
            })
        }
    })

    // ✔ ATUALIZAR SALA (CORRIGIDO)
    app.put('/salas/:id', async (request, reply) => {
        const { id } = request.params as { id: string }

        const body = request.body as {
            nome?: string
            capacidade?: number
        }

        console.log('➡ PUT RECEBIDO:', { id, body })

        try {
            const sala = await prisma.sala.update({
                where: { id },
                data: {
                    nome: body.nome ?? undefined,
                    capacidade: body.capacidade !== undefined
                        ? Number(body.capacidade)
                        : undefined
                }
            })

            console.log('✔ UPDATE OK:', sala)

            return reply.send(sala)

        } catch (error: any) {

            console.error('🔥 ERRO REAL DO PRISMA:')
            console.error(error)

            // IMPORTANTÍSSIMO: não deixa crashar conexão
            return reply.status(500).send({
                error: 'Erro ao atualizar sala',
                prisma: error?.code || null,
                message: error?.message
            })
        }
    })

    // ✔ DELETAR SALA
    app.delete('/salas/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string }

            const exists = await prisma.sala.findUnique({
                where: { id }
            })

            if (!exists) {
                return reply.status(404).send({
                    error: 'Sala não encontrada'
                })
            }

            await prisma.sala.delete({
                where: { id }
            })

            return {
                status: 'ok',
                message: 'Sala removida com sucesso'
            }

        } catch (error) {
            console.error('DELETE /salas erro:', error)

            return reply.status(500).send({
                error: 'Erro ao deletar sala'
            })
        }
    })
}