// src/services/ClienteService.ts
import axios from 'axios';
import type {
    ClienteRequestDto,
    ClienteResponseDto,
    ClienteFilter,
    EnderecoResponseDto, // Importando para uso em formatClienteResponse
    ContatoResponseDto   // Importando para uso em formatClienteResponse
} from '@/types/cliente'; // Ajuste o path se os seus tipos estiverem em outro local
// Removida a importação de SpringPage, pois o backend não retorna essa estrutura para GetAllClientes
// import type { SpringPage } from '@/types/common';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const clienteApiClient = axios.create({
    baseURL: `${API_BASE_URL}/clientes`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Função auxiliar para limpar CPF, CEP, Celular (remover não-dígitos)
const cleanNumericString = (value: string | undefined): string | undefined => {
    return value ? String(value).replace(/\D/g, '') : undefined;
};

// Função para formatar a resposta do cliente, principalmente datas
// e garantir que os objetos aninhados (endereco, contato) tenham a estrutura esperada se vierem da API.
const formatClienteResponse = (clienteData: any): ClienteResponseDto => {
    // O backend C# Cliente model tem TbEnderecoIdEndereco e TbContatoIdContato,
    // e propriedades de navegação Endereco e Contato.
    // Se o backend NÃO incluir os objetos Endereco e Contato aninhados na serialização JSON
    // (por exemplo, se você não usou .Include() no EF Core), então
    // clienteData.endereco e clienteData.contato serão undefined ou null.
    // O frontend precisará lidar com isso ou o backend precisará ser ajustado para enviar esses dados.
    // Assumindo que o backend PODE enviar esses objetos aninhados se .Include() for usado.

    const enderecoResponse: EnderecoResponseDto | undefined = clienteData.endereco ? {
        idEndereco: clienteData.endereco.idEndereco,
        cep: clienteData.endereco.cep,
        logradouro: clienteData.endereco.logradouro,
        numero: clienteData.endereco.numero,
        bairro: clienteData.endereco.bairro,
        cidade: clienteData.endereco.cidade,
        estado: clienteData.endereco.estado,
        pais: clienteData.endereco.pais,
        complemento: clienteData.endereco.complemento,
        observacao: clienteData.endereco.observacao,
    } : undefined;

    const contatoResponse: ContatoResponseDto | undefined = clienteData.contato ? {
        idContato: clienteData.contato.idContato,
        email: clienteData.contato.email,
        ddd: clienteData.contato.ddd,
        ddi: clienteData.contato.ddi,
        telefone1: clienteData.contato.telefone1,
        telefone2: clienteData.contato.telefone2,
        telefone3: clienteData.contato.telefone3,
        celular: clienteData.contato.celular,
        outro: clienteData.contato.outro,
        observacao: clienteData.contato.observacao,
    } : undefined;

    return {
        idCliente: clienteData.idCliente,
        dataCadastro: clienteData.dataCadastro ? clienteData.dataCadastro.split('T')[0] : '',
        sexo: clienteData.sexo,
        nome: clienteData.nome,
        sobrenome: clienteData.sobrenome,
        dataNascimento: clienteData.dataNascimento ? clienteData.dataNascimento.split('T')[0] : '',
        cpf: clienteData.cpf, // CPF já deve vir limpo do backend ou ser formatado na exibição
        profissao: clienteData.profissao,
        estadoCivil: clienteData.estadoCivil,
        tbEnderecoIdEndereco: clienteData.tbEnderecoIdEndereco,
        tbContatoIdContato: clienteData.tbContatoIdContato,
        enderecoResponseDto: enderecoResponse, // Mapeado
        contatoResponseDto: contatoResponse,   // Mapeado
    };
};

