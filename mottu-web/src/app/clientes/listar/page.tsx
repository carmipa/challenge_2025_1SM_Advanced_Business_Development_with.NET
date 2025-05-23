// src/app/clientes/listar/page.tsx
"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
// Certifique-se que os caminhos para os types e services estão corretos
import { ClienteService } from '@/services/ClienteService';
import { ClienteResponseDto, ClienteFilter, ContatoResponseDto } from '@/types/cliente';
// Removido SpringPage se não for mais usado devido à resposta direta do array
// import { SpringPage } from '@/types/common';
import { IMaskInput } from 'react-imask';
import {
    MdSearch, MdClear, MdAdd, MdChevronLeft, MdChevronRight, MdEdit, MdDelete,
    MdErrorOutline, MdCheckCircle, MdPhoneAndroid, MdCalendarToday, MdBadge
} from 'react-icons/md';
// Importe Mail de lucide-react se for usar como ícone de email
import { UserCircle, Loader2, Mail as MailIconLucide } from 'lucide-react';


const initialFilterState: ClienteFilter = {
    nome: undefined,
    cpf: undefined,
};
// Removido se SpringPage não for usado:
// const initialPageInfo: SpringPage<ClienteResponseDto> | null = null;

export default function ListarClientesPage() {
    const [clientes, setClientes] = useState<ClienteResponseDto[]>([]);
    // Removido se SpringPage não for usado:
    // const [pageInfo, setPageInfo] = useState<SpringPage<ClienteResponseDto> | null>(initialPageInfo);
    // const [currentPage, setCurrentPage] = useState(0);
    const [filtros, setFiltros] = useState<ClienteFilter>(initialFilterState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Removido se SpringPage não for usado:
    // const ITEMS_PER_PAGE = 9;
    // const SORT_ORDER = 'idCliente,asc';

    // Função type guard para erros do Axios (ou similar)
    const isstructuredError = (candidate: any): candidate is { response?: { data?: { message?: string, title?: string, errors?: any } }, message?: string } => {
        return typeof candidate === 'object' && candidate !== null;
    };

    const cleanMaskedValue = (value: string | undefined): string | undefined => {
        return value ? value.replace(/\D/g, '') : undefined;
    };

    const fetchData = async (currentFilters = filtros) => {
        setIsLoading(true);
        setError(null);

        const filtersToUse = { ...currentFilters };
        if (filtersToUse.cpf) {
            filtersToUse.cpf = cleanMaskedValue(filtersToUse.cpf);
        }

        try {
            let data: ClienteResponseDto[] = [];
            if (filtersToUse.cpf && filtersToUse.cpf.length === 11 && !filtersToUse.nome) {
                const cliente = await ClienteService.getByCpf(filtersToUse.cpf);
                if (cliente) {
                    data = [cliente];
                } else {
                    data = []; // Nenhum cliente encontrado com este CPF
                }
            } else if (filtersToUse.nome && !filtersToUse.cpf) {
                data = await ClienteService.searchByName(filtersToUse.nome);
            } else if (filtersToUse.nome && filtersToUse.cpf && filtersToUse.cpf.length === 11) {
                // Se ambos os filtros são fornecidos, você pode priorizar um,
                // ou indicar que a combinação não é suportada para uma busca simples.
                // Ou, buscar por nome e depois filtrar por CPF no cliente.
                // Por ora, vamos buscar por nome e depois filtrar no cliente.
                const clientesPorNome = await ClienteService.searchByName(filtersToUse.nome);
                data = clientesPorNome.filter(c => c.cpf === filtersToUse.cpf);
                if (data.length === 0 && clientesPorNome.length > 0) {
                    setError("Cliente encontrado pelo nome, mas CPF não corresponde. Limpe um dos filtros.");
                } else if (data.length === 0) {
                    setError("Nenhum cliente encontrado com esse nome e CPF combinados.");
                }
            }
            else {
                // Se nenhum filtro específico de CPF ou Nome, ou filtros incompletos, busca todos.
                // O backend C# GetAllClientes retorna IEnumerable<Cliente>
                data = await ClienteService.getAll(); // Assumindo que getAll não usa filtros complexos
            }

            setClientes(data);

            // Lógica de paginação removida pois o backend não retorna SpringPage
            // setPageInfo(data);
            // setCurrentPage(data.number);
            if (data.length === 0 && !error) { // Se não houve erro de API mas a busca não retornou nada
                setError("Nenhum cliente encontrado para os filtros aplicados.");
            }

        } catch (err: unknown) {
            let errorMessage = 'Erro ao buscar clientes.';
            if (isstructuredError(err)) {
                if (err.response?.data) {
                    if (err.response.data.message) {
                        errorMessage = err.response.data.message;
                    } else if (err.response.data.title) { // Para erros de validação do ASP.NET Core
                        errorMessage = err.response.data.title;
                        if (err.response.data.errors) {
                            const validationErrors = Object.values(err.response.data.errors).flat().join(', ');
                            errorMessage += `: ${validationErrors}`;
                        }
                    }
                } else if (err.message) {
                    errorMessage = err.message;
                }
            }
            setError(errorMessage);
            // Este console.error é o que estava logando "{}"
            // Vamos logar o 'err' completo para melhor depuração no console do navegador
            console.error("Erro detalhado fetchData (listar clientes):", err);
            setClientes([]);
            // setPageInfo(null); // Removido
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.get('deleted') === 'true') {
            setSuccessMessage("Cliente excluído com sucesso!");
            window.history.replaceState({}, document.title, window.location.pathname);
            setTimeout(() => setSuccessMessage(null), 4000);
        }
        fetchData(initialFilterState); // Carga inicial
    }, []);

    const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFiltros(prev => ({ ...prev, [name]: value || undefined }));
    };

    // handleCpfFilterChange foi removido pois a lógica está no onAccept do IMaskInput agora

    const handleFilterSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // setCurrentPage(0); // Removido
        fetchData(filtros);
    };

    const handleClearFilters = () => {
        setFiltros(initialFilterState);
        // setCurrentPage(0); // Removido
        fetchData(initialFilterState);
    };

    // handlePageChange não é mais necessário para paginação do servidor
    // const handlePageChange = (newPage: number) => { ... };

    const handleDeleteCliente = async (clienteId: number, nomeCliente: string) => {
        if (window.confirm(`Tem certeza que deseja excluir o cliente "${nomeCliente}" (ID: ${clienteId})?`)) {
            setError(null);
            try {
                await ClienteService.delete(clienteId);
                setSuccessMessage(`Cliente "${nomeCliente}" excluído com sucesso!`);
                fetchData(filtros); // Recarrega a lista com filtros atuais
                setTimeout(() => setSuccessMessage(null), 4000);
            } catch (err: unknown) {
                let errorMessage = `Erro ao excluir cliente "${nomeCliente}".`;
                if (isstructuredError(err)) {
                    errorMessage = err.response?.data?.message || err.message || errorMessage;
                }
                setError(errorMessage);
                console.error("Erro detalhado handleDelete (listar clientes):", err);
            }
        }
    };

    const formatDisplayDate = (isoDateString?: string): string => {
        if (!isoDateString) return '-';
        // A data já deve estar no formato YYYY-MM-DD vinda do formatClienteResponse no serviço
        // Se ainda vier com hora, new Date() e toLocaleDateString é uma boa forma de formatar.
        try {
            return new Date(isoDateString + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        } catch {
            return isoDateString; // Retorna a string original se a data for inválida
        }
    };

    const getEmail = (contatoDto?: ContatoResponseDto): string => {
        return contatoDto?.email || '-';
    };

    const getCelular = (contatoDto?: ContatoResponseDto): string => {
        return contatoDto?.celular || '-';
    };


    return (
        <>
            <NavBar active="clientes-listar" />
            <main className="min-h-screen bg-black text-white p-4 md:p-8">
                <div className="container mx-auto bg-[var(--color-mottu-default)] p-6 md:p-8 rounded-lg shadow-xl">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
                            <UserCircle size={32} className="mr-3" />
                            Clientes Cadastrados
                        </h1>
                        <div className="flex gap-2 mt-4 sm:mt-0">
                            <Link href="/clientes/buscar"
                                  className="flex items-center gap-2 px-4 py-2.5 font-semibold text-[var(--color-mottu-dark)] bg-yellow-400 rounded-md shadow hover:bg-yellow-500 transition-colors duration-200">
                                <MdSearch size={20} /> Busca Avançada
                            </Link>
                            <Link href="/clientes/cadastrar"
                                  className="flex items-center gap-2 px-4 py-2.5 font-semibold text-[var(--color-mottu-dark)] bg-white rounded-md shadow hover:bg-gray-100 transition-colors duration-200">
                                <MdAdd size={20} /> Novo Cliente
                            </Link>
                        </div>
                    </div>

                    {successMessage && (
                        <div className="mb-4 flex items-center gap-2 text-sm text-green-700 p-3 rounded-md bg-green-100 border border-green-300">
                            <MdCheckCircle className="text-xl" /> <span>{successMessage}</span>
                        </div>
                    )}
                    {/* Mensagem de erro principal da página */}
                    {error && (
                        <div className="mb-4 flex items-center gap-2 text-sm text-red-700 p-3 rounded-md bg-red-100 border border-red-300" role="alert">
                            <MdErrorOutline className="text-xl" /> <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleFilterSubmit} className="mb-8 p-4 bg-black/20 rounded-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
                            <div>
                                <label htmlFor="filtro-nome" className="block text-sm font-medium text-slate-100 mb-1">Nome:</label>
                                <input
                                    type="text" id="filtro-nome" name="nome"
                                    value={filtros.nome || ''} onChange={handleFilterChange}
                                    className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:border-[var(--color-mottu-default)] focus:ring-2 focus:ring-[var(--color-mottu-light)]/40 h-10 placeholder:text-gray-400"
                                    placeholder="Filtrar por nome..."
                                />
                            </div>
                            <div>
                                <label htmlFor="filtro-cpf" className="block text-sm font-medium text-slate-100 mb-1">CPF:</label>
                                <IMaskInput
                                    mask="000.000.000-00" id="filtro-cpf" name="cpf"
                                    value={filtros.cpf || ''}
                                    onAccept={(value) => setFiltros(prev => ({ ...prev, cpf: value || undefined }))}
                                    className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:border-[var(--color-mottu-default)] focus:ring-2 focus:ring-[var(--color-mottu-light)]/40 h-10 placeholder:text-gray-400"
                                    placeholder="Filtrar por CPF..."
                                />
                            </div>
                            <div className="flex gap-2 sm:col-span-2 md:col-span-1 md:self-end pt-2 sm:pt-0">
                                <button type="submit" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md shadow hover:bg-opacity-80 transition-colors duration-200 h-10">
                                    <MdSearch size={20} /> Buscar
                                </button>
                                <button type="button" onClick={handleClearFilters} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-medium text-slate-700 bg-gray-200 rounded-md shadow hover:bg-gray-300 transition-colors duration-200 h-10">
                                    <MdClear size={20} /> Limpar
                                </button>
                            </div>
                        </div>
                    </form>

                    {isLoading &&
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="h-12 w-12 animate-spin text-slate-100" />
                            <p className="ml-3 text-slate-100">Carregando clientes...</p>
                        </div>
                    }

                    {/* Exibe mensagem de "Nenhum cliente encontrado" somente se não estiver carregando e não houver erro de API, mas a busca foi feita e não retornou resultados */}
                    {!isLoading && !error && clientes.length === 0 && (
                        <div className="text-center py-10">
                            <MdErrorOutline size={48} className="mx-auto text-slate-300 mb-2" />
                            <p className="text-slate-300">Nenhum cliente encontrado com os filtros atuais.</p>
                        </div>
                    )}

                    {!isLoading && clientes.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {clientes.map((cliente) => (
                                <div key={cliente.idCliente} className="bg-white text-slate-800 rounded-lg shadow-lg p-5 flex flex-col justify-between transition-all hover:shadow-2xl hover:scale-[1.02]">
                                    <div>
                                        <div className="flex items-center mb-3">
                                            <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full mr-2">ID: {cliente.idCliente}</span>
                                            <h2 className="text-xl font-bold text-[var(--color-mottu-dark)] truncate" title={`${cliente.nome} ${cliente.sobrenome}`}>
                                                {cliente.nome} {cliente.sobrenome}
                                            </h2>
                                        </div>
                                        <div className="space-y-1.5 text-sm mb-4">
                                            <p className="flex items-center"><MdBadge className="mr-2 text-slate-500 flex-shrink-0" /> CPF: <span className="text-slate-600 ml-1 truncate" title={cliente.cpf}>{cliente.cpf}</span></p>
                                            <p className="flex items-center truncate">
                                                <MailIconLucide size={16} className="mr-2 text-slate-500 flex-shrink-0" /> Email: <span className="text-slate-600 ml-1 truncate" title={getEmail(cliente.contatoResponseDto)}>{getEmail(cliente.contatoResponseDto)}</span>
                                            </p>
                                            <p className="flex items-center"><MdPhoneAndroid className="mr-2 text-slate-500 flex-shrink-0" /> Celular: <span className="text-slate-600 ml-1 truncate" title={getCelular(cliente.contatoResponseDto)}>{getCelular(cliente.contatoResponseDto)}</span></p>
                                            <p className="flex items-center"><MdCalendarToday className="mr-2 text-slate-500 flex-shrink-0" /> Cadastro: <span className="text-slate-600 ml-1">{formatDisplayDate(cliente.dataCadastro)}</span></p>
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

                    {/* Paginação do lado do servidor (REMOVIDA POR AGORA, POIS BACKEND NÃO SUPORTA) */}
                    {/* Se você implementar paginação no backend, pode adicionar os botões de volta aqui, usando pageInfo */}
                    {/* {!isLoading && pageInfo && pageInfo.totalPages > 1 && (
                        // ... Botões de paginação ...
                    )}
                    */}
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