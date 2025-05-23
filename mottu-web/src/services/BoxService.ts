// src/services/BoxService.ts
import axios from 'axios';
import type { BoxRequestDto, BoxResponseDto, BoxFilter } from '@/types/box';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const boxApiClient = axios.create({
    baseURL: `${API_BASE_URL}/boxes`, // Endpoint base para BoxesController
    headers: {
        'Content-Type': 'application/json',
    },
});

export const BoxService = {
    // GET /api/boxes (sem filtros complexos no backend atual)
    // Para usar com os filtros da ListarBoxesPage, este precisaria de adaptação
    // ou a página de listagem precisaria chamar os endpoints de busca específicos.
    getAll: async (filters?: BoxFilter): Promise<BoxResponseDto[]> => {
        // NOTA: Seu C# GetAllBoxes() não aceita 'filters' atualmente.
        // Se filtros.nome existir, chamaremos searchByName.
        // Se filtros.status existir, chamaremos getByStatus.
        // Se ambos (ou outros) existirem, este getAll não funcionará como esperado sem backend changes.
        if (filters?.nome && !filters.status) { // Apenas nome
            return BoxService.searchByName(filters.nome);
        }
        if (filters?.status && !filters.nome) { // Apenas status
            // Certifique-se que o status enviado é 'A' ou 'I'
            if (filters.status === 'A' || filters.status === 'I') {
                return BoxService.getByStatus(filters.status);
            }
        }
        // Fallback para buscar todos se nenhum filtro específico ou se múltiplos filtros (não suportado pelo getAll simples)
        const response = await boxApiClient.get('');
        return response.data.map(box => ({
            ...box,
            // A API C# enviará 'status: true' ou 'status: false'. Não precisa converter aqui.
            // As datas virão como strings ISO, ex: "2025-05-22T10:25:12"
            // Se precisar apenas da parte da data (YYYY-MM-DD) para consistência:
            dataEntrada: box.dataEntrada ? box.dataEntrada.split('T')[0] : '',
            dataSaida: box.dataSaida ? box.dataSaida.split('T')[0] : '',
        }));
    },

    getById: async (id: number): Promise<BoxResponseDto> => {
        const response = await boxApiClient.get<BoxResponseDto>(`/${id}`);
        return {
            ...response.data,
            dataEntrada: response.data.dataEntrada ? response.data.dataEntrada.split('T')[0] : '',
            dataSaida: response.data.dataSaida ? response.data.dataSaida.split('T')[0] : '',
        };
    },

    create: async (boxData: BoxRequestDto): Promise<BoxResponseDto> => {
        const response = await boxApiClient.post<BoxResponseDto>('', boxData);
        return { // Garante que as datas na resposta também sejam formatadas se necessário
            ...response.data,
            dataEntrada: response.data.dataEntrada ? response.data.dataEntrada.split('T')[0] : '',
            dataSaida: response.data.dataSaida ? response.data.dataSaida.split('T')[0] : '',
        };
    },

    update: async (id: number, boxData: BoxRequestDto): Promise<BoxResponseDto> => {
        // O backend não retorna o objeto atualizado no NoContent,
        // então não há `response.data` para mapear aqui se o PUT retornar 204.
        // Se o backend retornar o objeto atualizado (200 OK com corpo):
        await boxApiClient.put(`/${id}`, boxData);
        // Para simular a resposta ou se o backend for alterado para retornar o objeto:
        // const updatedData = await BoxService.getById(id); // Refetch or construct based on input
        // return updatedData;
        // Por enquanto, vamos assumir que o PUT não retorna corpo e que a página de alteração
        // lidará com o sucesso e redirecionamento.
        // Para compatibilidade com o código existente da página de alteração que espera uma BoxResponseDto:
        return { ...boxData, idBox: id } as BoxResponseDto; // Isso é uma simulação!
                                                            // Idealmente o backend retornaria o objeto atualizado.
    },

    delete: async (id: number): Promise<void> => {
        await boxApiClient.delete(`/${id}`);
    },

    searchByName: async (nome: string): Promise<BoxResponseDto[]> => {
        const response = await boxApiClient.get('/search-by-name', { params: { nome } });
        return response.data.map(box => ({
            ...box,
            dataEntrada: box.dataEntrada ? box.dataEntrada.split('T')[0] : '',
            dataSaida: box.dataSaida ? box.dataSaida.split('T')[0] : '',
        }));
    },

    getByStatus: async (status: 'A' | 'I'): Promise<BoxResponseDto[]> => {
        const response = await boxApiClient.get(`/by-status/${status}`);
        return response.data.map(box => ({
            ...box,
            dataEntrada: box.dataEntrada ? box.dataEntrada.split('T')[0] : '',
            dataSaida: box.dataSaida ? box.dataSaida.split('T')[0] : '',
        }));
    }
};