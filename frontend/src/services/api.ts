import axios from 'axios'

export const api = axios.create({
    //baseURL: 'http://localhost:3333' // local
    baseURL: 'https://reserva-salas-e855.vercel.app/' // producao
})