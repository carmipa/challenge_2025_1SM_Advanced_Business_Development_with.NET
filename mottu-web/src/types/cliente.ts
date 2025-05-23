// src/types/cliente.ts

// Para aninhar em ClienteRequestDto
export interface EnderecoRequestDto {
    // idEndereco não é enviado ao criar, mas pode ser necessário para update se o backend espera identificar.
    // No seu C# CreateCliente/UpdateCliente, ele recebe o Cliente model completo.
    // Se o Endereco e Contato são criados/atualizados separadamente ou se o ID é esperado, ajuste aqui.
    // Para simplificar, assumindo que ao criar cliente, novos Endereco/Contato são implícitos
    // e ao atualizar, os IDs de Endereco/Contato existentes no cliente não mudam (são atualizados "in-place" pelo backend).
    // Se o backend permitir associar Enderecos/Contatos existentes por ID, adicione os IDs aqui.
    // Baseado no seu C# Cliente Model, que tem TbEnderecoIdEndereco e TbContatoIdContato,
    // parece que os IDs são gerenciados no Cliente, e Endereco/Contato são entidades separadas.
    // Para o ClienteRequestDto, você pode enviar apenas os IDs se eles já existem,
    // ou os dados completos se você quer que o backend os crie/atualize.
    // O seu backend `Cliente` model não tem `Endereco` e `Contato` como objetos aninhados para POST/PUT,
    // mas sim `TbEnderecoIdEndereco` e `TbContatoIdContato`.
    // No entanto, seu frontend `AlterarClientePage` [cite: 1435] e `CadastrarClientePage`
    // têm `enderecoRequestDto` e `contatoRequestDto` aninhados.
    // Isso implica que o backend C# `ClienteService.create/update` (ou o model binder)
    // precisaria lidar com esses objetos aninhados ou você precisa ajustar o frontend
    // para enviar apenas os IDs e gerenciar Endereco/Contato separadamente.

    // Vamos seguir a estrutura do seu frontend e assumir que o backend C#
    // ou uma camada de serviço no backend C# lidaria com a criação/atualização
    // desses objetos aninhados ou a vinculação por ID.
    // Se o C# `Cliente` model é o que é diretamente usado no [FromBody],
    // ele não tem `EnderecoRequestDto` aninhado, mas sim `TbEnderecoIdEndereco`.
    // Precisa de um ALINHAMENTO CRÍTICO AQUI.

    // OPÇÃO 1: Frontend envia IDs (mais alinhado com C# Cliente model direto)
    // -- Esta opção requer que Endereco e Contato sejam criados/gerenciados separadamente PRIMEIRO --
    // export interface ClienteRequestDto {
    //   // ... outros campos do cliente
    //   tbEnderecoIdEndereco: number;
    //   tbContatoIdContato: number;
    // }

    // OPÇÃO 2: Frontend envia objetos aninhados (como seu frontend page.tsx sugere)
    // -- Esta opção requer que o C# endpoint `CreateCliente` e `UpdateCliente`
    //    aceitem um DTO mais complexo que o `Cliente` model, ou que o `Cliente` model
    //    seja modificado para incluir objetos Endereco e Contato para binding,
    //    ou que uma lógica customizada no backend processe esses objetos aninhados. --
    // Vou prosseguir com a OPÇÃO 2 baseada na estrutura do seu frontend page.tsx.
    // Isso significa que o C# `CreateCliente` e `UpdateCliente` precisariam ser ajustados
    // para receber um DTO mais completo ou ter lógica para lidar com isso.
    // Por agora, as interfaces TypeScript refletirão essa estrutura aninhada.

    idEndereco?: number; // Para atualização, se o backend identificar por ID
    cep: string;
    numero: number;
    complemento?: string;
    observacao?: string;
    // Campos preenchidos por ViaCEP (logradouro, bairro, cidade, estado) não são enviados normalmente,
    // a menos que o backend os espere para alguma validação ou persistência manual.
    // Se o backend salva esses campos (o seu `Endereco.cs` salva), eles devem ser enviados.
    logradouro?: string; // Adicionado
    bairro?: string;     // Adicionado
    cidade?: string;     // Adicionado
    estado?: string;     // Adicionado
    pais?: string;       // Adicionado, default "Brasil"
}

export interface ContatoRequestDto {
    idContato?: number; // Para atualização
    email: string;
    ddd: number;
    ddi: number;
    telefone1: string;
    telefone2?: string;
    telefone3?: string;
    celular: string;
    outro?: string;
    observacao?: string;
}

export type EstadoCivilType = "Solteiro" | "Casado" | "Divorciado" | "Viúvo" | "Separado" | "União Estável";
export type SexoType = "M" | "F"; // Ajuste se "H" for uma opção válida e distinta

export interface ClienteRequestDto {
    nome: string;
    sobrenome: string;
    sexo: SexoType;
    dataNascimento: string; // "YYYY-MM-DD"
    cpf: string; // Será enviado limpo (só números)
    profissao: string;
    estadoCivil: EstadoCivilType;
    // DataCadastro é gerada pelo backend
    enderecoRequestDto: EnderecoRequestDto;
    contatoRequestDto: ContatoRequestDto;
}

// Para receber dados do Cliente (GET)
export interface EnderecoResponseDto {
    idEndereco: number;
    cep: string;
    logradouro: string;
    numero: number;
    bairro: string;
    cidade: string;
    estado: string;
    pais: string;
    complemento?: string;
    observacao?: string;
}

export interface ContatoResponseDto {
    idContato: number;
    email: string;
    ddd: number;
    ddi: number;
    telefone1: string;
    telefone2?: string;
    telefone3?: string;
    celular: string;
    outro?: string;
    observacao?: string;
}

export interface ClienteResponseDto {
    idCliente: number;
    dataCadastro: string; // ISO String from backend
    sexo: SexoType;
    nome: string;
    sobrenome: string;
    dataNascimento: string; // ISO String
    cpf: string;
    profissao: string;
    estadoCivil: EstadoCivilType;
    tbEnderecoIdEndereco: number; // ID do endereço associado
    tbContatoIdContato: number;   // ID do contato associado
    enderecoResponseDto?: EnderecoResponseDto; // Objeto Endereco aninhado na resposta
    contatoResponseDto?: ContatoResponseDto;   // Objeto Contato aninhado na resposta
}

export interface ClienteFilter {
    nome?: string;
    sobrenome?: string;
    cpf?: string;
    sexo?: SexoType | '';
    profissao?: string;
    estadoCivil?: EstadoCivilType | '';
    dataCadastroInicio?: string;
    dataCadastroFim?: string;
    dataNascimentoInicio?: string;
    dataNascimentoFim?: string;
    enderecoCidade?: string;
    enderecoEstado?: string;
    contatoEmail?: string;
    contatoCelular?: string;
    // Filtros de Veiculo não pertencem aqui, mas sim em VeiculoFilter
    // veiculoPlaca?: string;
    // veiculoModelo?: string;
}