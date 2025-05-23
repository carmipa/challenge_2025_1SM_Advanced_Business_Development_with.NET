// src/app/clientes/buscar/page.tsx
"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import {
    MdSearch, MdErrorOutline, MdEdit, MdDelete, MdFilterList, MdInfo, MdCalendarToday, MdChevronLeft, MdChevronRight, MdVisibility, MdClear, MdCheckCircle, MdAdd, MdBadge, MdPhoneAndroid, MdEmail as MdEmailIcon
} from 'react-icons/md';
import { UserCircle, Search as SearchIconLucide, User, Mail, MapPin, Briefcase, Loader2 } from 'lucide-react';
import { IMaskInput } from 'react-imask';
import { ClienteResponseDto, ClienteFilter, EstadoCivilType, SexoType } from '@/types/cliente'; // Ajuste o path
import { SpringPage } from '@/types/common'; // Ajuste o path
import { ClienteService } from '@/services/ClienteService'; // Ajuste o path

const initialFilterState: ClienteFilter = {
    nome: undefined, sobrenome: undefined, cpf: undefined, sexo: undefined, profissao: undefined,
    estadoCivil: undefined, dataCadastroInicio: undefined, dataCadastroFim: undefined,
    dataNascimentoInicio: undefined, dataNascimentoFim: undefined, enderecoCidade: undefined,
    enderecoEstado: undefined, contatoEmail: undefined, contatoCelular: undefined,
};
const initialPageInfo: SpringPage<ClienteResponseDto> | null = null;

const cleanMaskedValue = (value: string | undefined): string | undefined => {
    return value ? value.replace(/\D/g, '') : undefined;
};

