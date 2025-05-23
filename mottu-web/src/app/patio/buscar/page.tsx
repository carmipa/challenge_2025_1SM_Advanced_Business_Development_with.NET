// src/app/patio/buscar/page.tsx
"use client";

import { useState, FormEvent, ChangeEvent } from 'react'; // Adicionado ChangeEvent
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { MdSearch, MdErrorOutline, MdEdit, MdDelete, MdInfo, MdLocationOn, MdClear } from 'react-icons/md'; // Adicionado MdClear
import { Hash, Search as SearchIcon, Loader2 } from 'lucide-react'; // Adicionado Loader2
import { PatioResponseDto, PatioFilter } from '@/types/patio'; // Ajuste o path
import { PatioService } from '@/services/PatioService'; // Ajuste o path

const initialFilterState: PatioFilter = {
    nomePatio: '', dataEntradaInicio: '', dataEntradaFim: '',
    dataSaidaInicio: '', dataSaidaFim: '', observacao: '',
    veiculoPlaca: '', enderecoCidade: '', contatoEmail: '',
    zonaNome: '', boxNome: '',
};

export default function BuscarPatiosPage() {
    const [patios, setPatios] = useState<PatioResponseDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null); // Para msg de delete
    const [hasSearched, setHasSearched] = useState(false);
    const [filter, setFilter] = useState<PatioFilter>(initialFilterState);

    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        } catch (e) {
            return 'Inválida';
        }
    };

    const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { // Removido SelectElement
        const { name, value } = e.target;
        setFilter((prevFilter) => ({
            ...prevFilter,
            [name]: value || undefined, // Enviar undefined se vazio para não poluir query
        }));
    };

    const handleSearch = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        setPatios([]);
        setHasSearched(true);

        // Prepara filtros: remove campos vazios para não enviar na query
        const activeFilters: Partial<PatioFilter> = {};
        for (const key in filter) {
            if (filter[key as keyof PatioFilter] && String(filter[key as keyof PatioFilter]).trim() !== '') {
                activeFilters[key as keyof PatioFilter] = filter[key as keyof PatioFilter];
            }
        }

        console.log("Filtros ativos para busca de Pátio:", activeFilters);


        try {
            // PatioService.getAll foi ajustado para passar os filtros para o backend.
            // O SUCESSO DESTA FILTRAGEM AVANÇADA DEPENDE DO BACKEND C#
            // TER SIDO ATUALIZADO PARA PROCESSAR ESTES FILTROS NO ENDPOINT GET /api/patios
            const data = await PatioService.getAll(activeFilters);
            setPatios(data);
            if (data.length === 0) {
                setError("Nenhum pátio encontrado para os critérios informados.");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Erro ao buscar pátios.');
            console.error("Erro detalhado buscar pátios:", err.response || err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearFilters = () => {
        setFilter(initialFilterState);
        setPatios([]);
        setHasSearched(false);
        setError(null);
        setSuccessMessage(null);
    };

    const handleDelete = async (id: number, nomePatio: string) => {
        if (window.confirm(`Tem certeza que deseja deletar o Pátio "${nomePatio}" (ID: ${id})?`)) {
            // setIsLoading(true); handleSearch já faz isso
            setError(null);
            try {
                await PatioService.delete(id);
                setSuccessMessage(`Pátio "${nomePatio}" (ID: ${id}) deletado com sucesso!`);
                // Refaz a busca com os filtros atuais para atualizar a lista
                handleSearch(new Event('submit') as any); // Simula um evento de submit
                setTimeout(() => setSuccessMessage(null), 5000);
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || 'Erro ao deletar pátio.');
            }
            // setIsLoading(false);
        }
    };

    return (
        <>
            <NavBar active="patio-buscar" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <h1 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-6 text-center">
                    <SearchIcon size={30} className="text-sky-400" /> Busca Avançada de Pátios
                </h1>

                <form onSubmit={handleSearch} className="mb-6 p-4 bg-slate-800 rounded-lg shadow-md grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-start">
                    {/* Filtros diretos de Pátio */}
                    <div>
                        <label htmlFor="nomePatio" className="text-sm text-slate-300 block mb-1">Nome Pátio:</label>
                        <input type="text" id="nomePatio" name="nomePatio" value={filter.nomePatio || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="Nome do pátio" />
                    </div>
                    <div>
                        <label htmlFor="dataEntradaInicio" className="text-sm text-slate-300 block mb-1">Entrada (De):</label>
                        <input type="date" id="dataEntradaInicio" name="dataEntradaInicio" value={filter.dataEntradaInicio || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white date-input-fix" />
                    </div>
                    <div>
                        <label htmlFor="dataEntradaFim" className="text-sm text-slate-300 block mb-1">Entrada (Até):</label>
                        <input type="date" id="dataEntradaFim" name="dataEntradaFim" value={filter.dataEntradaFim || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white date-input-fix" />
                    </div>
                    <div>
                        <label htmlFor="dataSaidaInicio" className="text-sm text-slate-300 block mb-1">Saída (De):</label>
                        <input type="date" id="dataSaidaInicio" name="dataSaidaInicio" value={filter.dataSaidaInicio || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white date-input-fix" />
                    </div>
                    <div>
                        <label htmlFor="dataSaidaFim" className="text-sm text-slate-300 block mb-1">Saída (Até):</label>
                        <input type="date" id="dataSaidaFim" name="dataSaidaFim" value={filter.dataSaidaFim || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white date-input-fix" />
                    </div>
                    <div>
                        <label htmlFor="observacao" className="text-sm text-slate-300 block mb-1">Observação Pátio:</label>
                        <input type="text" id="observacao" name="observacao" value={filter.observacao || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="Observação no pátio" />
                    </div>

                    {/* Filtros de entidades relacionadas */}
                    {/* Estes dependem FORTEMENTE do backend suportá-los */}
                    <h3 className="col-span-full text-lg font-semibold text-sky-400 mt-4 mb-1 border-b border-slate-700 pb-1">Filtrar por Associações:</h3>
                    <div>
                        <label htmlFor="veiculoPlaca" className="text-sm text-slate-300 block mb-1">Placa Veículo:</label>
                        <input type="text" id="veiculoPlaca" name="veiculoPlaca" value={filter.veiculoPlaca || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="Veículo no pátio" />
                    </div>
                    <div>
                        <label htmlFor="enderecoCidade" className="text-sm text-slate-300 block mb-1">Cidade Endereço:</label>
                        <input type="text" id="enderecoCidade" name="enderecoCidade" value={filter.enderecoCidade || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="Cidade do pátio" />
                    </div>
                    <div>
                        <label htmlFor="contatoEmail" className="text-sm text-slate-300 block mb-1">Email Contato:</label>
                        <input type="email" id="contatoEmail" name="contatoEmail" value={filter.contatoEmail || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="Email do contato do pátio" />
                    </div>
                    <div>
                        <label htmlFor="zonaNome" className="text-sm text-slate-300 block mb-1">Nome Zona:</label>
                        <input type="text" id="zonaNome" name="zonaNome" value={filter.zonaNome || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="Zona dentro do pátio" />
                    </div>
                    <div>
                        <label htmlFor="boxNome" className="text-sm text-slate-300 block mb-1">Nome Box:</label>
                        <input type="text" id="boxNome" name="boxNome" value={filter.boxNome || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="Box dentro do pátio" />
                    </div>

                    <div className="col-span-full flex flex-col sm:flex-row justify-center items-center gap-3 pt-4">
                        <button type="submit" className="w-full sm:w-auto p-2 h-10 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md flex items-center justify-center gap-2 px-4">
                            <SearchIcon size={20} /> Buscar Pátios
                        </button>
                        <button type="button" onClick={handleClearFilters} className="w-full sm:w-auto p-2 h-10 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-md flex items-center justify-center gap-2 px-4">
                            <MdClear size={20} /> Limpar Filtros
                        </button>
                    </div>
                </form>

                {isLoading &&
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="h-12 w-12 animate-spin text-sky-300" />
                        <p className="ml-3 text-sky-300">Buscando pátios...</p>
                    </div>
                }
                {successMessage && (
                    <div className="relative max-w-3xl mx-auto mb-6 text-green-400 bg-green-900/50 p-4 pr-10 rounded border border-green-500" role="alert">
                        <MdCheckCircle className="inline mr-2" />{successMessage}
                        <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-green-400 hover:text-green-200" onClick={() => setSuccessMessage(null)} aria-label="Fechar"><span className="text-xl" aria-hidden="true">&times;</span></button>
                    </div>
                )}
                {error && !isLoading && ( // Mostrar erro apenas se não estiver carregando e houver erro
                    <div className="relative max-w-3xl mx-auto mb-6 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert">
                        <MdErrorOutline className="inline mr-2" />{error}
                        <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar"><span className="text-xl" aria-hidden="true">&times;</span></button>
                    </div>
                )}


                {!isLoading && hasSearched && patios.length === 0 && !error && (
                    <p className="text-center text-slate-400 py-10 bg-slate-900 rounded-lg shadow-xl">Nenhum pátio encontrado para os critérios informados.</p>
                )}
                {!isLoading && patios.length > 0 && (
                    <div className="overflow-x-auto bg-slate-900 rounded-lg shadow mt-8">
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
                                        {/* <Link href={`/patio/associacoes/${patio.idPatio}`}>
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
                <div className="mt-8 text-center">
                    <Link href="/patio/listar">
                        <button className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md shadow">
                            Voltar para Lista Simples
                        </button>
                    </Link>
                </div>
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