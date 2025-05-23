// src/types/patio.ts

export interface PatioRequestDto {
    nomePatio: string;
    dataEntrada: string; // Formato "YYYY-MM-DD"
    dataSaida: string;   // Formato "YYYY-MM-DD"
    observacao?: string;
}

export interface PatioResponseDto {
    idPatio: number;
    nomePatio: string;
    dataEntrada: string; // Formato "YYYY-MM-DD" (convertido de ISO no serviço)
    dataSaida: string;   // Formato "YYYY-MM-DD" (convertido de ISO no serviço)
    observacao?: string;
    // Se o backend for ajustado para incluir informações de associações (Veiculos, Zonas, Boxes, etc.)
    // adicione essas propriedades aqui. Por ora, focaremos nas propriedades diretas do Pátio.
}

// Filtro para a página de Busca Avançada (src/app/patio/buscar/page.tsx)
export interface PatioFilter {
    nomePatio?: string;
    dataEntradaInicio?: string;
    dataEntradaFim?: string;
    dataSaidaInicio?: string;
    dataSaidaFim?: string;
    observacao?: string;
    // Filtros de entidades relacionadas (requerem backend complexo para funcionar)
    veiculoPlaca?: string;
    enderecoCidade?: string; // Patio pode ter Enderecos associados via EnderecoPatio
    contatoEmail?: string;   // Patio pode ter Contatos associados via ContatoPatio
    zonaNome?: string;       // Patio pode ter Zonas associadas via ZonaPatio
    boxNome?: string;        // Patio pode ter Boxes associados via PatioBox
}