export default function BuscarClientesPage() {
    const [clientes, setClientes] = useState<ClienteResponseDto[]>([]);
    const [pageInfo, setPageInfo] = useState<SpringPage<ClienteResponseDto> | null>(initialPageInfo);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null); // Para mensagens de delete
    const [hasSearched, setHasSearched] = useState(false);
    const [filter, setFilter] = useState<ClienteFilter>(initialFilterState);

    const ITEMS_PER_PAGE = 9;
    const SORT_ORDER = 'idCliente,asc';

    const fetchData = async (pageToFetch = 0, currentFilters = filter) => {
        setIsLoading(true);
        setError(null);
        setHasSearched(true);

        if (pageToFetch === 0) {
            setClientes([]);
            setPageInfo(null);
        }

        const filtersToSubmit: ClienteFilter = {
            ...currentFilters,
            cpf: cleanMaskedValue(currentFilters.cpf),
            contatoCelular: cleanMaskedValue(currentFilters.contatoCelular),
        };


        try {
            // Esta chamada assume que o backend /api/clientes (GET) foi atualizado
            // para aceitar todos os campos de ClienteFilter e retornar dados paginados.
            const data = await ClienteService.listarPaginadoFiltrado(filtersToSubmit, pageToFetch, ITEMS_PER_PAGE, SORT_ORDER);
            setClientes(data.content);
            setPageInfo(data);
            setCurrentPage(data.number);
            if (data.content.length === 0) {
                setError("Nenhum cliente encontrado para os critérios informados.");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Erro ao buscar clientes.');
            console.error("Erro detalhado buscar clientes:", err.response || err);
            setClientes([]);
            setPageInfo(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilter((prevFilter) => ({
            ...prevFilter,
            [name]: value === "" ? undefined : value,
        }));
    };

    const handleMaskedFilterChange = (name: keyof ClienteFilter, value: string) => {
        setFilter(prev => ({ ...prev, [name]: value === "" ? undefined : value }));
    };


    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchData(0, filter);
    };

    const handleClearFiltersAndSearch = () => {
        setFilter(initialFilterState);
        setClientes([]);
        setPageInfo(null);
        setCurrentPage(0);
        setHasSearched(false);
        setError(null);
        setSuccessMessage(null);
    };

    const handlePageChange = (newPage: number) => {
        fetchData(newPage, filter);
    };

    const handleDeleteCliente = async (clienteId: number, nomeCliente: string) => {
        if (window.confirm(`Tem certeza que deseja excluir o cliente "${nomeCliente}" (ID: ${clienteId})?`)) {
            setIsLoading(true); // Pode ser útil ter um loading específico para delete
            try {
                await ClienteService.delete(clienteId);
                setSuccessMessage(`Cliente "${nomeCliente}" excluído com sucesso!`);
                const pageToFetchAfterDelete = (pageInfo?.first && clientes.length === 1 && currentPage > 0) ? currentPage - 1 : currentPage;
                fetchData(pageToFetchAfterDelete, filter);
                setTimeout(() => setSuccessMessage(null), 4000);
            } catch (err: any) {
                setError(err.response?.data?.message || `Erro ao excluir cliente "${nomeCliente}".`);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const cpfMask = "000.000.000-00";
    const celularMask = "(00) 00000-0000";


    return (
        <>
            <NavBar active="clientes-buscar" />
            <main className="min-h-screen bg-black text-white p-4 md:p-8">
                <div className="container mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                    <h1 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-6 text-center text-white">
                        <SearchIconLucide size={30} className="text-slate-100" /> Busca Avançada de Clientes
                    </h1>

                    <form onSubmit={handleSearch} className="mb-8 p-4 bg-black/20 rounded-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
                            {/* Linha 1 */}
                            <div>
                                <label htmlFor="nome" className="text-sm text-slate-100 block mb-1">Nome:</label>
                                <input type="text" id="nome" name="nome" value={filter.nome || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-white text-slate-900 border border-gray-300 focus:border-[var(--color-mottu-default)] focus:ring-2 focus:ring-[var(--color-mottu-light)]/40 placeholder:text-gray-400" placeholder="Nome" />
                            </div>
                            <div>
                                <label htmlFor="sobrenome" className="text-sm text-slate-100 block mb-1">Sobrenome:</label>
                                <input type="text" id="sobrenome" name="sobrenome" value={filter.sobrenome || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-white text-slate-900 border border-gray-300 focus:border-[var(--color-mottu-default)] focus:ring-2 focus:ring-[var(--color-mottu-light)]/40 placeholder:text-gray-400" placeholder="Sobrenome" />
                            </div>
                            <div>
                                <label htmlFor="cpf" className="text-sm text-slate-100 block mb-1">CPF:</label>
                                <IMaskInput
                                    mask={cpfMask} id="cpf" name="cpf" value={filter.cpf || ''}
                                    onAccept={(value) => handleMaskedFilterChange('cpf', value)}
                                    className="w-full p-2 h-10 rounded bg-white text-slate-900 border border-gray-300 focus:border-[var(--color-mottu-default)] focus:ring-2 focus:ring-[var(--color-mottu-light)]/40 placeholder:text-gray-400"
                                    placeholder="000.000.000-00"
                                />
                            </div>
                            <div>
                                <label htmlFor="contatoEmail" className="text-sm text-slate-100 block mb-1">Email:</label>
                                <input type="email" id="contatoEmail" name="contatoEmail" value={filter.contatoEmail || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-white text-slate-900 border border-gray-300 focus:border-[var(--color-mottu-default)] focus:ring-2 focus:ring-[var(--color-mottu-light)]/40 placeholder:text-gray-400" placeholder="Email do contato" />
                            </div>

                            {/* Linha 2 */}
                            <div>
                                <label htmlFor="sexo" className="text-sm text-slate-100 block mb-1">Sexo:</label>
                                <select id="sexo" name="sexo" value={filter.sexo || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-white text-slate-900 border border-gray-300 focus:border-[var(--color-mottu-default)] focus:ring-2 focus:ring-[var(--color-mottu-light)]/40">
                                    <option value="">Todos</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Feminino</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="profissao" className="text-sm text-slate-100 block mb-1">Profissão:</label>
                                <input type="text" id="profissao" name="profissao" value={filter.profissao || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-white text-slate-900 border border-gray-300 focus:border-[var(--color-mottu-default)] focus:ring-2 focus:ring-[var(--color-mottu-light)]/40 placeholder:text-gray-400" placeholder="Profissão" />
                            </div>
                            <div>
                                <label htmlFor="estadoCivil" className="text-sm text-slate-100 block mb-1">Estado Civil:</label>
                                <select id="estadoCivil" name="estadoCivil" value={filter.estadoCivil || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-white text-slate-900 border border-gray-300 focus:border-[var(--color-mottu-default)] focus:ring-2 focus:ring-[var(--color-mottu-light)]/40">
                                    <option value="">Todos</option>
                                    <option value="Solteiro">Solteiro</option>
                                    <option value="Casado">Casado</option>
                                    <option value="Divorciado">Divorciado</option>
                                    <option value="Viúvo">Viúvo</option>
                                    <option value="Separado">Separado</option>
                                    <option value="União Estável">União Estável</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="contatoCelular" className="text-sm text-slate-100 block mb-1">Celular:</label>
                                <IMaskInput
                                    mask={celularMask} id="contatoCelular" name="contatoCelular" value={filter.contatoCelular || ''}
                                    onAccept={(value) => handleMaskedFilterChange('contatoCelular', value)}
                                    className="w-full p-2 h-10 rounded bg-white text-slate-900 border border-gray-300 focus:border-[var(--color-mottu-default)] focus:ring-2 focus:ring-[var(--color-mottu-light)]/40 placeholder:text-gray-400"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>

                            {/* Linha 3 - Datas e Endereço */}
                            <div>
                                <label htmlFor="dataNascimentoInicio" className="text-sm text-slate-100 block mb-1">Nasc. (Início):</label>
                                <input type="date" id="dataNascimentoInicio" name="dataNascimentoInicio" value={filter.dataNascimentoInicio || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-white text-slate-900 border border-gray-300 focus:border-[var(--color-mottu-default)] focus:ring-2 focus:ring-[var(--color-mottu-light)]/40 date-input-fix" />
                            </div>
                            <div>
                                <label htmlFor="dataNascimentoFim" className="text-sm text-slate-100 block mb-1">Nasc. (Fim):</label>
                                <input type="date" id="dataNascimentoFim" name="dataNascimentoFim" value={filter.dataNascimentoFim || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-white text-slate-900 border border-gray-300 focus:border-[var(--color-mottu-default)] focus:ring-2 focus:ring-[var(--color-mottu-light)]/40 date-input-fix" />
                            </div>
                            <div>
                                <label htmlFor="enderecoCidade" className="text-sm text-slate-100 block mb-1">Cidade (End.):</label>
                                <input type="text" id="enderecoCidade" name="enderecoCidade" value={filter.enderecoCidade || ''} onChange={handleFilterChange} className="w-full p-2 h-10 rounded bg-white text-slate-900 border border-gray-300 focus:border-[var(--color-mottu-default)] focus:ring-2 focus:ring-[var(--color-mottu-light)]/40 placeholder:text-gray-400" placeholder="Cidade do endereço" />
                            </div>
                            <div>
                                <label htmlFor="enderecoEstado" className="text-sm text-slate-100 block mb-1">Estado (End.):</label>
                                <input type="text" id="enderecoEstado" name="enderecoEstado" value={filter.enderecoEstado || ''} onChange={handleFilterChange} maxLength={2} className="w-full p-2 h-10 rounded bg-white text-slate-900 border border-gray-300 focus:border-[var(--color-mottu-default)] focus:ring-2 focus:ring-[var(--color-mottu-light)]/40 placeholder:text-gray-400" placeholder="UF (ex: SP)" />
                            </div>


                            {/* Botões */}
                            <div className="lg:col-span-4 md:col-span-3 sm:col-span-2 col-span-1 flex flex-col sm:flex-row justify-center items-center gap-3 pt-4">
                                <button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md shadow hover:bg-opacity-80 transition-colors duration-200 h-10">
                                    <MdSearch size={20} /> Buscar Clientes
                                </button>
                                <button type="button" onClick={handleClearFiltersAndSearch} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 font-medium text-slate-700 bg-gray-200 rounded-md shadow hover:bg-gray-300 transition-colors duration-200 h-10">
                                    <MdClear size={20} /> Limpar Filtros
                                </button>
                            </div>
                        </div>
                    </form>

                    {successMessage && (
                        <div className="mb-4 flex items-center gap-2 text-sm text-green-700 p-3 rounded-md bg-green-100 border border-green-300">
                            <MdCheckCircle className="text-xl" /> <span>{successMessage}</span>
                        </div>
                    )}
                    {error && !isLoading && (
                        <div className="mb-4 flex items-center gap-2 text-sm text-red-700 p-3 rounded-md bg-red-100 border border-red-300" role="alert">
                            <MdErrorOutline className="text-xl" /> <span>{error}</span>
                        </div>
                    )}

                    {isLoading &&
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="h-12 w-12 animate-spin text-slate-100" />
                            <p className="ml-3 text-slate-100">Buscando clientes...</p>
                        </div>
                    }

                    {!isLoading && hasSearched && clientes.length === 0 && !error && (
                        <div className="text-center py-10">
                            <MdErrorOutline size={48} className="mx-auto text-slate-300 mb-2" />
                            <p className="text-slate-300">Nenhum cliente encontrado para os critérios informados.</p>
                        </div>
                    )}

                    {!isLoading && clientes.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {clientes.map((cliente) => (
                                <div key={cliente.idCliente} className="bg-white text-slate-800 rounded-lg shadow-lg p-5 flex flex-col justify-between transition-all hover:shadow-2xl hover:scale-[1.02]">
                                    {/* Conteúdo do Card... igual ao de ListarClientesPage */}
                                    <div>
                                        <div className="flex items-center mb-3">
                                            <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full mr-2">ID: {cliente.idCliente}</span>
                                            <h2 className="text-xl font-bold text-[var(--color-mottu-dark)] truncate" title={`${cliente.nome} ${cliente.sobrenome}`}>
                                                {cliente.nome} {cliente.sobrenome}
                                            </h2>
                                        </div>
                                        <div className="space-y-1.5 text-sm mb-4">
                                            <p className="flex items-center"><MdBadge className="mr-2 text-slate-500 flex-shrink-0" /> CPF: <span className="text-slate-600 ml-1 truncate" title={cliente.cpf}>{cliente.cpf}</span></p>
                                            <p className="flex items-center truncate"><MdEmailIcon className="mr-2 text-slate-500 flex-shrink-0" /> Email: <span className="text-slate-600 ml-1 truncate" title={cliente.contatoResponseDto?.email}>{cliente.contatoResponseDto?.email || '-'}</span></p>
                                            <p className="flex items-center"><MdPhoneAndroid className="mr-2 text-slate-500 flex-shrink-0" /> Celular: <span className="text-slate-600 ml-1 truncate" title={cliente.contatoResponseDto?.celular}>{cliente.contatoResponseDto?.celular || '-'}</span></p>
                                            <p className="flex items-center"><MdCalendarToday className="mr-2 text-slate-500 flex-shrink-0" /> Cadastro: <span className="text-slate-600 ml-1">{cliente.dataCadastro ? new Date(cliente.dataCadastro).toLocaleDateString('pt-BR') : '-'}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end items-center gap-2 border-t border-slate-200 pt-3 mt-auto">
                                        <Link href={`/clientes/alterar/${cliente.idCliente}`}
                                              className="p-2 rounded-full text-yellow-500 hover:bg-yellow-100 transition-colors" title="Editar Cliente">
                                            <MdEdit size={20}/>
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteCliente(cliente.idCliente, `${cliente.nome} ${cliente.sobrenome}`)}
                                            className="p-2 rounded-full text-red-500 hover:bg-red-100 transition-colors" title="Excluir Cliente">
                                            <MdDelete size={20}/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!isLoading && pageInfo && pageInfo.totalPages > 1 && (
                        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-100">
                            <div className="mb-2 sm:mb-0">
                                Página <strong>{pageInfo.number + 1}</strong> de <strong>{pageInfo.totalPages}</strong> (Total: {pageInfo.totalElements} clientes)
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={isLoading || pageInfo.first}
                                    className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                    <MdChevronLeft size={18}/> Anterior
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={isLoading || pageInfo.last}
                                    className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                >
                                    Próxima <MdChevronRight size={18}/>
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="mt-8 text-center">
                        <Link href="/clientes/listar">
                            <button className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md shadow">
                                Voltar para Lista Simples
                            </button>
                        </Link>
                    </div>
                </div>
            </main>
            <style jsx global>{`
                .date-input-fix::-webkit-calendar-picker-indicator { cursor: pointer; filter: invert(0.1); }
                input[type="date"]:required:invalid::-webkit-datetime-edit { color: transparent; }
                input[type="date"]:focus::-webkit-datetime-edit { color: #1e293b !important; }
                input[type="date"]::-webkit-datetime-edit { color: #1e293b; }
            `}</style>
        </>
    );
}