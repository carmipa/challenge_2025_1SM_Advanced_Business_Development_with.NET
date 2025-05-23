// src/services/ClienteService.ts
import axios from 'axios';
import type {
    ClienteRequestDto,
    ClienteResponseDto,
    ClienteFilter,
    EnderecoResponseDto, // Importando para uso em formatClienteResponse
    ContatoResponseDto   // Importando para uso em formatClienteResponse
} from '@/types/cliente'; // Ajuste o path se os seus tipos estiverem em outro local
import type { VeiculoResponseDto } from '@/types/veiculo'; // Importação adicionada
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

    // Função para listar clientes com base em filtros específicos (CPF ou Nome),
    // ou buscar todos se nenhum filtro aplicável for fornecido.
    // Remove a lógica de paginação e ordenação, alinhando-se com os endpoints de backend existentes.
    listarPaginadoFiltrado: async (filters?: ClienteFilter): Promise<ClienteResponseDto[]> => {
        if (filters?.cpf) {
            const cleanedCpf = cleanNumericString(filters.cpf);
            if (cleanedCpf && cleanedCpf.length === 11) {
                // ClienteService.getByCpf já trata a formatação da resposta e retorna ClienteResponseDto | null
                const cliente = await ClienteService.getByCpf(cleanedCpf);
                return cliente ? [cliente] : [];
            }
            // Se o CPF estiver presente mas for inválido, não prossegue para outros filtros e retorna vazio.
            // Poderia também lançar um erro ou retornar todos, dependendo da UX desejada.
            console.warn("CPF fornecido para listarPaginadoFiltrado é inválido:", filters.cpf);
            return [];
        }

        if (filters?.nome) {
            // ClienteService.searchByName já trata a formatação e retorna ClienteResponseDto[]
            return ClienteService.searchByName(filters.nome);
        }

        // Caso padrão: nenhum filtro de CPF ou Nome fornecido (ou filtros vazios/undefined)
        // Busca todos os clientes.
        // O endpoint GetAllClientes do C# não suporta outros filtros como dataCadastro ou estadoCivil diretamente.
        // Se `filters` contiver outros campos (ex: dataCadastro, estadoCivil), eles serão ignorados aqui.
        console.log("Nenhum filtro de CPF ou Nome válido fornecido, buscando todos os clientes.");
        const response = await clienteApiClient.get<any[]>(''); // Endpoint base para buscar todos
        return response.data.map(formatClienteResponse);
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
    },

    // Métodos para gerenciar associações Cliente-Veículo

    async getVeiculosByClienteId(clienteId: number): Promise<VeiculoResponseDto[]> {
        try {
            const response = await clienteApiClient.get<VeiculoResponseDto[]>(`/${clienteId}/veiculos`);
            // O backend retorna 204 NoContent se não houver veículos,
            // o que o Axios pode tratar como um erro ou retornar response.data como null/undefined.
            // Se response.data for null/undefined em caso de 204, retorna array vazio.
            return response.data || [];
        } catch (error: any) {
            console.error(`Erro ao buscar veículos para o cliente ID ${clienteId}:`, error.response || error);
            if (error.response && error.response.status === 404) { // Cliente não encontrado
                // Lançar erro específico ou retornar vazio, dependendo da necessidade da UI
                // Para consistência com o backend que retorna 404 se o cliente não existe, pode ser melhor relançar.
                throw new Error(`Cliente com ID ${clienteId} não encontrado.`);
            }
            if (error.response && error.response.status === 204) { // Nenhum veículo associado
                return [];
            }
            // Relança outros erros para serem tratados pelo chamador
            throw error;
        }
    },

    async associateVeiculosWithCliente(clienteId: number, veiculoIds: number[]): Promise<any> {
        try {
            const response = await clienteApiClient.post<any>(`/${clienteId}/veiculos`, veiculoIds);
            return response.data; // O backend retorna as associações criadas (201) ou existentes (200)
        } catch (error: any) {
            console.error(`Erro ao associar veículos ao cliente ID ${clienteId}:`, error.response || error);
            // Adicionar tratamento mais específico se necessário (ex: IDs de veículos não encontrados)
            if (error.response && error.response.data && error.response.data.title) {
                 throw new Error(`Falha ao associar veículos: ${error.response.data.title} - ${error.response.data.detail || JSON.stringify(error.response.data.errors) }`);
            }
            throw error;
        }
    },

    async dissociateVeiculoFromCliente(clienteId: number, veiculoId: number): Promise<void> {
        try {
            await clienteApiClient.delete(`/${clienteId}/veiculos/${veiculoId}`);
            // Backend retorna 204 No Content em sucesso, então não há dados de resposta.
        } catch (error: any) {
            console.error(`Erro ao desassociar veículo ID ${veiculoId} do cliente ID ${clienteId}:`, error.response || error);
            if (error.response && error.response.status === 404) {
                throw new Error(`Associação entre Cliente ID ${clienteId} e Veículo ID ${veiculoId} não encontrada.`);
            }
            throw error;
        }
    }
};