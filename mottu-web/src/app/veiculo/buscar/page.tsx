// src/app/veiculo/buscar/page.tsx
"use client";

import { useState, FormEvent, ChangeEvent } from 'react'; // Adicionado ChangeEvent
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { MdSearch, MdErrorOutline, MdEdit, MdDelete, MdInfo, MdDirectionsCar, MdClear } from 'react-icons/md'; // MdClear
import { Car, Hash, Search as SearchIcon, Loader2, Building, Settings, Calendar as CalendarIcon } from 'lucide-react'; // Outros ícones
import { VeiculoResponseDto, VeiculoFilter, VeiculoLocalizacaoResponseDto, combustiveis } from '@/types/veiculo'; // Ajuste o path
import { VeiculoService } from '@/services/VeiculoService'; // Ajuste o path

const initialFilterState: VeiculoFilter = {
    placa: '', renavam: '', chassi: '', fabricante: '', modelo: '',
    motor: '', ano: undefined, combustivel: '', clienteCpf: '',
    boxNome: '', patioNome: '', zonaNome: '',
};

export default function BuscarVeiculosPage() {
    const [veiculos, setVeiculos] = useState<VeiculoResponseDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [localizacaoModal, setLocalizacaoModal] = useState<VeiculoLocalizacaoResponseDto | null>(null);
    const [isLoadingLocalizacao, setIsLoadingLocalizacao] = useState(false);
    const [errorLocalizacao, setErrorLocalizacao] = useState<string | null>(null);
    const [filter, setFilter] = useState<VeiculoFilter>(initialFilterState);

    const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilter((prevFilter) => ({
            ...prevFilter,
            [name]: value || undefined, // Enviar undefined se vazio
        }));
    };

    const handleSearch = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        setVeiculos([]);
        setHasSearched(true);

        const activeFilters: Partial<VeiculoFilter> = {};
        for (const key in filter) {
            const typedKey = key as keyof VeiculoFilter;
            if (filter[typedKey] && String(filter[typedKey]).trim() !== '') {
                if (typedKey === 'ano') {
                    activeFilters[typedKey] = Number(filter[typedKey]) || undefined;
                } else {
                    activeFilters[typedKey] = filter[typedKey];
                }
            }
        }
        console.log("Filtros ativos para busca de Veículo:", activeFilters);

        try {
            // VeiculoService.getAll foi ajustado para passar os filtros.
            // O SUCESSO DESTA FILTRAGEM AVANÇADA DEPENDE DO BACKEND C#
            // TER SIDO ATUALIZADO PARA PROCESSAR ESTES FILTROS NO ENDPOINT GET /api/veiculos
            const data = await VeiculoService.getAll(activeFilters);
            setVeiculos(data);
            if (data.length === 0) {
                setError("Nenhum veículo encontrado para os critérios informados.");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Erro ao buscar veículos.');
            console.error("Erro detalhado buscar veículos:", err.response || err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearFilters = () => {
        setFilter(initialFilterState);
        setVeiculos([]);
        setHasSearched(false);
        setError(null);
        setSuccessMessage(null);
    };

    const fetchLocalizacaoVeiculo = async (id: number) => {
        setIsLoadingLocalizacao(true);
        setErrorLocalizacao(null);
        setLocalizacaoModal(null);
        try {
            const data = await VeiculoService.getLocalizacao(id);
            setLocalizacaoModal(data);
        } catch (err: any) {
            setErrorLocalizacao(err.response?.data?.message || err.message || 'Erro ao buscar localização do veículo.');
        } finally {
            setIsLoadingLocalizacao(false);
        }
    };

    const handleDelete = async (id: number, placaVeiculo: string) => {
        if (window.confirm(`Tem certeza que deseja deletar o Veículo "${placaVeiculo}" (ID: ${id})?`)) {
            setError(null);
            try {
                await VeiculoService.delete(id);
                setSuccessMessage(`Veículo "${placaVeiculo}" (ID: ${id}) deletado com sucesso!`);
                handleSearch(new Event('submit') as any); // Refaz a busca atual
                setTimeout(() => setSuccessMessage(null), 5000);
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || 'Erro ao deletar veículo.');
            }
        }
    };


    return (
        <>
            <NavBar active="veiculo-buscar" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <h1 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-6 text-center">
                    <SearchIcon size={30} className="text-sky-400" /> Busca Avançada de Veículos
                </h1>

                <form onSubmit={handleSearch} className="mb-6 p-4 bg-slate-800 rounded-lg shadow-md grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-start">
                    {/* Filtros diretos de Veiculo */}
                    <div>
                        <label htmlFor="placa" className="text-sm text-slate-300 block mb-1">Placa:</label>
                        <input type="text" id="placa" name="placa" value={filter.placa || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="Placa" maxLength={10} />
                    </div>
                    <div>
                        <label htmlFor="renavam" className="text-sm text-slate-300 block mb-1">RENAVAM:</label>
                        <input type="text" id="renavam" name="renavam" value={filter.renavam || ''} onChange={handleFilterChange} maxLength={11} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="RENAVAM" />
                    </div>
                    <div>
                        <label htmlFor="chassi" className="text-sm text-slate-300 block mb-1">Chassi:</label>
                        <input type="text" id="chassi" name="chassi" value={filter.chassi || ''} onChange={handleFilterChange} maxLength={17} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="Chassi" />
                    </div>
                    <div>
                        <label htmlFor="fabricante" className="text-sm text-slate-300 block mb-1">Fabricante:</label>
                        <input type="text" id="fabricante" name="fabricante" value={filter.fabricante || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="Fabricante" />
                    </div>
                    <div>
                        <label htmlFor="modelo" className="text-sm text-slate-300 block mb-1">Modelo:</label>
                        <input type="text" id="modelo" name="modelo" value={filter.modelo || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="Modelo" />
                    </div>
                    <div>
                        <label htmlFor="motor" className="text-sm text-slate-300 block mb-1">Motor:</label>
                        <input type="text" id="motor" name="motor" value={filter.motor || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="Motor" />
                    </div>
                    <div>
                        <label htmlFor="ano" className="text-sm text-slate-300 block mb-1">Ano:</label>
                        <input type="number" id="ano" name="ano" value={filter.ano || ''} onChange={handleFilterChange} min={1900} max={2100} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="Ano" />
                    </div>
                    <div>
                        <label htmlFor="combustivel" className="text-sm text-slate-300 block mb-1">Combustível:</label>
                        <select id="combustivel" name="combustivel" value={filter.combustivel || ''} onChange={handleFilterChange} className="w-full p-2 rounded bg-slate-700 border border-slate-600 text-white h-10">
                            <option value="">Todos</option>
                            {combustiveis.map(cb => (<option key={cb} value={cb}>{cb}</option>))}
                        </select>
                    </div>

                    {/* Filtros de entidades relacionadas */}
                    <h3 className="col-span-full text-lg font-semibold text-sky-400 mt-4 mb-1 border-b border-slate-700 pb-1">Filtrar por Associações (Requer Suporte no Backend):</h3>
                    <div>
                        <label htmlFor="clienteCpf" className="text-sm text-slate-300 block mb-1">CPF Cliente:</label>
                        <input type="text" id="clienteCpf" name="clienteCpf" value={filter.clienteCpf || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="CPF do cliente" />
                    </div>
                    <div>
                        <label htmlFor="boxNome" className="text-sm text-slate-300 block mb-1">Nome Box:</label>
                        <input type="text" id="boxNome" name="boxNome" value={filter.boxNome || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="Box associado" />
                    </div>
                    <div>
                        <label htmlFor="patioNome" className="text-sm text-slate-300 block mb-1">Nome Pátio:</label>
                        <input type="text" id="patioNome" name="patioNome" value={filter.patioNome || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="Pátio associado" />
                    </div>
                    <div>
                        <label htmlFor="zonaNome" className="text-sm text-slate-300 block mb-1">Nome Zona:</label>
                        <input type="text" id="zonaNome" name="zonaNome" value={filter.zonaNome || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="Zona associada" />
                    </div>

                    <div className="col-span-full flex flex-col sm:flex-row justify-center items-center gap-3 pt-4">
                        <button type="submit" className="w-full sm:w-auto p-2 h-10 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md flex items-center justify-center gap-2 px-4">
                            <SearchIcon size={20} /> Buscar Veículos
                        </button>
                        <button type="button" onClick={handleClearFilters} className="w-full sm:w-auto p-2 h-10 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-md flex items-center justify-center gap-2 px-4">
                            <MdClear size={20} /> Limpar Filtros
                        </button>
                    </div>
                </form>

                {isLoading &&
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="h-12 w-12 animate-spin text-sky-300" />
                        <p className="ml-3 text-sky-300">Buscando veículos...</p>
                    </div>
                }
                {successMessage && (
                    <div className="relative max-w-3xl mx-auto mb-6 text-green-400 bg-green-900/50 p-4 pr-10 rounded border border-green-500" role="alert">
                        <MdCheckCircle className="inline mr-2" />{successMessage}
                        <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-green-400 hover:text-green-200" onClick={() => setSuccessMessage(null)} aria-label="Fechar"><span className="text-xl" aria-hidden="true">&times;</span></button>
                    </div>
                )}
                {error && !isLoading && (
                    <div className="relative max-w-3xl mx-auto mb-6 text-red-400 bg-red-900/50 p-4 pr-10 rounded border border-red-500" role="alert">
                        <MdErrorOutline className="inline mr-2" />{error}
                        <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-400 hover:text-red-200" onClick={() => setError(null)} aria-label="Fechar"><span className="text-xl" aria-hidden="true">&times;</span></button>
                    </div>
                )}

                {!isLoading && hasSearched && veiculos.length === 0 && !error && (
                    <p className="text-center text-slate-400 py-10 bg-slate-900 rounded-lg shadow-xl">Nenhum veículo encontrado para os critérios informados.</p>
                )}
                {!isLoading && veiculos.length > 0 && (
                    <div className="overflow-x-auto bg-slate-900 rounded-lg shadow mt-8">
                        <table className="min-w-full table-auto">
                            <thead className="bg-slate-800 border-b border-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider"><Hash size={14} className="inline mr-1"/>ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Placa</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Modelo</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Fabricante</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Ano</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Combustível</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                            {veiculos.map((veiculo) => (
                                <tr key={veiculo.idVeiculo} className="hover:bg-slate-800/50">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">{veiculo.idVeiculo}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">{veiculo.placa}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">{veiculo.modelo}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">{veiculo.fabricante}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">{veiculo.ano}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">{veiculo.combustivel}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center space-x-1 flex items-center justify-center">
                                        <Link href={`/veiculo/alterar/${veiculo.idVeiculo}`}>
                                            <button className="p-2 text-xs bg-yellow-500 hover:bg-yellow-600 text-black rounded flex items-center gap-1"><MdEdit size={14} /> Editar</button>
                                        </Link>
                                        <button onClick={() => handleDelete(veiculo.idVeiculo, veiculo.placa)}
                                                className="p-2 text-xs bg-red-600 hover:bg-red-700 text-white rounded flex items-center gap-1"><MdDelete size={14} /> Deletar</button>
                                        <button onClick={() => fetchLocalizacaoVeiculo(veiculo.idVeiculo)}
                                                className="p-2 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center gap-1"><MdInfo size={14} /> Localização</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="mt-8 text-center">
                    <Link href="/veiculo/listar">
                        <button className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md shadow">
                            Voltar para Lista Simples
                        </button>
                    </Link>
                </div>
                {/* Modal de Localização */}
                {localizacaoModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 z-40 flex items-center justify-center p-4" onClick={() => setLocalizacaoModal(null)}>
                        <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full z-50 border border-sky-500" onClick={e => e.stopPropagation()}>
                            <h3 className="text-xl font-semibold text-sky-400 mb-4">Localização do Veículo</h3>
                            {isLoadingLocalizacao ? (
                                <div className="flex justify-center items-center py-4"><Loader2 className="animate-spin h-8 w-8 text-sky-300"/> <span className="ml-2 text-sky-300">Carregando...</span></div>
                            ) : errorLocalizacao ? (
                                <p className="text-red-400 mb-4">{errorLocalizacao}</p>
                            ) : (
                                <div className="text-slate-300 space-y-1 text-sm">
                                    <p><strong>ID Veículo:</strong> {localizacaoModal.idVeiculo}</p>
                                    <p><strong>Placa:</strong> {localizacaoModal.placa}</p>
                                    <p><strong>Modelo:</strong> {localizacaoModal.modelo} ({localizacaoModal.fabricante})</p>
                                    <hr className="my-2 border-slate-700"/>
                                    <h4 className="font-semibold text-slate-200 mt-2 mb-1">Último Rastreamento:</h4>
                                    {localizacaoModal.ultimoRastreamento ? (
                                        <>
                                            <p>IPS: X={localizacaoModal.ultimoRastreamento.ipsX}, Y={localizacaoModal.ultimoRastreamento.ipsY}, Z={localizacaoModal.ultimoRastreamento.ipsZ}</p>
                                            <p>GPRS: Lat={localizacaoModal.ultimoRastreamento.gprsLatitude}, Lon={localizacaoModal.ultimoRastreamento.gprsLongitude}, Alt={localizacaoModal.ultimoRastreamento.gprsAltitude}</p>
                                        </>
                                    ) : <p>Nenhum dado de rastreamento.</p>}
                                    <hr className="my-2 border-slate-700"/>
                                    <h4 className="font-semibold text-slate-200 mt-2 mb-1">Associações Atuais:</h4>
                                    <p><strong>Pátio:</strong> {localizacaoModal.patioAssociado?.nome || 'N/A'}</p>
                                    <p><strong>Zona:</strong> {localizacaoModal.zonaAssociada?.nome || 'N/A'}</p>
                                    <p><strong>Box:</strong> {localizacaoModal.boxAssociado?.nome || 'N/A'}</p>
                                    <p className="text-xs text-slate-400 mt-3">Data da Consulta: {new Date(localizacaoModal.dataConsulta).toLocaleString('pt-BR')}</p>
                                </div>
                            )}
                            <div className="flex justify-end mt-6">
                                <button onClick={() => setLocalizacaoModal(null)} className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-md">Fechar</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <style jsx global>{`
                input[type="number"]::-webkit-inner-spin-button,
                input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
                input[type="number"] { -moz-appearance: textfield; }
                 .date-input-fix::-webkit-calendar-picker-indicator { filter: invert(0.8); cursor: pointer; }
                input[type="date"]:required:invalid::-webkit-datetime-edit { color: transparent; }
                input[type="date"]:focus::-webkit-datetime-edit { color: white !important; }
                input[type="date"]::-webkit-datetime-edit { color: white; }
            `}</style>
        </>
    );
}