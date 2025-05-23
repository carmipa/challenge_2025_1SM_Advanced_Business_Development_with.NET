// src/types/veiculo.ts

export const combustiveis = ["Gasolina", "Etanol", "Diesel", "Flex", "Gás Natural", "Elétrico", "Híbrido", "Outro"] as const;
export type CombustivelType = typeof combustiveis[number];

export interface VeiculoRequestDto {
    placa: string;
    renavam: string;
    chassi: string;
    fabricante: string;
    modelo: string;
    motor?: string; // Opcional no C# model (string?)
    ano: number;
    combustivel: CombustivelType | string; // string para permitir outros valores, mas idealmente CombustivelType
}

export interface VeiculoResponseDto {
    idVeiculo: number;
    placa: string;
    renavam: string;
    chassi: string;
    fabricante: string;
    modelo: string;
    motor?: string;
    ano: number;
    combustivel: string; // Backend C# envia como string
    // Adicionar aqui coleções de ClienteVeiculos, VeiculoBoxes, etc., se o backend as retornar e forem necessárias.
}

export interface VeiculoFilter {
    placa?: string;
    renavam?: string;
    chassi?: string;
    fabricante?: string;
    modelo?: string;
    motor?: string;
    ano?: number | string; // Permitir string para input, converter para number antes de enviar se necessário
    combustivel?: string;
    // Filtros de relacionamento (requerem backend complexo)
    clienteCpf?: string;
    boxNome?: string;
    patioNome?: string;
    zonaNome?: string;
}

// DTO para a funcionalidade de Localização
interface RastreamentoSimplificadoDto {
    ipsX: number;
    ipsY: number;
    ipsZ: number;
    gprsLatitude: number;
    gprsLongitude: number;
    gprsAltitude: number;
}
interface EntidadeAssociadaSimplificadaDto { // Para Box, Patio, Zona
    id: number; // idBox, idPatio, idZona
    nome: string;
}

export interface VeiculoLocalizacaoResponseDto {
    idVeiculo: number;
    placa: string;
    modelo: string;
    fabricante: string;
    ultimoRastreamento?: RastreamentoSimplificadoDto | null;
    patioAssociado?: EntidadeAssociadaSimplificadaDto | null;
    zonaAssociada?: EntidadeAssociadaSimplificadaDto | null;
    boxAssociado?: EntidadeAssociadaSimplificadaDto | null;
    dataConsulta: string; // ISO string
}