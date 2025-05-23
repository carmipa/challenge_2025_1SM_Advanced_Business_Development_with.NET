// src/types/box.ts

// Para enviar dados ao criar ou atualizar um Box (POST, PUT)
export interface BoxRequestDto {
    nome: string;
    status: boolean; // Alterado para boolean
    dataEntrada: string; // Formato "YYYY-MM-DD"
    dataSaida: string;   // Formato "YYYY-MM-DD"
    observacao?: string;
}

// Para receber dados do Box da API (GET)
export interface BoxResponseDto {
    idBox: number;
    nome: string;
    status: boolean; // Alterado para boolean (API enviará true/false)
    dataEntrada: string; // Provavelmente formato ISO string, ex: "2024-12-31T00:00:00"
    dataSaida: string;   // Provavelmente formato ISO string
    observacao?: string;
    // Adicione aqui outras propriedades se seu BoxResponseDto do backend as incluir
    // por exemplo, de PatioBoxes, VeiculoBoxes, ZonaBoxes se forem serializadas.
}

// Para filtros na listagem (se aplicável)
export interface BoxFilter {
    nome?: string;
    status?: 'A' | 'I' | ''; // Para o endpoint de filtro por status que espera "A" ou "I"
    dataEntradaInicio?: string;
    dataEntradaFim?: string;
    dataSaidaInicio?: string;
    dataSaidaFim?: string;
    observacao?: string;
}