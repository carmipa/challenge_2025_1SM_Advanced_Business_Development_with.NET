// src/utils/api.ts (ou src/services/BoxService.ts)
import axios from 'axios';
import type { BoxRequestDto, BoxResponseDto, BoxFilter } from '@/types/box'; // [cite: 1104, 1359]

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const boxClient = axios.create({
    baseURL: `${API_URL}/boxes`, // Rota base para BoxesController
    headers: {
        'Content-Type': 'application/json',
    },
});

export const BoxService = {
    // GET /api/boxes (com filtros)
    getAll: async (filters?: BoxFilter): Promise<BoxResponseDto[]> => {
        // Axios lida com a serialização de 'params' para query string
        const response = await boxClient.get('', { params: filters });
        return response.data;
    },

    // GET /api/boxes/{id}
    getById: async (id: number): Promise<BoxResponseDto> => {
        const response = await boxClient.get(`/${id}`);
        return response.data;
    },

    // POST /api/boxes
    create: async (boxData: BoxRequestDto): Promise<BoxResponseDto> => {
        const response = await boxClient.post('', boxData);
        return response.data;
    },

    // PUT /api/boxes/{id}
    update: async (id: number, boxData: BoxRequestDto): Promise<BoxResponseDto> => {
        const response = await boxClient.put(`/${id}`, boxData);
        return response.data;
    },

    // DELETE /api/boxes/{id}
    delete: async (id: number): Promise<void> => {
        await boxClient.delete(`/${id}`);
    },

    // GET /api/boxes/search-by-name?nome=...
    searchByName: async (nome: string): Promise<BoxResponseDto[]> => {
        const response = await boxClient.get('/search-by-name', { params: { nome } });
        return response.data;
    },

    // GET /api/boxes/by-status/{status}
    getByStatus: async (status: 'A' | 'I'): Promise<BoxResponseDto[]> => { // 'A' para Ativo, 'I' para Inativo
        const response = await boxClient.get(`/by-status/${status}`);
        return response.data;
    }
};

// Você faria algo similar para ClienteService, VeiculoService, etc.
// Exemplo para ClienteService (apenas uma função para ilustração):
// src/services/ClienteService.ts
// import type { ClienteRequestDto, ClienteResponseDto, ClienteFilter } from '@/types/cliente';
// const clienteClient = axios.create({
//     baseURL: `${API_URL}/clientes`,
//     headers: { 'Content-Type': 'application/json' },
// });
// export const ClienteService = {
//     getAll: async (filters?: ClienteFilter): Promise<SpringPage<ClienteResponseDto>> => { // Se paginado
//         const response = await clienteClient.get('', { params: filters });
//         return response.data;
//     },
//     // ... outras funções (getById, create, update, delete)
// };