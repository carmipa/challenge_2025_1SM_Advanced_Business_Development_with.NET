// src/services/PatioService.ts
import axios from 'axios';
import type { PatioRequestDto, PatioResponseDto, PatioFilter } from '@/types/patio';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const patioApiClient = axios.create({
    baseURL: `${API_BASE_URL}/patios`,
    headers: {
        'Content-Type': 'application/json',
    },
});

const formatPatioResponseData = (patio: any): PatioResponseDto => ({
    ...patio,
    dataEntrada: patio.dataEntrada ? patio.dataEntrada.split('T')[0] : '',
    dataSaida: patio.dataSaida ? patio.dataSaida.split('T')[0] : '',
});

export const PatioService = {
    // GET /api/patios - Ajustado para tentar usar filtros específicos se possível
    getAll: async (filters?: PatioFilter): Promise<PatioResponseDto[]> => {
        // NOTA: O C# GetAllPatios() não aceita 'filters' complexos.
        // Esta implementação do serviço tentará usar endpoints específicos se um filtro singular for fornecido.
        // Para filtros combinados ou os de entidades relacionadas (veiculoPlaca etc.),
        // o backend precisaria ser significativamente alterado.
        if (filters) {
            if (filters.nomePatio && Object.keys(filters).length === 1) {
                return PatioService.searchByName(filters.nomePatio);
            }
            // Lógica para GetPatiosByDate (precisaria de um tipo de data e a data específica)
            // Se `filters.dataEntradaInicio` for a data exata e um `filters.dateType === 'entrada'`
            if (filters.dataEntradaInicio && !filters.dataEntradaFim && Object.keys(filters).filter(k => !!filters[k as keyof PatioFilter]).length === 1) {
                // Assumindo que dataEntradaInicio é a data exata para o filtro 'entrada'
                try {
                    return await PatioService.getByDate(filters.dataEntradaInicio, 'entrada');
                } catch (e) { /* ignora e busca todos se falhar */ }
            }
            if (filters.dataSaidaInicio && !filters.dataSaidaFim && Object.keys(filters).filter(k => !!filters[k as keyof PatioFilter]).length === 1) {
                // Assumindo que dataSaidaInicio é a data exata para o filtro 'saida'
                try {
                    return await PatioService.getByDate(filters.dataSaidaInicio, 'saida');
                } catch (e) { /* ignora e busca todos se falhar */ }
            }
            // Se filtros mais complexos ou de relacionamento forem passados, o endpoint GET /api/patios
            // no backend C# precisaria ser capaz de processá-los.
            // Se não, esta chamada `patioApiClient.get('', { params: filters })` pode não filtrar como esperado.
            // Para a página de busca avançada, é ESSENCIAL que o backend suporte esses filtros.
            const response = await patioApiClient.get('', { params: filters });
            return response.data.map(formatPatioResponseData);
        }

        // Fallback: buscar todos se nenhum filtro ou lógica de filtro específica não for atendida.
        const response = await patioApiClient.get('');
        return response.data.map(formatPatioResponseData);
    },

    getById: async (id: number): Promise<PatioResponseDto> => {
        const response = await patioApiClient.get<any>(`/${id}`);
        return formatPatioResponseData(response.data);
    },

    create: async (patioData: PatioRequestDto): Promise<PatioResponseDto> => {
        const response = await patioApiClient.post<any>('', patioData);
        return formatPatioResponseData(response.data);
    },

    update: async (id: number, patioData: PatioRequestDto): Promise<void> => {
        // C# UpdatePatio retorna NoContent (204)
        await patioApiClient.put(`/${id}`, patioData);
        // A página de alteração não deve esperar um objeto de retorno aqui.
    },

    delete: async (id: number): Promise<void> => {
        await patioApiClient.delete(`/${id}`);
    },

    searchByName: async (nomePatio: string): Promise<PatioResponseDto[]> => {
        const response = await patioApiClient.get('/search-by-name', { params: { nomePatio } });
        return response.data.map(formatPatioResponseData);
    },

    getByDate: async (date: string, type: 'entrada' | 'saida'): Promise<PatioResponseDto[]> => {
        // O endpoint C# é /by-date?date=YYYY-MM-DD&type=entrada
        const response = await patioApiClient.get('/by-date', { params: { date, type } });
        return response.data.map(formatPatioResponseData);
    },
};