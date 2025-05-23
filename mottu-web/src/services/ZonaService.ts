// src/services/ZonaService.ts
import axios from 'axios';
import type { ZonaRequestDto, ZonaResponseDto, ZonaFilter } from '@/types/zona';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const zonaApiClient = axios.create({
    baseURL: `${API_BASE_URL}/zonas`,
    headers: {
        'Content-Type': 'application/json',
    },
});

const formatZonaResponseData = (zona: any): ZonaResponseDto => ({
    ...zona,
    dataEntrada: zona.dataEntrada ? zona.dataEntrada.split('T')[0] : '',
    dataSaida: zona.dataSaida ? zona.dataSaida.split('T')[0] : '',
});

export const ZonaService = {
    getAll: async (filters?: ZonaFilter): Promise<ZonaResponseDto[]> => {
        // NOTA: C# GetAllZonas() não aceita 'filters' complexos.
        // Lógica similar ao PatioService.getAll para tentar usar endpoints específicos.
        if (filters) {
            if (filters.nome && Object.keys(filters).filter(k => !!filters[k as keyof ZonaFilter]).length === 1) {
                return ZonaService.searchByName(filters.nome);
            }
            if (filters.dataEntradaInicio && !filters.dataEntradaFim && Object.keys(filters).filter(k => !!filters[k as keyof ZonaFilter]).length === 1) {
                try { return await ZonaService.getByDate(filters.dataEntradaInicio, 'entrada'); } catch { /* fallback */ }
            }
            if (filters.dataSaidaInicio && !filters.dataSaidaFim && Object.keys(filters).filter(k => !!filters[k as keyof ZonaFilter]).length === 1) {
                try { return await ZonaService.getByDate(filters.dataSaidaInicio, 'saida'); } catch { /* fallback */ }
            }
            // Para filtros complexos/relacionamento, o backend GET /api/zonas precisaria suportá-los.
            const response = await zonaApiClient.get('', { params: filters });
            return response.data.map(formatZonaResponseData);
        }

        const response = await zonaApiClient.get('');
        return response.data.map(formatZonaResponseData);
    },

    getById: async (id: number): Promise<ZonaResponseDto> => {
        const response = await zonaApiClient.get<any>(`/${id}`);
        return formatZonaResponseData(response.data);
    },

    create: async (zonaData: ZonaRequestDto): Promise<ZonaResponseDto> => {
        const response = await zonaApiClient.post<any>('', zonaData);
        return formatZonaResponseData(response.data);
    },

    update: async (id: number, zonaData: ZonaRequestDto): Promise<void> => {
        // C# UpdateZona retorna NoContent (204)
        await zonaApiClient.put(`/${id}`, zonaData);
    },

    delete: async (id: number): Promise<void> => {
        await zonaApiClient.delete(`/${id}`);
    },

    searchByName: async (nome: string): Promise<ZonaResponseDto[]> => {
        const response = await zonaApiClient.get('/search-by-name', { params: { nome } });
        return response.data.map(formatZonaResponseData);
    },

    getByDate: async (date: string, type: 'entrada' | 'saida'): Promise<ZonaResponseDto[]> => {
        const response = await zonaApiClient.get('/by-date', { params: { date, type } });
        return response.data.map(formatZonaResponseData);
    },
};