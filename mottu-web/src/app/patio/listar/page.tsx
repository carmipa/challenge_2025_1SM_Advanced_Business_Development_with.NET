// src/app/patio/listar/page.tsx
"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from 'react'; // Adicionado ChangeEvent
import Link from 'next/link';
import { PatioService } from '@/services/PatioService'; // Ajuste o path
import NavBar from '@/components/nav-bar';
import {
    MdList, MdAdd, MdSearch, MdErrorOutline, MdEdit, MdDelete,
    MdCheckCircle, MdLocationOn, MdInfo // Adicionado MdInfo
} from 'react-icons/md';
import { Hash, Loader2 } from 'lucide-react'; // Adicionado Loader2
import { PatioResponseDto, PatioFilter } from '@/types/patio'; // Ajuste o path

export default function ListarPatiosPage() {
    const [patios, setPatios] = useState<PatioResponseDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [filter, setFilter] = useState<PatioFilter>({ // Usando a interface completa para consistência com a busca
        nomePatio: '',
        dataEntradaInicio: '',
        dataEntradaFim: '',
        // Adicione outros campos se quiser filtros básicos aqui.
        // Os filtros avançados de relacionamento (veiculoPlaca, etc.) não são usados aqui
        // pois o C# GetAllPatios não os suporta sem modificação.
    });

    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        } catch (e) {
            console.error("Erro ao formatar data (listar patio):", dateString, e);
            return 'Inválida';
        }
    };

    const fetchPatios = async (currentFilter?: PatioFilter) => {
        setIsLoading(true);
        setError(null);

        const activeFilter = currentFilter || filter;
        const simpleFilterForList: PatioFilter = { // Filtros que esta página efetivamente usará
            nomePatio: activeFilter.nomePatio,
            dataEntradaInicio: activeFilter.dataEntradaInicio, // Para GetByDate (entrada)
            dataSaidaInicio: activeFilter.dataSaidaInicio,   // Para GetByDate (saida)
        };

        try {
            let data: PatioResponseDto[];
            if (simpleFilterForList.nomePatio && !simpleFilterForList.dataEntradaInicio && !simpleFilterForList.dataSaidaInicio) {
                data = await PatioService.searchByName(simpleFilterForList.nomePatio);
            } else if (simpleFilterForList.dataEntradaInicio && !simpleFilterForList.nomePatio && !simpleFilterForList.dataSaidaInicio) {
                data = await PatioService.getByDate(simpleFilterForList.dataEntradaInicio, 'entrada');
            } else if (simpleFilterForList.dataSaidaInicio && !simpleFilterForList.nomePatio && !simpleFilterForList.dataEntradaInicio) {
                data = await PatioService.getByDate(simpleFilterForList.dataSaidaInicio, 'saida');
            }
            // Adicionar lógica se quiser combinar filtros simples ou se o backend for melhorado
            else {
                // Por enquanto, se múltiplos filtros simples forem usados, ou nenhum, busca todos.
                // O PatioService.getAll passará 'simpleFilterForList', mas o backend C# GetAllPatios não os usa.
                data = await PatioService.getAll(simpleFilterForList);
            }
            setPatios(data);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Erro ao carregar pátios.');
            console.error("Erro detalhado fetchPatios (listar):", err.response || err);
            setPatios([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterSubmit = (e: FormEvent) => {
        e.preventDefault();
        fetchPatios(filter);
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.get('deleted') === 'true') {
            setSuccessMessage("Pátio excluído com sucesso!");
            window.history.replaceState({}, document.title, window.location.pathname);
            setTimeout(() => setSuccessMessage(null), 5000);
        }
        fetchPatios(); // Carga inicial
    }, []);

    const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilter((prevFilter) => ({
            ...prevFilter,
            [name]: value,
        }));
    };

    const handleDelete = async (id: number, nomePatio: string) => {
        if (window.confirm(`Tem certeza que deseja deletar o Pátio "${nomePatio}" (ID: ${id})?`)) {
            setError(null);
            try {
                await PatioService.delete(id);
                setSuccessMessage(`Pátio "${nomePatio}" (ID: ${id}) deletado com sucesso!`);
                fetchPatios(filter); // Recarrega a lista com os filtros atuais
                setTimeout(() => setSuccessMessage(null), 5000);
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || 'Erro ao deletar pátio.');
                console.error("Erro detalhado handleDelete (listar patio):", err.response || err);
            }
        }
    };

    return (
        <>
            <NavBar active="patio-listar" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-center sm:text-left">
                        <MdLocationOn className="text-3xl text-sky-400" /> Lista de Pátios
                    </h1>
                    <div className="flex gap-2">
                        <Link href="/patio/buscar"
                              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-md shadow whitespace-nowrap">
                            <MdSearch size={18} /> Busca Avançada
                        </Link>
                        <Link href="/patio/cadastrar">
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow whitespace-nowrap">
                                <MdAdd size={18} /> Novo Pátio
                            </button>
                        </Link>
                    </div>
                </div>

                <form onSubmit={handleFilterSubmit} className="mb-6 p-4 bg-slate-800 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label htmlFor="nomePatio" className="text-sm text-slate-300 block mb-1">Nome Pátio:</label>
                        <input
                            type="text" id="nomePatio" name="nomePatio"
                            value={filter.nomePatio || ''} onChange={handleFilterChange}
                            className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white"
                            placeholder="Nome do pátio"
                        />
                    </div>
                    <div>
                        <label htmlFor="dataEntradaInicio" className="text-sm text-slate-300 block mb-1">Data Entrada (Exata):</label>
                        <input
                            type="date" id="dataEntradaInicio" name="dataEntradaInicio"
                            value={filter.dataEntradaInicio || ''} onChange={handleFilterChange}
                            className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white date-input-fix"
                        />
                        <small className="text-slate-400 text-xs">Para buscar por data de entrada exata.</small>
                    </div>
                    <div>
                        <label htmlFor="dataSaidaInicio" className="text-sm text-slate-300 block mb-1">Data Saída (Exata):</label>
                        <input
                            type="date" id="dataSaidaInicio" name="dataSaidaInicio"
                            value={filter.dataSaidaInicio || ''} onChange={handleFilterChange}
                            className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white date-input-fix"
                        />
                        <small className="text-slate-400 text-xs">Para buscar por data de saída exata.</small>
                    </div>
                    <div className="lg:col-start-4"> {/* Botão alinhado à direita no grid maior */}
                        <button type="submit" className="w-full p-2 h-10 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md flex items-center justify-center gap-2 px-4">
                            <MdSearch size={20} /> Aplicar Filtros
                        </button>
                    </div>
                </form>

                {isLoading &&
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="h-12 w-12 animate-spin text-sky-300" />
                        <p className="ml-3 text-sky-300">Carregando pátios...</p>
                    </div>
                }
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

                {!isLoading && !error && patios.length === 0 && (
                    <p className="text-center text-slate-400 py-10 bg-slate-900 rounded-lg shadow-xl">Nenhum pátio encontrado.</p>
                )}
                {!isLoading && patios.length > 0 && (
                    <div className="overflow-x-auto bg-slate-900 rounded-lg shadow">
                        <table className="min-w-full table-auto">
                            <thead className="bg-slate-800 border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider flex items-center gap-1"><Hash size={14}/> ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Nome Pátio</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Data Entrada</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Data Saída</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Observação</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                            {patios.map((patio) => (
                                <tr key={patio.idPatio} className="hover:bg-slate-800/50">
                                    <td className="px-6 py-4 whitespace-nowrap">{patio.idPatio}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{patio.nomePatio}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(patio.dataEntrada)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(patio.dataSaida)}</td>
                                    <td className="px-6 py-4 whitespace-normal max-w-xs truncate" title={patio.observacao || ''}>{patio.observacao || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center space-x-2 flex items-center justify-center">
                                        <Link href={`/patio/alterar/${patio.idPatio}`}>
                                            <button className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-black rounded flex items-center gap-1">
                                                <MdEdit size={14} /> Editar
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(patio.idPatio, patio.nomePatio)}
                                            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded flex items-center gap-1"
                                        >
                                            <MdDelete size={14} /> Deletar
                                        </button>
                                        {/* Futuro: <Link href={`/patio/associacoes/${patio.idPatio}`}><button>Ver Associações</button></Link> */}
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