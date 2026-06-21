import { useEffect, useMemo, useState } from 'react'
import DataTable from 'react-data-table-component'
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

type DropdownState = {
    open: boolean
    rowId: string | null
    x: number
    y: number
}

export default function Salas() {

    const [salas, setSalas] = useState<Sala[]>([])
    const [reservas, setReservas] = useState<Reserva[]>([])

    const [search, setSearch] = useState('')
    const [filterReserva, setFilterReserva] = useState('')

    const [nome, setNome] = useState('')
    const [capacidade, setCapacidade] = useState(10)

    const [selectedSala, setSelectedSala] = useState<Sala | null>(null)

    const [editNome, setEditNome] = useState('')
    const [editCapacidade, setEditCapacidade] = useState(0)

    const [resTitulo, setResTitulo] = useState('')
    const [resPessoas, setResPessoas] = useState(1)
    const [resInicio, setResInicio] = useState('')
    const [resFim, setResFim] = useState('')

    const [showEdit, setShowEdit] = useState(false)
    const [showInfo, setShowInfo] = useState(false)
    const [showReserva, setShowReserva] = useState(false)

    const [dropdown, setDropdown] = useState<DropdownState>({
        open: false,
        rowId: null,
        x: 0,
        y: 0
    })

    async function loadSalas() {
        const res = await api.get<Sala[]>('/salas')
        setSalas(res.data)
    }

    async function loadReservas(salaId: string) {
        const res = await api.get<Reserva[]>('/reservas')

        setReservas(
            res.data.filter(r => r.salaId === salaId)
        )
    }

    async function createSala() {
        if (!nome.trim()) {
            alert('Informe o nome da sala')
            return
        }

        if (!capacidade || capacidade <= 0) {
            alert('Informe uma capacidade válida')
            return
        }

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

        // validações obrigatórias
        if (!resTitulo.trim()) {
            alert('Informe o título da reserva')
            return
        }

        if (!resPessoas || resPessoas <= 0) {
            alert('Informe a quantidade de pessoas')
            return
        }

        if (!resInicio) {
            alert('Informe o início da reserva')
            return
        }

        if (!resFim) {
            alert('Informe o fim da reserva')
            return
        }

        // validação de lógica temporal
        if (new Date(resFim).getTime() <= new Date(resInicio).getTime()) {
            alert('O horário final deve ser maior que o inicial')
            return
        }

        // regra de negócio: capacidade da sala
        if (resPessoas > selectedSala.capacidade) {
            alert(`A sala suporta no máximo ${selectedSala.capacidade} pessoas`)
            return
        }

        try {
            await api.post('/reservas', {
                titulo: resTitulo,
                participantes: resPessoas,
                inicio: resInicio,
                fim: resFim,
                salaId: selectedSala.id
            })

            setShowReserva(false)
            setResTitulo('')
            setResInicio('')
            setResFim('')
            setResPessoas(1)

        } catch (err: any) {
            if (err.response?.status === 409) {
                alert('Já existe uma reserva nesse horário para esta sala')
                return
            }

            alert('Erro ao criar reserva')
        }
    }
    function getReservaStatus(reserva: Reserva) {
        const now = new Date().getTime()
        const inicio = new Date(reserva.inicio).getTime()
        const fim = new Date(reserva.fim).getTime()

        if (now >= inicio && now <= fim) {
            return 'Em andamento'
        }

        if (now < inicio) {
            return 'Próxima'
        }

        return 'Encerrada'
    }

    useEffect(() => {
        void loadSalas()
    }, [])

    const filteredSalas = useMemo(() => {
        return salas
            .filter(s =>
                s.nome.toLowerCase().includes(search.toLowerCase())
            )
            .sort((a, b) => a.nome.localeCompare(b.nome))
    }, [salas, search])

    const filteredReservas = useMemo(() => {
        return reservas
            .filter(r =>
                r.titulo.toLowerCase().includes(filterReserva.toLowerCase())
            )
            .sort((a, b) =>
                new Date(a.inicio).getTime() - new Date(b.inicio).getTime()
            )
    }, [reservas, filterReserva])

    const columns = [
        {
            name: 'Nome',
            selector: (row: Sala) => row.nome,
            sortable: true
        },
        {
            name: 'Capacidade',
            selector: (row: Sala) => row.capacidade,
            sortable: true
        },
        {
            name: 'Ações',
            cell: (row: Sala) => (
                <button
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => {
                        const rect = (e.target as HTMLElement).getBoundingClientRect()

                        setDropdown({
                            open: true,
                            rowId: row.id,
                            x: rect.left,
                            y: rect.bottom
                        })
                    }}
                >
                    Ações
                </button>
            ),
            ignoreRowClick: true,
            allowOverflow: true
        }
    ]

    const reservaColumns = [
        {
            name: 'Título',
            selector: (row: Reserva) => row.titulo,
            sortable: true
        },
        {
            name: 'Início',
            selector: (row: Reserva) =>
                new Date(row.inicio).toLocaleString(),
            sortable: true
        },
        {
            name: 'Fim',
            selector: (row: Reserva) =>
                new Date(row.fim).toLocaleString(),
            sortable: true
        },
        {
            name: 'Status',
            cell: (row: Reserva) => {
                const status = getReservaStatus(row)

                const color =
                    status === 'Em andamento'
                        ? 'green'
                        : status === 'Próxima'
                            ? 'blue'
                            : 'gray'

                return (
                    <span
                        style={{
                            color,
                            fontWeight: 600
                        }}
                    >
                        {status}
                    </span>
                )
            },
            sortable: true
        }
    ]

    return (
        <div className="container mt-4 mb-4">

            <h4>Cadastro de Salas</h4>

            {/* FORM */}
            <div className="card p-3 mb-3">
                <input
                    className="form-control mb-2"
                    placeholder="Nome"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                />

                <input
                    className="form-control mb-2"
                    type="number"
                    placeholder="Capacidade"
                    value={capacidade}
                    onChange={e => setCapacidade(Number(e.target.value))}
                />

                <button className="btn btn-primary" onClick={createSala}>
                    Criar Nova Sala
                </button>
            </div>

            {/* SEARCH */}
            <input
                className="form-control mb-3"
                placeholder="Buscar sala..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            <h4>Lista de Salas Cadastradas</h4>

            <DataTable
                columns={columns}
                data={filteredSalas}
                pagination
                highlightOnHover
                striped
            />

            {/* DROPDOWN GLOBAL */}
            {dropdown.open && (
                <>
                    <div
                        onClick={() => setDropdown(prev => ({ ...prev, open: false }))}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 9998
                        }}
                    />

                    <div
                        style={{
                            position: 'fixed',
                            top: dropdown.y,
                            left: dropdown.x,
                            background: '#fff',
                            border: '1px solid #ddd',
                            borderRadius: 6,
                            zIndex: 9999,
                            minWidth: 180,
                            boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
                        }}
                    >
                        <button
                            className="dropdown-item"
                            onClick={() => {
                                const sala = salas.find(s => s.id === dropdown.rowId)
                                if (!sala) return

                                setSelectedSala(sala)
                                setShowReserva(true)
                                setDropdown(prev => ({ ...prev, open: false }))
                            }}
                        >
                            Criar reserva
                        </button>

                        <button
                            className="dropdown-item"
                            onClick={() => {
                                const sala = salas.find(s => s.id === dropdown.rowId)
                                if (!sala) return

                                setSelectedSala(sala)
                                loadReservas(sala.id)
                                setShowInfo(true)
                                setDropdown(prev => ({ ...prev, open: false }))
                            }}
                        >
                            Ver reservas
                        </button>

                        <button
                            className="dropdown-item"
                            onClick={() => {
                                const sala = salas.find(s => s.id === dropdown.rowId)
                                if (!sala) return

                                setSelectedSala(sala)
                                setEditNome(sala.nome)
                                setEditCapacidade(sala.capacidade)
                                setShowEdit(true)
                                setDropdown(prev => ({ ...prev, open: false }))
                            }}
                        >
                            Editar
                        </button>

                        <button
                            className="dropdown-item text-danger"
                            onClick={() => {
                                if (dropdown.rowId) deleteSala(dropdown.rowId)
                                setDropdown(prev => ({ ...prev, open: false }))
                            }}
                        >
                            Excluir
                        </button>
                    </div>
                </>
            )}

            {/* MODAL EDIT */}
            {showEdit && (
                <div className="modal d-block bg-dark bg-opacity-50">
                    <div className="modal-dialog">
                        <div className="modal-content p-3">

                            <h5>Editar Sala</h5>

                            <input
                                className="form-control mb-2"
                                value={editNome}
                                onChange={e => setEditNome(e.target.value)}
                            />

                            <input
                                className="form-control mb-2"
                                type="number"
                                value={editCapacidade}
                                onChange={e => setEditCapacidade(Number(e.target.value))}
                            />

                            <button className="btn btn-success mb-2" onClick={updateSala}>
                                Salvar
                            </button>

                            <button className="btn btn-secondary" onClick={() => setShowEdit(false)}>
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

                            <input
                                className="form-control mb-2"
                                placeholder="Título"
                                value={resTitulo}
                                onChange={e => setResTitulo(e.target.value)}
                            />

                            <input
                                className="form-control mb-2"
                                type="number"
                                placeholder="Quantidade de Pessoas"
                                value={resPessoas}
                                onChange={e => setResPessoas(Number(e.target.value))}
                            />

                            <input
                                className="form-control mb-2"
                                type="datetime-local"
                                value={resInicio}
                                onChange={e => setResInicio(e.target.value)}
                            />

                            <input
                                className="form-control mb-2"
                                type="datetime-local"
                                value={resFim}
                                onChange={e => setResFim(e.target.value)}
                            />

                            <button className="btn btn-primary mb-2" onClick={createReserva}>
                                Criar
                            </button>

                            <button className="btn btn-secondary" onClick={() => setShowReserva(false)}>
                                Fechar
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {/* MODAL RESERVAS */}
            {showInfo && (
                <div className="modal d-block bg-dark bg-opacity-50">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content p-3">

                            <h5>Reservas da Sala</h5>

                            <input
                                className="form-control mb-3"
                                placeholder="Buscar reserva..."
                                value={filterReserva}
                                onChange={e => setFilterReserva(e.target.value)}
                            />

                            <DataTable
                                columns={reservaColumns}
                                data={filteredReservas}
                                pagination
                                highlightOnHover
                                striped
                            />

                            <button
                                className="btn btn-secondary mt-3"
                                onClick={() => setShowInfo(false)}
                            >
                                Fechar
                            </button>

                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}