import { useEffect, useState } from 'react'
import { api } from '../services/api'

type Sala = {
    id: string
    nome: string
    capacidade: number
}

type Reserva = {
    id: string
    titulo: string
    inicio: string
    fim: string
    salaId: string
}

export default function Salas() {
    const [salas, setSalas] = useState<Sala[]>([])
    const [reservas, setReservas] = useState<Reserva[]>([])

    const [nome, setNome] = useState('')
    const [capacidade, setCapacidade] = useState(10)

    const [selectedSala, setSelectedSala] = useState<Sala | null>(null)

    const [editNome, setEditNome] = useState('')
    const [editCapacidade, setEditCapacidade] = useState(0)

    const [resTitulo, setResTitulo] = useState('')
    const [resInicio, setResInicio] = useState('')
    const [resFim, setResFim] = useState('')

    // MODAIS
    const [showEdit, setShowEdit] = useState(false)
    const [showInfo, setShowInfo] = useState(false)
    const [showReserva, setShowReserva] = useState(false)

    async function loadSalas() {
        const res = await api.get('/salas')
        setSalas(res.data)
    }

    async function loadReservas(salaId: string) {
        const res = await api.get<Reserva[]>('/reservas')

        setReservas(
            res.data.filter((r) => r.salaId === salaId)
        )
    }

    async function createSala() {
        await api.post('/salas', { nome, capacidade })
        setNome('')
        setCapacidade(10)
        loadSalas()
    }

    async function deleteSala(id: string) {
        await api.delete(`/salas/${id}`)
        loadSalas()
    }

    async function updateSala() {
        console.log({
            editNome,
            editCapacidade
        });
        console.log({
            selectedSala
        });
        if (!selectedSala) return

        await api.put(`/salas/${selectedSala.id}`, {
            nome: editNome,
            capacidade: editCapacidade
        })


        setShowEdit(false)
        loadSalas()
    }

    async function createReserva() {
        if (!selectedSala) return

        try {
            await api.post('/reservas', {
                titulo: resTitulo,
                participantes: 1,
                inicio: resInicio,
                fim: resFim,
                salaId: selectedSala.id
            })

            setShowReserva(false)
            setResTitulo('')
            setResInicio('')
            setResFim('')

        } catch (err: any) {
            if (err.response?.status === 409) {
                alert(err.response.data.message)
                return
            }

            alert('Erro ao criar reserva')
        }
    }

    useEffect(() => {
        void loadSalas()
    }, [])

    return (
        <div className="container mt-4 mb-4">

            <h1 className="mb-4">Salas</h1>

            {/* FORM SALA */}
            <div className="card p-3 mb-4">
                <input className="form-control mb-2" placeholder="Nome"
                    value={nome} onChange={e => setNome(e.target.value)} />

                <input className="form-control mb-2" type="number"
                    value={capacidade} onChange={e => setCapacidade(Number(e.target.value))} />

                <button className="btn btn-primary" onClick={createSala}>
                    Criar Sala
                </button>
            </div>

            {/* LISTA */}
            <ul className="list-group">
                {salas.map((sala) => (
                    <li key={sala.id}
                        className="list-group-item d-flex justify-content-between align-items-center">

                        <div>
                            <strong>{sala.nome}</strong>
                            <div className="text-muted">{sala.capacidade} pessoas</div>
                        </div>

                        <div className="dropdown">
                            <button className="btn btn-secondary btn-sm dropdown-toggle"
                                data-bs-toggle="dropdown">
                                Ações
                            </button>

                            <ul className="dropdown-menu">

                                {/* CRIAR RESERVA */}
                                <li>
                                    <button className="dropdown-item"
                                        onClick={() => {
                                            setSelectedSala(sala)
                                            setShowReserva(true)
                                        }}>
                                        Criar reserva
                                    </button>
                                </li>

                                {/* VER INFO */}
                                <li>
                                    <button className="dropdown-item"
                                        onClick={() => {
                                            setSelectedSala(sala)
                                            loadReservas(sala.id)
                                            setShowInfo(true)
                                        }}>
                                        Ver informações
                                    </button>
                                </li>

                                {/* EDITAR SALA */}
                                <li>
                                    <button className="dropdown-item"
                                        onClick={() => {
                                            setSelectedSala(sala)
                                            setEditNome(sala.nome)
                                            setEditCapacidade(sala.capacidade)
                                            setShowEdit(true)
                                        }}>
                                        Editar sala
                                    </button>
                                </li>

                                {/* GERENCIAR */}
                                <li>
                                    <button className="dropdown-item"
                                        onClick={() => {
                                            setSelectedSala(sala)
                                            loadReservas(sala.id)
                                            setShowInfo(true)
                                        }}>
                                        Gerenciar reservas
                                    </button>
                                </li>

                                {/* DELETE */}
                                <li>
                                    <button className="dropdown-item text-danger"
                                        onClick={() => deleteSala(sala.id)}>
                                        Excluir sala
                                    </button>
                                </li>

                            </ul>
                        </div>
                    </li>
                ))}
            </ul>

            {/* MODAL EDITAR */}
            {showEdit && (
                <div className="modal d-block bg-dark bg-opacity-50">
                    <div className="modal-dialog">
                        <div className="modal-content p-3">

                            <h5>Editar Sala</h5>

                            <input className="form-control mb-2"
                                value={editNome}
                                onChange={e => setEditNome(e.target.value)} />

                            <input className="form-control mb-2" type="number"
                                value={editCapacidade}
                                onChange={e => setEditCapacidade(Number(e.target.value))} />

                            <button className="btn btn-success mb-2"
                                onClick={updateSala}>
                                Salvar
                            </button>

                            <button className="btn btn-secondary"
                                onClick={() => setShowEdit(false)}>
                                Fechar
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {/* MODAL INFO */}
            {showInfo && (
                <div className="modal d-block bg-dark bg-opacity-50">
                    <div className="modal-dialog">
                        <div className="modal-content p-3">

                            <h5>Reservas</h5>

                            {reservas.map(r => (
                                <div key={r.id}>
                                    <strong>{r.titulo}</strong><br />
                                    {r.inicio} → {r.fim}
                                    <hr />
                                </div>
                            ))}

                            <button className="btn btn-secondary"
                                onClick={() => setShowInfo(false)}>
                                Fechar
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {/* MODAL RESERVA */}
            {showReserva && (
                <div className="modal d-block bg-dark bg-opacity-50">
                    <div className="modal-dialog">
                        <div className="modal-content p-3">

                            <h5>Criar Reserva</h5>

                            <input className="form-control mb-2"
                                placeholder="Título"
                                value={resTitulo}
                                onChange={e => setResTitulo(e.target.value)} />

                            <input className="form-control mb-2"
                                type="datetime-local"
                                value={resInicio}
                                onChange={e => setResInicio(e.target.value)} />

                            <input className="form-control mb-2"
                                type="datetime-local"
                                value={resFim}
                                onChange={e => setResFim(e.target.value)} />

                            <button className="btn btn-primary mb-2"
                                onClick={createReserva}>
                                Criar
                            </button>

                            <button className="btn btn-secondary"
                                onClick={() => setShowReserva(false)}>
                                Fechar
                            </button>

                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}