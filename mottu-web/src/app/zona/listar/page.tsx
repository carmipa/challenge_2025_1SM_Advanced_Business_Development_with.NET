// src/app/zona/listar/page.tsx
"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from 'react'; // Adicionado ChangeEvent
import Link from 'next/link';
import { ZonaService } from '@/services/ZonaService'; // Ajuste o path
import NavBar from '@/components/nav-bar';
import { MdList, MdAdd, MdSearch, MdErrorOutline, MdEdit, MdDelete, MdCheckCircle, MdInfo } from 'react-icons/md'; // MdInfo
import { Hash, Stethoscope, Loader2 } from 'lucide-react'; // Usando Stethoscope e Loader2
import { ZonaResponseDto, ZonaFilter } from '@/types/zona'; // Ajuste o path

export default function ListarZonasPage() {
    const [zonas, setZonas] = useState<ZonaResponseDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [filter, setFilter] = useState<ZonaFilter>({
        nome: '',
        dataEntradaInicio: '', // Usado para GetByDate (entrada)
        dataSaidaInicio: '',   // Usado para GetByDate (saida)
        // Outros filtros de ZonaFilter não são usados diretamente aqui para simplificar,
        // pois GetAllZonas no C# não os suporta. A página de busca avançada os usaria.
    });

    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        } catch (e) {
            console.error("Erro ao formatar data (listar zona):", dateString, e);
            return 'Inválida';
        }
    };

    const fetchZonas = async (currentFilter?: ZonaFilter) => {
        setIsLoading(true);
        setError(null);

        const activeFilter = currentFilter || filter;

        try {
            let data: ZonaResponseDto[];
            // Lógica simplificada de filtro para a página de listagem
            if (activeFilter.nome && !activeFilter.dataEntradaInicio && !activeFilter.dataSaidaInicio) {
                data = await ZonaService.searchByName(activeFilter.nome);
            } else if (activeFilter.dataEntradaInicio && !activeFilter.nome && !activeFilter.dataSaidaInicio) {
                data = await ZonaService.getByDate(activeFilter.dataEntradaInicio, 'entrada');
            } else if (activeFilter.dataSaidaInicio && !activeFilter.nome && !activeFilter.dataEntradaInicio) {
                data = await ZonaService.getByDate(activeFilter.dataSaidaInicio, 'saida');
            } else {
                data = await ZonaService.getAll(); // Busca todos se filtros não específicos
            }
            setZonas(data);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Erro ao carregar zonas.');
            console.error("Erro detalhado fetchZonas (listar):", err.response || err);
            setZonas([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterSubmit = (e: FormEvent) => {
        e.preventDefault();
        fetchZonas(filter);
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.get('deleted') === 'true') {
            setSuccessMessage("Zona excluída com sucesso!");
            window.history.replaceState({}, document.title, window.location.pathname);
            setTimeout(() => setSuccessMessage(null), 5000);
        }
        fetchZonas(); // Carga inicial
    }, []);

    const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilter((prevFilter) => ({
            ...prevFilter,
            [name]: value,
        }));
    };

    const handleDelete = async (id: number, nomeZona: string) => {
        if (window.confirm(`Tem certeza que deseja deletar a Zona "${nomeZona}" (ID: ${id})?`)) {
            setError(null);
            try {
                await ZonaService.delete(id);
                setSuccessMessage(`Zona "${nomeZona}" (ID: ${id}) deletada com sucesso!`);
                fetchZonas(filter); // Recarrega
                setTimeout(() => setSuccessMessage(null), 5000);
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || 'Erro ao deletar zona.');
                console.error("Erro detalhado handleDelete (listar zona):", err.response || err);
            }
        }
    };

    return (
        <>
            <NavBar active="zona-listar" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-center sm:text-left">
                        <Stethoscope className="text-3xl text-sky-400" /> Lista de Zonas
                    </h1>
                    <div className="flex gap-2">
                        <Link href="/zona/buscar"
                              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-md shadow whitespace-nowrap">
                            <MdSearch size={18} /> Busca Avançada
                        </Link>
                        <Link href="/zona/cadastrar">
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow whitespace-nowrap">
                                <MdAdd size={18} /> Nova Zona
                            </button>
                        </Link>
                    </div>
                </div>

                <form onSubmit={handleFilterSubmit} className="mb-6 p-4 bg-slate-800 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label htmlFor="nome" className="text-sm text-slate-300 block mb-1">Nome Zona:</label>
                        <input
                            type="text" id="nome" name="nome"
                            value={filter.nome || ''} onChange={handleFilterChange}
                            className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white"
                            placeholder="Nome da zona"
                        />
                    </div>
                    <div>
                        <label htmlFor="dataEntradaInicio" className="text-sm text-slate-300 block mb-1">Data Entrada (Exata):</label>
                        <input
                            type="date" id="dataEntradaInicio" name="dataEntradaInicio"
                            value={filter.dataEntradaInicio || ''} onChange={handleFilterChange}
                            className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white date-input-fix"
                        />
                        <small className="text-slate-400 text-xs">P/ buscar por data de entrada.</small>
                    </div>
                    <div>
                        <label htmlFor="dataSaidaInicio" className="text-sm text-slate-300 block mb-1">Data Saída (Exata):</label>
                        <input
                            type="date" id="dataSaidaInicio" name="dataSaidaInicio"
                            value={filter.dataSaidaInicio || ''} onChange={handleFilterChange}
                            className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white date-input-fix"
                        />
                        <small className="text-slate-400 text-xs">P/ buscar por data de saída.</small>
                    </div>
                    <div className="lg:col-start-4">
                        <button type="submit" className="w-full p-2 h-10 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md flex items-center justify-center gap-2 px-4">
                            <MdSearch size={20} /> Aplicar Filtros
                        </button>
                    </div>
                </form>

                {isLoading &&
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="h-12 w-12 animate-spin text-sky-300" />
                        <p className="ml-3 text-sky-300">Carregando zonas...</p>
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

                {!isLoading && !error && zonas.length === 0 && (
                    <p className="text-center text-slate-400 py-10 bg-slate-900 rounded-lg shadow-xl">Nenhuma zona encontrada.</p>
                )}
                {!isLoading && zonas.length > 0 && (
                    <div className="overflow-x-auto bg-slate-900 rounded-lg shadow">
                        <table className="min-w-full table-auto">
                            <thead className="bg-slate-800 border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider flex items-center gap-1"><Hash size={14}/> ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Data Entrada</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Data Saída</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Observação</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                            {zonas.map((zona) => (
                                <tr key={zona.idZona} className="hover:bg-slate-800/50">
                                    <td className="px-6 py-4 whitespace-nowrap">{zona.idZona}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{zona.nome}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(zona.dataEntrada)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(zona.dataSaida)}</td>
                                    <td className="px-6 py-4 whitespace-normal max-w-xs truncate" title={zona.observacao || ''}>{zona.observacao || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center space-x-2 flex items-center justify-center">
                                        <Link href={`/zona/alterar/${zona.idZona}`}>
                                            <button className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-black rounded flex items-center gap-1">
                                                <MdEdit size={14} /> Editar
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(zona.idZona, zona.nome)}
                                            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded flex items-center gap-1"
                                        >
                                            <MdDelete size={14} /> Deletar
                                        </button>
                                        {/* <Link href={`/zona/associacoes/${zona.idZona}`}>
                                            <button className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center gap-1">
                                                <MdInfo size={14} /> Associações
                                            </button>
                                        </Link> */}
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