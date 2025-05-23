// src/services/VeiculoService.ts
import axios from 'axios';
import type {
    VeiculoRequestDto,
    VeiculoResponseDto,
    VeiculoFilter,
    VeiculoLocalizacaoResponseDto
} from '@/types/veiculo';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const veiculoApiClient = axios.create({
    baseURL: `${API_BASE_URL}/veiculos`,
    headers: {
        'Content-Type': 'application/json',
    },
});

const formatVeiculoResponse = (veiculo: any): VeiculoResponseDto => ({
    ...veiculo,
    // ano já é number, combustivel é string. Não precisa de formatação específica aqui.
});

export const VeiculoService = {
    getAll: async (filters?: VeiculoFilter): Promise<VeiculoResponseDto[]> => {
        // NOTA: C# GetAllVeiculos() não aceita filtros complexos.
        // Esta função tentará usar endpoints específicos se um filtro singular for passado.
        // Para filtros avançados (especialmente de relacionamento), o backend precisa de um endpoint que os suporte.
        if (filters) {
            const activeFilterKeys = Object.keys(filters).filter(key => filters[key as keyof VeiculoFilter] !== undefined && filters[key as keyof VeiculoFilter] !== '');

            if (activeFilterKeys.length === 1) {
                if (filters.placa) {
                    try { // getByPlaca pode retornar um único objeto ou null/404
                        const veiculo = await VeiculoService.getByPlaca(filters.placa);
                        return veiculo ? [veiculo] : [];
                    } catch { return []; }
                }
                if (filters.modelo) {
                    return VeiculoService.searchByModelo(filters.modelo);
                }
                // Outros filtros singulares (renavam, chassi) não têm endpoints de busca específicos no controller atual.
            }
            // Se filtros complexos ou de relacionamento (clienteCpf, etc.)
            // o endpoint GET /api/veiculos no backend precisaria suportá-los.
            const response = await veiculoApiClient.get('', { params: filters });
            return response.data.map(formatVeiculoResponse);
        }

        const response = await veiculoApiClient.get('');
        return response.data.map(formatVeiculoResponse);
    },

    getById: async (id: number): Promise<VeiculoResponseDto> => {
        const response = await veiculoApiClient.get<any>(`/${id}`);
        return formatVeiculoResponse(response.data);
    },

    create: async (veiculoData: VeiculoRequestDto): Promise<VeiculoResponseDto> => {
        const payload = { ...veiculoData, ano: Number(veiculoData.ano) };
        const response = await veiculoApiClient.post<any>('', payload);
        return formatVeiculoResponse(response.data);
    },

    update: async (id: number, veiculoData: VeiculoRequestDto): Promise<void> => {
        const payload = { ...veiculoData, ano: Number(veiculoData.ano) };
        await veiculoApiClient.put(`/${id}`, payload); // Retorna 204 No Content
    },

    delete: async (id: number): Promise<void> => {
        await veiculoApiClient.delete(`/${id}`);
    },

    getByPlaca: async (placa: string): Promise<VeiculoResponseDto | null> => {
        try {
            const response = await veiculoApiClient.get<any>(`/by-placa/${placa}`);
            return formatVeiculoResponse(response.data);
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                return null;
            }
            throw error;
        }
    },

    searchByModelo: async (modelo: string): Promise<VeiculoResponseDto[]> => {
        const response = await veiculoApiClient.get('/search-by-model', { params: { modelo } });
        return response.data.map(formatVeiculoResponse);
    },

    // Este endpoint é uma suposição baseada na necessidade do frontend.
    // O backend C# precisaria de um endpoint /api/veiculos/{id}/localizacao
    getLocalizacao: async (id: number): Promise<VeiculoLocalizacaoResponseDto> => {
        // O backend precisaria de um endpoint específico para isso, ex: /api/veiculos/{id}/localizacao
        // Este endpoint no backend agregaria as informações.
        const response = await veiculoApiClient.get<any>(`/${id}/localizacao`); // Rota hipotética
        return {
            ...response.data,
            dataConsulta: response.data.dataConsulta || new Date().toISOString(),
        };
    }
};