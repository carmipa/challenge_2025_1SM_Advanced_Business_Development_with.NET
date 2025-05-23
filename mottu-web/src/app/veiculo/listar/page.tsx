// src/app/veiculo/listar/page.tsx
"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from 'react'; // Adicionado ChangeEvent
import Link from 'next/link';
import { VeiculoService } from '@/services/VeiculoService'; // Ajuste o path
import NavBar from '@/components/nav-bar';
import {
    MdList, MdAdd, MdSearch, MdErrorOutline, MdEdit, MdDelete,
    MdCheckCircle, MdDirectionsCar, MdInfo // Adicionado MdInfo
} from 'react-icons/md';
import { Hash, Car, Loader2 } from 'lucide-react'; // Adicionado Loader2
import { VeiculoResponseDto, VeiculoFilter, VeiculoLocalizacaoResponseDto } from '@/types/veiculo'; // Ajuste o path

export default function ListarVeiculosPage() {
    const [veiculos, setVeiculos] = useState<VeiculoResponseDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [localizacaoModal, setLocalizacaoModal] = useState<VeiculoLocalizacaoResponseDto | null>(null);
    const [isLoadingLocalizacao, setIsLoadingLocalizacao] = useState(false);
    const [errorLocalizacao, setErrorLocalizacao] = useState<string | null>(null);

    const [filter, setFilter] = useState<VeiculoFilter>({
        placa: '',
        modelo: '',
        fabricante: '',
        ano: undefined, // Para permitir limpar o campo
        // Outros filtros simples podem ser adicionados aqui se desejado
    });

    const fetchVeiculos = async (currentFilter?: VeiculoFilter) => {
        setIsLoading(true);
        setError(null);
        const activeFilter = currentFilter || filter;
        const simpleFiltersForList: VeiculoFilter = { // Filtros que esta página efetivamente usará
            placa: activeFilter.placa,
            modelo: activeFilter.modelo,
            fabricante: activeFilter.fabricante,
            ano: activeFilter.ano ? Number(activeFilter.ano) : undefined,
        };

        try {
            let data: VeiculoResponseDto[];
            // Lógica de chamada baseada nos filtros ativos
            // O C# VeiculosController tem GetByPlaca e SearchByModelo.
            // Outros filtros (fabricante, ano) precisariam de endpoints específicos ou um GetAll aprimorado.
            if (simpleFiltersForList.placa && !simpleFiltersForList.modelo && !simpleFiltersForList.fabricante && !simpleFiltersForList.ano) {
                const veiculo = await VeiculoService.getByPlaca(simpleFiltersForList.placa);
                data = veiculo ? [veiculo] : [];
            } else if (simpleFiltersForList.modelo && !simpleFiltersForList.placa && !simpleFiltersForList.fabricante && !simpleFiltersForList.ano) {
                data = await VeiculoService.searchByModelo(simpleFiltersForList.modelo);
            }
                // Se múltiplos filtros simples ou filtros não cobertos por endpoints específicos, buscar todos
            // ou, se o backend for aprimorado, passar todos os simpleFiltersForList.
            else {
                // VeiculoService.getAll passará os filtros, mas C# GetAllVeiculos não os usa.
                data = await VeiculoService.getAll(simpleFiltersForList);
            }
            setVeiculos(data);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Erro ao carregar veículos.');
            console.error("Erro detalhado fetchVeiculos (listar):", err.response || err);
            setVeiculos([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterSubmit = (e: FormEvent) => {
        e.preventDefault();
        fetchVeiculos(filter);
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.get('deleted') === 'true') {
            setSuccessMessage("Veículo excluído com sucesso!");
            window.history.replaceState({}, document.title, window.location.pathname);
            setTimeout(() => setSuccessMessage(null), 5000);
        }
        fetchVeiculos(); // Carga inicial
    }, []);

    const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilter((prevFilter) => ({
            ...prevFilter,
            [name]: value,
        }));
    };

    const handleDelete = async (id: number, placaVeiculo: string) => {
        if (window.confirm(`Tem certeza que deseja deletar o Veículo "${placaVeiculo}" (ID: ${id})?`)) {
            setError(null);
            try {
                await VeiculoService.delete(id);
                setSuccessMessage(`Veículo "${placaVeiculo}" (ID: ${id}) deletado com sucesso!`);
                fetchVeiculos(filter); // Recarrega a lista
                setTimeout(() => setSuccessMessage(null), 5000);
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || 'Erro ao deletar veículo.');
                console.error("Erro detalhado handleDelete (listar veiculo):", err.response || err);
            }
        }
    };

    const fetchLocalizacaoVeiculo = async (id: number) => {
        setIsLoadingLocalizacao(true);
        setErrorLocalizacao(null);
        setLocalizacaoModal(null);
        try {
            // Este endpoint /localizacao precisa ser implementado no backend C#
            const data = await VeiculoService.getLocalizacao(id);
            setLocalizacaoModal(data);
        } catch (err: any) {
            setErrorLocalizacao(err.response?.data?.message || err.message || 'Erro ao buscar localização do veículo.');
            console.error("Erro detalhado na localização (listar veiculo):", err.response || err);
        } finally {
            setIsLoadingLocalizacao(false);
        }
    };


    return (
        <>
            <NavBar active="veiculo-listar" />
            <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-center sm:text-left">
                        <MdDirectionsCar className="text-3xl text-sky-400" /> Lista de Veículos
                    </h1>
                    <div className="flex gap-2">
                        <Link href="/veiculo/buscar"
                              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-md shadow whitespace-nowrap">
                            <MdSearch size={18} /> Busca Avançada
                        </Link>
                        <Link href="/veiculo/cadastrar">
                            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow whitespace-nowrap">
                                <MdAdd size={18} /> Novo Veículo
                            </button>
                        </Link>
                    </div>
                </div>

                <form onSubmit={handleFilterSubmit} className="mb-6 p-4 bg-slate-800 rounded-lg shadow-md grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
                    <div>
                        <label htmlFor="placa" className="text-sm text-slate-300 block mb-1">Placa:</label>
                        <input type="text" id="placa" name="placa" value={filter.placa || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="Placa" />
                    </div>
                    <div>
                        <label htmlFor="modelo" className="text-sm text-slate-300 block mb-1">Modelo:</label>
                        <input type="text" id="modelo" name="modelo" value={filter.modelo || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="Modelo" />
                    </div>
                    <div>
                        <label htmlFor="fabricante" className="text-sm text-slate-300 block mb-1">Fabricante:</label>
                        <input type="text" id="fabricante" name="fabricante" value={filter.fabricante || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="Fabricante" />
                    </div>
                    <div>
                        <label htmlFor="ano" className="text-sm text-slate-300 block mb-1">Ano:</label>
                        <input type="number" id="ano" name="ano" value={filter.ano || ''} onChange={handleFilterChange} min={1900} max={2100} className="w-full p-2 h-10 rounded bg-slate-700 border border-slate-600 text-white" placeholder="Ano" />
                    </div>
                    <div className="lg:col-start-5">
                        <button type="submit" className="w-full p-2 h-10 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md flex items-center justify-center gap-2 px-4">
                            <MdSearch size={20} /> Aplicar Filtros
                        </button>
                    </div>
                </form>

                {isLoading &&
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="h-12 w-12 animate-spin text-sky-300" />
                        <p className="ml-3 text-sky-300">Carregando veículos...</p>
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

                {!isLoading && !error && veiculos.length === 0 && (
                    <p className="text-center text-slate-400 py-10 bg-slate-900 rounded-lg shadow-xl">Nenhum veículo encontrado.</p>
                )}
                {!isLoading && veiculos.length > 0 && (
                    <div className="overflow-x-auto bg-slate-900 rounded-lg shadow">
                        <table className="min-w-full table-auto">
                            <thead className="bg-slate-800 border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider flex items-center gap-1"><Hash size={14}/> ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Placa</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Modelo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Fabricante</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Ano</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Combustível</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">Ações</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                            {veiculos.map((veiculo) => (
                                <tr key={veiculo.idVeiculo} className="hover:bg-slate-800/50">
                                    <td className="px-6 py-4 whitespace-nowrap">{veiculo.idVeiculo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{veiculo.placa}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{veiculo.modelo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{veiculo.fabricante}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{veiculo.ano}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{veiculo.combustivel}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center space-x-1 flex items-center justify-center">
                                        <Link href={`/veiculo/alterar/${veiculo.idVeiculo}`}>
                                            <button className="px-2 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-black rounded flex items-center gap-1">
                                                <MdEdit size={14} /> Editar
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(veiculo.idVeiculo, veiculo.placa)}
                                            className="px-2 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded flex items-center gap-1"
                                        >
                                            <MdDelete size={14} /> Deletar
                                        </button>
                                        <button
                                            onClick={() => fetchLocalizacaoVeiculo(veiculo.idVeiculo)}
                                            className="px-2 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center gap-1"
                                        >
                                            <MdInfo size={14} /> Localização
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
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
            {/* Estilos globais para input number podem ser necessários se não foram definidos globalmente antes */}
            <style jsx global>{`
                input[type="number"]::-webkit-inner-spin-button,
                input[type="number"]::-webkit-outer-spin-button {
                    -webkit-appearance: none; margin: 0;
                }
                input[type="number"] { -moz-appearance: textfield; }
            `}</style>
        </>
    );
}