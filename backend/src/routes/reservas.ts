import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'

export async function reservasRoutes(app: FastifyInstance) {

    // ✔ LISTAR TODAS RESERVAS
    app.get('/reservas', async () => {
        return prisma.reserva.findMany({
            include: {
                sala: true
            }
        })
    })

    // ✔ BUSCAR POR ID
    app.get('/reservas/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string }

            const reserva = await prisma.reserva.findUnique({
                where: { id },
                include: { sala: true }
            })

            if (!reserva) {
                return reply.status(404).send({
                    error: 'Reserva não encontrada'
                })
            }

            return reserva

        } catch (error) {
            console.error(error)
            return reply.status(500).send({
                error: 'Erro ao buscar reserva'
            })
        }
    })

    // ✔ CRIAR RESERVA (COM CONFLITO)
    app.post('/reservas', async (request, reply) => {

        try {
            const body = request.body as {
                titulo: string
                participantes: number
                inicio: string
                fim: string
                salaId: string
            }

            const inicio = new Date(body.inicio)
            const fim = new Date(body.fim)

            // ✔ validação de datas inválidas
            if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
                return reply.status(400).send({
                    error: 'Datas inválidas'
                })
            }

            // ✔ validação lógica
            if (inicio >= fim) {
                return reply.status(400).send({
                    error: 'Horário inválido'
                })
            }

            // ✔ validação de conflito (REGRA CORRETA)
            const conflito = await prisma.reserva.findFirst({
                where: {
                    salaId: body.salaId,
                    AND: [
                        {
                            inicio: {
                                lt: fim
                            }
                        },
                        {
                            fim: {
                                gt: inicio
                            }
                        }
                    ]
                }
            })

            if (conflito) {
                return reply.status(409).send({
                    code: 'RESERVA_CONFLITO',
                    message: 'Já existe uma reserva nesse período'
                })
            }

            // ✔ criar reserva
            const reserva = await prisma.reserva.create({
                data: {
                    titulo: body.titulo,
                    participantes: body.participantes,
                    inicio,
                    fim,
                    salaId: body.salaId
                }
            })

            return reserva

        } catch (error) {
            console.error('ERRO CREATE RESERVA:', error)

            return reply.status(500).send({
                error: 'Erro interno ao criar reserva'
            })
        }
    })

    // ✔ DELETE RESERVA
    app.delete('/reservas/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string }

            await prisma.reserva.delete({
                where: { id }
            })

            return { message: 'Reserva removida' }

        } catch (error) {
            console.error(error)

            return reply.status(500).send({
                error: 'Erro ao remover reserva'
            })
        }
    })
}