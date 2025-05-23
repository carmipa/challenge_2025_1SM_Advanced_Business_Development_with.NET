// src/app/clientes/deletar/[id]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { MdDeleteForever, MdCancel, MdErrorOutline, MdArrowBack } from 'react-icons/md'; // Adicionado MdArrowBack
import { Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { ClienteResponseDto } from '@/types/cliente'; // Ajuste o path
import { ClienteService } from '@/services/ClienteService'; // Ajuste o path

export default function DeletarClientePage() {
    const router = useRouter();
    const params = useParams();
    const idParam = params?.id;
    const id = typeof idParam === 'string' ? parseInt(idParam, 10) : null;

    const [clienteInfo, setClienteInfo] = useState<ClienteResponseDto | null>(null);
    const [isLoadingInfo, setIsLoadingInfo] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Função para formatar a data (opcional, se precisar exibir)
    // const formatDate = (dateString: string | null | undefined): string => { ... }

    useEffect(() => {
        if (!id) {
            setError("ID do cliente não fornecido na URL.");
            setIsLoadingInfo(false);
            return;
        }
        const fetchClienteData = async () => {
            setIsLoadingInfo(true);
            setError(null);
            try {
                const data: ClienteResponseDto = await ClienteService.getById(id);
                setClienteInfo(data);
            } catch (err: any) {
                if (err.response && err.response.status === 404) {
                    setError(`Cliente com ID ${id} não encontrado(a) ou já foi excluído(a).`);
                } else {
                    setError(err.response?.data?.message || err.message || "Falha ao carregar dados do cliente para exclusão.");
                }
                console.error("Erro detalhado no fetch de deleção (cliente):", err.response || err);
                setClienteInfo(null);
            } finally {
                setIsLoadingInfo(false);
            }
        };
        fetchClienteData();
    }, [id]);

    const handleConfirmDelete = async () => {
        if (id === null || !clienteInfo) {
            setError("Não é possível excluir: ID inválido ou dados do cliente não carregados.");
            return;
        }
        setIsDeleting(true);
        setError(null);
        try {
            await ClienteService.delete(id);
            console.log(`Cliente ID ${id} excluído com sucesso.`);
            router.push('/clientes/listar?deleted=true'); // Adiciona query param para msg de sucesso
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Falha ao excluir cliente.");
            console.error("Erro detalhado na deleção (cliente):", err.response || err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancel = () => {
        router.push('/clientes/listar');
    };

    if (isLoadingInfo) {
        return (
            <>
                <NavBar active="clientes-deletar" /> {/* Ajuste a prop 'active' se necessário */}
                <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white flex justify-center items-center">
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-12 w-12 animate-spin text-sky-400" />
                        <p className="mt-3 text-sky-300 text-lg">Carregando dados para confirmação...</p>
                    </div>
                </main>
            </>
        );
    }

    if (error && !clienteInfo) { // Erro grave ao carregar dados
        return (
            <>
                <NavBar active="clientes-deletar" />
                <main className="container mx-auto px-4 py-8 bg-[#012A46] min-h-screen text-white flex justify-center items-center">
                    <div className="bg-slate-900 p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-lg mx-auto text-center">
                        <AlertCircle className="text-5xl text-red-400 mx-auto mb-4" />
                        <h2 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-6 text-center text-red-400">
                            <MdErrorOutline className="text-3xl" /> Erro ao Carregar
                        </h2>
                        <p className="text-center text-red-400 bg-red-900/50 p-3 rounded border border-red-500 mb-6">{error}</p>
                        <div className="text-center">
                            <button onClick={handleCancel} className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-slate-600 rounded-md shadow hover:bg-slate-700">
                                <MdArrowBack size={20} /> Voltar para Lista
                            </button>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <NavBar active="clientes-deletar" />
            <main className="flex items-center justify-center min-h-screen bg-black text-white px-4 py-10"> {/* Fundo preto */}
                <div className="bg-[var(--color-mottu-default)] p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-lg border border-red-500"> {/* Card com cor Mottu */}
                    <h2 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-bold mb-4 text-center text-white"> {/* Texto branco */}
                        <Trash2 size={28} className="text-white" /> Confirmar Exclusão de Cliente {/* Ícone e texto brancos */}
                    </h2>
                    <p className="text-center mb-6 text-gray-200"> {/* Texto cinza claro */}
                        Tem certeza que deseja excluir o cliente abaixo? Esta ação não pode ser desfeita.
                    </p>

                    {clienteInfo && (
                        <div className="text-gray-200 text-sm mb-8 border-l-2 border-red-400 pl-4 bg-black/20 p-4 rounded"> {/* Fundo semi-transparente */}
                            <p><strong>ID:</strong> {clienteInfo.idCliente}</p>
                            <p><strong>Nome:</strong> {`${clienteInfo.nome} ${clienteInfo.sobrenome}`}</p>
                            <p><strong>CPF:</strong> {clienteInfo.cpf}</p>
                            <p><strong>Email:</strong> {clienteInfo.contatoResponseDto?.email || '-'}</p>
                        </div>
                    )}

                    {error && ( // Erro durante a tentativa de exclusão
                        <p className="text-center text-red-300 bg-red-700/50 p-3 rounded border border-red-500 mb-4">{error}</p>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                        <button
                            onClick={handleConfirmDelete}
                            className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-red-600 rounded-md shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[var(--color-mottu-default)] transition-opacity duration-300 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (<><Loader2 className="animate-spin mr-2" size={18}/> Excluindo...</>) : (<><MdDeleteForever size={20} /> Sim, Excluir</>)}
                        </button>
                        <button
                            onClick={handleCancel}
                            className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-[var(--color-mottu-default)] bg-white rounded-md shadow border border-[var(--color-mottu-default)] hover:bg-gray-100 disabled:opacity-70"
                            disabled={isDeleting}
                        >
                            <MdCancel size={20} /> Não, Cancelar
                        </button>
                    </div>
                </div>
            </main>
        </>
    );
}