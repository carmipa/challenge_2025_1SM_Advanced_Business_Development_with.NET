// src/app/box/listar/page.tsx
"use client";

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { BoxService } from '@/services/BoxService'; // Ajuste o path se necessário
import NavBar from '@/components/nav-bar';
import {
    MdList, MdAdd, MdSearch, MdErrorOutline, MdEdit, MdDelete,
    MdCheckCircle
} from 'react-icons/md';
import { Hash } from 'lucide-react';
import { BoxResponseDto, BoxFilter } from '@/types/box'; // Ajuste o path se necessário

export default function ListarBoxesPage() {
    const [boxes, setBoxes] = useState<BoxResponseDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [filter, setFilter] = useState<BoxFilter>({
        nome: '',
        status: '', // "A", "I", ou ""
        // outros campos de filtro podem ser adicionados aqui se o backend suportar
    });

    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return '-';
        try {
            // A API já deve retornar no formato "YYYY-MM-DD" após os ajustes no serviço
            // Se vier com T00:00:00Z, new Date() e toLocaleDateString ainda é uma boa forma de formatar.
            return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' }); // Adiciona timeZone UTC para consistência
        } catch (e) {
            console.error("Erro ao formatar data:", dateString, e);
            return 'Inválida';
        }
    };

    const fetchBoxes = async (currentFilter?: BoxFilter) => {
        setIsLoading(true);
        setError(null);
        // Removido setSuccessMessage(null) daqui para persistir após deleção

        const activeFilter = currentFilter || filter;

        try {
            let data: BoxResponseDto[];
            // Lógica de chamada baseada nos filtros ativos
            // Esta é uma simplificação. Uma API robusta teria um endpoint GetAll com todos os filtros.
            if (activeFilter.nome && activeFilter.status) {
                // Cenário não suportado diretamente pelos endpoints C# atuais (combinar nome E status)
                // Você precisaria de um novo endpoint no C# ou filtrar no cliente após buscar por um e depois pelo outro, ou buscar todos.
                // Por simplicidade, vamos priorizar nome, ou alertar o usuário.
                setError("Filtragem combinada por nome E status não é suportada diretamente. Buscando por nome.");
                data = await BoxService.searchByName(activeFilter.nome);
                // Poderia filtrar client-side pelo status aqui, se necessário.
                if (activeFilter.status) {
                    const statusBool = activeFilter.status === 'A';
                    data = data.filter(box => box.status === statusBool);
                }

            } else if (activeFilter.nome) {
                data = await BoxService.searchByName(activeFilter.nome);
            } else if (activeFilter.status && (activeFilter.status === 'A' || activeFilter.status === 'I')) {
                data = await BoxService.getByStatus(activeFilter.status);
            } else {
                // Se nenhum filtro específico ou combinação complexa, busca todos
                // (BoxService.getAll foi ajustado para não enviar filtros que o C# GetAllBoxes não entende)
                data = await BoxService.getAll(); // Ou BoxService.getAll(activeFilter) se o backend for ajustado
            }
            setBoxes(data);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Erro ao carregar boxes. Tente novamente.');
            console.error("Erro detalhado fetchBoxes:", err);
            setBoxes([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterSubmit = (e: FormEvent) => {
        e.preventDefault();
        fetchBoxes(filter);
    };

    useEffect(() => {
        fetchBoxes(); // Carga inicial
        // Verifica se há mensagem de deleção na URL (exemplo)
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.get('deleted') === 'true') {
            setSuccessMessage("Box excluído com sucesso!");
            // Limpa o query param para não mostrar a mensagem em refresh
            window.history.replaceState({}, document.title, window.location.pathname);
            setTimeout(() => setSuccessMessage(null), 5000);
        }
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFilter((prevFilter) => ({
            ...prevFilter,
            [name]: value,
        }));
    };

    const handleDelete = async (id: number, nomeBox: string) => {
        if (window.confirm(`Tem certeza que deseja deletar o Box "${nomeBox}" (ID: ${id})?`)) {
            // Não precisa de setIsLoading(true) aqui se fetchBoxes já o faz.
            setError(null);
            try {
                await BoxService.delete(id);
                setSuccessMessage(`Box "${nomeBox}" (ID: ${id}) deletado com sucesso!`);
                fetchBoxes(filter); // Recarrega a lista com os filtros atuais
                setTimeout(() => setSuccessMessage(null), 5000);
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || 'Erro ao deletar box.');
                console.error("Erro detalhado handleDelete:", err);
            }
        }
    };

    return (
        <>
            <NavBar active="boxes-listar" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-center sm:text-left">
                        <MdList className="text-3xl text-sky-400" /> Lista de Boxes
                    </h1>
                    <Link href="/box/cadastrar">
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow whitespace-nowrap">
                            <MdAdd size={18} /> Novo Box
                        </button>
                    </Link>
                </div>

                <form onSubmit={handleFilterSubmit} className="mb-6 p-4 bg-slate-800 rounded-lg shadow-md flex flex-wrap gap-4 items-end">
                    <div>
                        <label htmlFor="nome" className="text-sm text-slate-300 block mb-1">Nome:</label>
                        <input
                            type="text"
                            id="nome"
                            name="nome"
                            value={filter.nome || ''}
                            onChange={handleFilterChange}
                            className="p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white"
                            placeholder="Parte do nome"
                        />
                    </div>
                    <div>
                        <label htmlFor="status" className="text-sm text-slate-300 block mb-1">Status:</label>
                        <select
                            id="status"
                            name="status"
                            value={filter.status || ''}
                            onChange={handleFilterChange}
                            className="p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white min-w-[100px]"
                        >
                            <option value="">Todos</option>
                            <option value="A">Livre (Ativo)</option>
                            <option value="I">Ocupado (Inativo)</option>
                        </select>
                    </div>
                    {/* Outros filtros de data podem ser adicionados aqui se o backend suportar */}
                    <button type="submit" className="p-2 h-10 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md flex items-center gap-2 px-4">
                        <MdSearch size={20} /> Aplicar Filtros
                    </button>
                </form>

                {isLoading && <p className="text-center text-sky-300 py-10">Carregando boxes...</p>}
                {error && (
                    <div className="relative max-w-3xl mx-auto mb-6 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert">
                        <MdErrorOutline className="inline mr-2" />{error}
                        <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar"><span className="text-xl" aria-hidden="true">&times;</span></button>
                    </div>
                )}
                {successMessage && (
                    <div className="relative max-w-3xl mx-auto mb-6 text-green-400 bg-green-900/50 p-4 pr-10 rounded border border-green-500" role="alert">
                        <MdCheckCircle className="inline mr-2" />{successMessage}
                        <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-green-400 hover:text-green-200" onClick={() => setSuccessMessage(null)} aria-label="Fechar"><span className="text-xl" aria-hidden="true">&times;</span></button>
                    </div>
                )}

                {!isLoading && !error && boxes.length === 0 && (
                    <p className="text-center text-slate-400 py-10 bg-slate-900 rounded-lg shadow-xl">Nenhum box encontrado para os critérios informados.</p>
                )}
                {!isLoading && boxes.length > 0 && (
                    <div className="overflow-x-auto bg-slate-900 rounded-lg shadow">
                        <table className="min-w-full table-auto">
                            <thead className="bg-slate-800 border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider flex items-center gap-1"><Hash size={14}/> ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Data Entrada</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Data Saída</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Observação</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                            {boxes.map((box) => (
                                <tr key={box.idBox} className="hover:bg-slate-800/50">
                                    <td className="px-6 py-4 whitespace-nowrap">{box.idBox}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{box.nome}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{box.status ? 'Livre (Ativo)' : 'Ocupado (Inativo)'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(box.dataEntrada)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(box.dataSaida)}</td>
                                    <td className="px-6 py-4 whitespace-normal max-w-xs truncate" title={box.observacao || ''}>{box.observacao || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center space-x-2 flex items-center justify-center">
                                        <Link href={`/box/alterar/${box.idBox}`}>
                                            <button className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-black rounded flex items-center gap-1">
                                                <MdEdit size={14} /> Editar
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(box.idBox, box.nome)}
                                            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded flex items-center gap-1"
                                        >
                                            <MdDelete size={14} /> Deletar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
            <style jsx global>{`
                .date-input-fix::-webkit-calendar-picker-indicator { filter: invert(0.8); cursor: pointer; }
                input[type="date"]:required:invalid::-webkit-datetime-edit { color: transparent; }
                input[type="date"]:focus::-webkit-datetime-edit { color: white !important; }
                input[type="date"]::-webkit-datetime-edit { color: white; }
            `}</style>
        </>
    );
}