export const ClienteService = {
    // GET /api/clientes
    // Ajustado para refletir que GetAllClientes no C# não aceita filtros complexos nem paginação.
    // Se filtros forem passados, delega para as funções de busca específicas se apropriado.
    getAll: async (filters?: ClienteFilter): Promise<ClienteResponseDto[]> => {
        if (filters) {
            if (filters.cpf && cleanNumericString(filters.cpf)?.length === 11 && !filters.nome) {
                const cliente = await ClienteService.getByCpf(filters.cpf); // getByCpf já limpa o CPF
                return cliente ? [cliente] : [];
            }
            if (filters.nome && !filters.cpf) {
                return ClienteService.searchByName(filters.nome);
            }
            // Se ambos os filtros (ou outros filtros não suportados diretamente) forem fornecidos,
            // o endpoint GetAllClientes do C# não os processará.
            // Idealmente, o backend teria um endpoint que aceitasse ClienteFilter.
            // Por ora, se não for um filtro específico, busca todos.
        }
        // Chamada padrão para buscar todos os clientes
        const response = await clienteApiClient.get<any[]>('');
        return response.data.map(formatClienteResponse);
    },

    // Esta função é para a página de busca avançada (ListarClientesPage)
    // Ela assume que o backend /api/clientes (GET) FOI MODIFICADO
    // para aceitar os parâmetros de ClienteFilter e paginação (SpringPage).
    // Se o backend não foi modificado, esta função não funcionará como esperado para filtros/paginação.
    listarPaginadoFiltrado: async (
        filters?: ClienteFilter,
        page: number = 0,
        size: number = 9,
        sort: string = 'idCliente,asc'
    ): Promise<SpringPage<ClienteResponseDto>> => {

        const cleanedFilters: Partial<ClienteFilter> = {};
        if (filters) {
            for (const key in filters) {
                const typedKey = key as keyof ClienteFilter;
                if (filters[typedKey] !== undefined && filters[typedKey] !== '') {
                    if (typedKey === 'cpf' || typedKey === 'contatoCelular') {
                        cleanedFilters[typedKey] = cleanNumericString(filters[typedKey] as string);
                    } else {
                        cleanedFilters[typedKey] = filters[typedKey];
                    }
                }
            }
        }

        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sort,
        });

        Object.entries(cleanedFilters).forEach(([key, value]) => {
            if (value !== undefined) { // Checa se o valor não é undefined após limpeza
                params.append(key, String(value));
            }
        });

        // Esta é a linha que causa o erro se response.data.content for undefined
        const response = await clienteApiClient.get<SpringPage<any>>('', { params }); // Espera SpringPage

        // Adicionando uma verificação para response.data e response.data.content
        if (!response.data || !response.data.content || !Array.isArray(response.data.content)) {
            console.error("Resposta da API inesperada para listarPaginadoFiltrado:", response.data);
            // Retorna uma estrutura SpringPage vazia ou lança um erro mais específico
            return {
                content: [],
                totalPages: 0,
                totalElements: 0,
                number: page,
                size: size,
                first: true,
                last: true,
                numberOfElements: 0,
                empty: true,
                // Adicione outras propriedades de SpringPage com valores padrão
                pageable: { sort: { empty: true, sorted: false, unsorted: true}, offset: 0, pageNumber:0, pageSize:0, paged: false, unpaged: true},
                sort:  { empty: true, sorted: false, unsorted: true}
            };
        }

        return {
            ...response.data,
            content: response.data.content.map(formatClienteResponse),
        };
    },

    getById: async (id: number): Promise<ClienteResponseDto> => {
        const response = await clienteApiClient.get<any>(`/${id}`);
        return formatClienteResponse(response.data);
    },

    create: async (clienteData: ClienteRequestDto): Promise<ClienteResponseDto> => {
        const payload = {
            ...clienteData,
            cpf: cleanNumericString(clienteData.cpf),
            contatoRequestDto: {
                ...clienteData.contatoRequestDto,
                celular: cleanNumericString(clienteData.contatoRequestDto.celular),
                ddd: Number(clienteData.contatoRequestDto.ddd) || 0,
                ddi: Number(clienteData.contatoRequestDto.ddi) || 0,
            },
            enderecoRequestDto: {
                ...clienteData.enderecoRequestDto,
                cep: cleanNumericString(clienteData.enderecoRequestDto.cep),
                numero: Number(clienteData.enderecoRequestDto.numero) || 0,
            }
        };
        const response = await clienteApiClient.post<any>('', payload);
        return formatClienteResponse(response.data);
    },

    update: async (id: number, clienteData: ClienteRequestDto): Promise<void> => { // Alterado para retornar void
        const payload = {
            ...clienteData,
            cpf: cleanNumericString(clienteData.cpf), // Limpa CPF antes de enviar
            contatoRequestDto: {
                ...clienteData.contatoRequestDto,
                celular: cleanNumericString(clienteData.contatoRequestDto.celular),
                ddd: Number(clienteData.contatoRequestDto.ddd) || 0,
                ddi: Number(clienteData.contatoRequestDto.ddi) || 0,
            },
            enderecoRequestDto: {
                ...clienteData.enderecoRequestDto,
                cep: cleanNumericString(clienteData.enderecoRequestDto.cep),
                numero: Number(clienteData.enderecoRequestDto.numero) || 0,
            }
        };
        await clienteApiClient.put(`/${id}`, payload);
        // O backend C# UpdateCliente retorna NoContent (204), então não há objeto de resposta para retornar.
        // A página de alteração no frontend foi ajustada para não esperar um objeto de retorno.
    },

    delete: async (id: number): Promise<void> => {
        await clienteApiClient.delete(`/${id}`);
    },

    getByCpf: async (cpf: string): Promise<ClienteResponseDto | null> => {
        const cleanedCpf = cleanNumericString(cpf);
        if (!cleanedCpf || cleanedCpf.length !== 11) {
            // Considerar lançar erro ou retornar null se o CPF for inválido antes de chamar a API
            console.warn("Tentativa de buscar CPF inválido:", cpf);
            return null;
        }
        try {
            const response = await clienteApiClient.get<any>(`/by-cpf/${cleanedCpf}`);
            return response.data ? formatClienteResponse(response.data) : null;
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                return null; // Cliente não encontrado
            }
            // Relançar outros erros para serem tratados pelo chamador
            console.error(`Erro ao buscar cliente por CPF ${cleanedCpf}:`, error.response || error);
            throw error;
        }
    },

    searchByName: async (nome: string): Promise<ClienteResponseDto[]> => {
        if (!nome || nome.trim() === "") {
            return []; // Retorna array vazio se o nome for inválido ou vazio
        }
        try {
            const response = await clienteApiClient.get<any[]>('/search-by-name', { params: { nome } });
            return response.data.map(formatClienteResponse);
        } catch (error: any) {
            console.error(`Erro ao buscar cliente por nome "${nome}":`, error.response || error);
            throw error; // Relançar para ser tratado pelo chamador
        }
    }
};