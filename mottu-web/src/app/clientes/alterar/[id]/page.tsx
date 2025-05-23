// src/app/clientes/alterar/[id]/page.tsx
"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { IMaskInput } from 'react-imask';
import {
    MdEdit, MdSave, MdArrowBack, MdErrorOutline, MdCheckCircle, MdInfo, MdHome, MdLocationOn, MdPhone, MdEmail as MdEmailIcon, MdWork, MdBadge, MdCalendarToday
} from 'react-icons/md';
import { User, Mail, MapPin, Briefcase, Text as LucideText, Calendar as CalendarIcon, Loader2, AlertCircle } from 'lucide-react';
import { ClienteRequestDto, ClienteResponseDto, EnderecoRequestDto, ContatoRequestDto, EstadoCivilType, SexoType } from '@/types/cliente'; // Ajuste o path
import { ClienteService } from '@/services/ClienteService'; // Ajuste o path

const cleanMaskedValue = (value: string): string => value.replace(/\D/g, '');

const initialEnderecoState: EnderecoRequestDto = {
    idEndereco: undefined, cep: "", logradouro: "", numero: 0, bairro: "", cidade: "", estado: "", pais: "Brasil", complemento: "", observacao: ""
};
const initialContatoState: ContatoRequestDto = {
    idContato: undefined, email: "", ddd: 0, ddi: 55, telefone1: "", telefone2: "", telefone3: "", celular: "", outro: "", observacao: ""
};

export default function AlterarClientePage() {
    const params = useParams();
    const router = useRouter();
    const idParam = params?.id;
    const id = typeof idParam === 'string' ? parseInt(idParam, 10) : null;

    const [formData, setFormData] = useState<ClienteRequestDto>({
        nome: '', sobrenome: '', sexo: 'M', dataNascimento: '', cpf: '',
        profissao: '', estadoCivil: 'Solteiro',
        enderecoRequestDto: initialEnderecoState,
        contatoRequestDto: initialContatoState,
    });

    // O tipoDocumentoDisplay é apenas para a máscara, o C# Model Cliente.Cpf espera 11 dígitos.
    // const [tipoDocumentoDisplay, setTipoDocumentoDisplay] = useState("CPF");

    const [isLoading, setIsLoading] = useState(false); // Para submissão
    const [isFetching, setIsFetching] = useState(true); // Para carregar dados iniciais
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError("ID do cliente não fornecido na URL.");
            setIsFetching(false);
            return;
        }
        const fetchData = async () => {
            setIsFetching(true);
            setError(null);
            try {
                const data: ClienteResponseDto = await ClienteService.getById(id);

                // Formatar dataNascimento para YYYY-MM-DD
                const dataNascimentoFormatada = data.dataNascimento ? data.dataNascimento.split('T')[0] : '';

                setFormData({
                    nome: data.nome || '',
                    sobrenome: data.sobrenome || '',
                    sexo: data.sexo || 'M',
                    dataNascimento: dataNascimentoFormatada,
                    cpf: data.cpf || '',
                    profissao: data.profissao || '',
                    estadoCivil: data.estadoCivil || 'Solteiro',
                    enderecoRequestDto: {
                        idEndereco: data.enderecoResponseDto?.idEndereco,
                        cep: data.enderecoResponseDto?.cep || '',
                        numero: data.enderecoResponseDto?.numero || 0,
                        logradouro: data.enderecoResponseDto?.logradouro || '',
                        bairro: data.enderecoResponseDto?.bairro || '',
                        cidade: data.enderecoResponseDto?.cidade || '',
                        estado: data.enderecoResponseDto?.estado || '',
                        pais: data.enderecoResponseDto?.pais || 'Brasil',
                        complemento: data.enderecoResponseDto?.complemento || '',
                        observacao: data.enderecoResponseDto?.observacao || '',
                    },
                    contatoRequestDto: {
                        idContato: data.contatoResponseDto?.idContato,
                        email: data.contatoResponseDto?.email || '',
                        ddd: data.contatoResponseDto?.ddd || 0,
                        ddi: data.contatoResponseDto?.ddi || 55,
                        telefone1: data.contatoResponseDto?.telefone1 || '',
                        telefone2: data.contatoResponseDto?.telefone2 || '',
                        telefone3: data.contatoResponseDto?.telefone3 || '',
                        celular: data.contatoResponseDto?.celular || '',
                        outro: data.contatoResponseDto?.outro || '',
                        observacao: data.contatoResponseDto?.observacao || '',
                    },
                });
                // Se você tinha lógica para tipoDocumentoDisplay (CPF/CNPJ), ajuste aqui.
                // Mas o modelo C# `Cliente.cs` só tem `Cpf` (11 dígitos).
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || "Falha ao carregar dados para edição.");
                console.error("Erro detalhado no fetch inicial:", err.response || err);
            } finally {
                setIsFetching(false);
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const nameParts = name.split('.');

        if (nameParts.length === 2) {
            const [parentKey, childKey] = nameParts as [keyof ClienteRequestDto, string];
            setFormData(prev => {
                const parentObject = prev[parentKey] as any;
                let processedValue: string | number = value;
                if (childKey === 'numero' || childKey === 'ddd' || childKey === 'ddi') {
                    processedValue = parseInt(value, 10);
                    if (isNaN(processedValue)) processedValue = parentObject[childKey]; // Mantém valor anterior se inválido
                }
                return {
                    ...prev,
                    [parentKey]: { ...parentObject, [childKey]: processedValue }
                };
            });
        } else {
            setFormData(prev => ({ ...prev, [name as keyof ClienteRequestDto]: value }));
        }
    };

    const handleMaskedChange = (name: string, maskedValue: string) => {
        const nameParts = name.split('.');
        if (nameParts.length === 2) {
            const [parentKey, childKey] = nameParts as [keyof ClienteRequestDto, string];
            setFormData(prev => ({
                ...prev,
                [parentKey]: { ...((prev[parentKey] as any) || {}), [childKey]: maskedValue }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name as keyof ClienteRequestDto]: maskedValue }));
        }
    };

    const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (id === null) {
            setError("ID do cliente inválido para salvar.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        const clienteDataToSend: ClienteRequestDto = {
            ...formData,
            cpf: cleanMaskedValue(formData.cpf),
            contatoRequestDto: {
                ...formData.contatoRequestDto,
                celular: cleanMaskedValue(formData.contatoRequestDto.celular),
                ddd: Number(formData.contatoRequestDto.ddd) || 0,
                ddi: Number(formData.contatoRequestDto.ddi) || 0,
            },
            enderecoRequestDto: {
                ...formData.enderecoRequestDto,
                cep: cleanMaskedValue(formData.enderecoRequestDto.cep),
                numero: Number(formData.enderecoRequestDto.numero) || 0,
            }
        };
        console.log("Enviando payload para ATUALIZAR Cliente:", JSON.stringify(clienteDataToSend, null, 2));

        try {
            // O ClienteService.update foi ajustado para simular o retorno ou não esperar um
            await ClienteService.update(id, clienteDataToSend);
            setSuccess(`✅ Cliente "${clienteDataToSend.nome} ${clienteDataToSend.sobrenome}" (ID: ${id}) atualizado com sucesso!`);
            setTimeout(() => { setSuccess(null); router.push('/clientes/listar'); }, 2000);
        } catch (err: any) {
            const apiError = err.response?.data;
            if (apiError && typeof apiError === 'object') {
                if (apiError.errors) { // Erro de validação do ASP.NET Core ModelState
                    const messages = Object.values(apiError.errors).flat().join('; ');
                    setError(`❌ Erro de validação: ${messages}`);
                } else if (apiError.message) {
                    setError(`❌ ${apiError.message}`);
                } else {
                    setError(`❌ ${JSON.stringify(apiError)}`); // Erro genérico do backend
                }
            } else if (err.message) {
                setError(`❌ ${err.message}`); // Erro de rede ou outros
            } else {
                setError('Falha ao salvar alterações. Verifique os dados e tente novamente.');
            }
            console.error("Erro detalhado ao atualizar:", err.response || err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCepDetails = async (cepValue: string) => {
        const cleanCep = cleanMaskedValue(cepValue);
        if (cleanCep.length === 8) {
            setError(null);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                if (!response.ok) throw new Error(`Erro HTTP ${response.status} ao buscar CEP.`);
                const data = await response.json();
                if (data.erro) throw new Error("CEP não encontrado ou inválido.");

                setFormData(prev => ({
                    ...prev,
                    enderecoRequestDto: {
                        ...prev.enderecoRequestDto,
                        cep: cepValue, // Mantém o CEP com máscara no input
                        logradouro: data.logradouro || prev.enderecoRequestDto.logradouro,
                        bairro: data.bairro || prev.enderecoRequestDto.bairro,
                        cidade: data.localidade || prev.enderecoRequestDto.cidade,
                        estado: data.uf || prev.enderecoRequestDto.estado,
                        pais: 'Brasil',
                    }
                }));
            } catch (err: any) {
                setError(`Erro ViaCEP: ${err.message}`);
                // Não limpar campos já preenchidos se ViaCEP falhar na alteração, apenas mostrar erro
            }
        }
    };

    const handleCepChange = (maskedValue: string) => {
        handleMaskedChange('enderecoRequestDto.cep', maskedValue); // Atualiza o CEP no formData
        fetchCepDetails(maskedValue); // Busca detalhes do CEP
    };

    const cpfMask = "000.000.000-00";

    if (isFetching) {
        return (
            <>
                <NavBar active="clientes-alterar" />
                <main className="container mx-auto p-8 flex justify-center items-center min-h-screen bg-[#012A46]">
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-12 w-12 animate-spin text-sky-400" />
                        <p className="mt-3 text-sky-300 text-lg">Carregando dados do cliente...</p>
                    </div>
                </main>
            </>
        );
    }

    if (error && !isFetching && (!formData.nome || formData.nome === '')) {
        return (
            <>
                <NavBar active="clientes-alterar" />
                <main className="container mx-auto p-8 flex justify-center items-center min-h-screen bg-[#012A46]">
                    <div className="bg-slate-900 p-8 rounded-lg shadow-xl text-center">
                        <AlertCircle className="text-5xl text-red-400 mx-auto mb-4" />
                        <p className="text-red-400 text-lg mb-6">{error}</p>
                        <Link href="/clientes/listar" className="px-6 py-3 bg-sky-600 text-white rounded-md shadow hover:bg-sky-700">Voltar para Lista</Link>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <NavBar active="clientes-alterar" />
            <main className="flex items-center justify-center min-h-screen bg-black text-white px-4 py-10">
                <div className="bg-[var(--color-mottu-default)] p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-4xl">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center flex items-center justify-center text-white">
                        <MdEdit className="inline-block mr-2 text-3xl" />
                        Alterar Cliente (ID: {id})
                    </h2>

                    {error && (
                        <div className="relative mb-4 text-red-200 bg-red-700/80 p-4 rounded border border-red-500" role="alert">
                            <span className="block sm:inline">{error}</span>
                            <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-200 hover:text-red-100" onClick={() => setError(null)} aria-label="Fechar">
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center justify-center gap-2 text-[var(--color-mottu-dark)] p-3 rounded bg-white/90 border border-[var(--color-mottu-dark)] mb-4">
                            <MdCheckCircle className="text-xl" /> <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleUpdate}>
                        {/* Dados Pessoais */}
                        <fieldset className="mb-6 border border-[var(--color-mottu-light)]/40 p-4 rounded">
                            <legend className="text-xl font-semibold mb-2 px-2 text-white">Dados Pessoais</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="nome" className="block mb-1 flex items-center gap-1 text-white"><User size={16} /> Nome:</label>
                                    <input id="nome" type="text" name="nome" value={formData.nome} onChange={handleChange} required maxLength={100} className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 placeholder:text-gray-400" />
                                </div>
                                <div>
                                    <label htmlFor="sobrenome" className="block mb-1 flex items-center gap-1 text-white"><User size={16} /> Sobrenome:</label>
                                    <input id="sobrenome" type="text" name="sobrenome" value={formData.sobrenome} onChange={handleChange} required maxLength={100} className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 placeholder:text-gray-400" />
                                </div>
                                <div>
                                    <label htmlFor="sexo" className="block mb-1 flex items-center gap-1 text-white"><MdInfo size={16} /> Sexo:</label>
                                    <select id="sexo" name="sexo" value={formData.sexo} onChange={handleChange} required className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10">
                                        <option value="M">Masculino</option>
                                        <option value="F">Feminino</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="dataNascimento" className="block mb-1 flex items-center gap-1 text-white"><CalendarIcon size={16} /> Nascimento:</label>
                                    <input type="date" id="dataNascimento" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} required className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 date-input-fix h-10" />
                                </div>
                                <div>
                                    <label htmlFor="cpf" className="block mb-1 flex items-center gap-1 text-white"><MdBadge size={16} /> CPF:</label>
                                    <IMaskInput
                                        id="cpf" name="cpf" mask={cpfMask} unmask={false}
                                        value={formData.cpf}
                                        onAccept={(value) => handleMaskedChange('cpf', value)}
                                        required placeholder="000.000.000-00"
                                        className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 placeholder:text-gray-400"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="profissao" className="block mb-1 flex items-center gap-1 text-white"><Briefcase size={16} /> Profissão:</label>
                                    <input type="text" id="profissao" name="profissao" value={formData.profissao} onChange={handleChange} required maxLength={50} className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 placeholder:text-gray-400" />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="estadoCivil" className="block mb-1 flex items-center gap-1 text-white"><MdInfo size={16} /> Estado Civil:</label>
                                    <select id="estadoCivil" name="estadoCivil" value={formData.estadoCivil} onChange={handleChange} required className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10">
                                        <option value="Solteiro">Solteiro</option>
                                        <option value="Casado">Casado</option>
                                        <option value="Divorciado">Divorciado</option>
                                        <option value="Viúvo">Viúvo</option>
                                        <option value="Separado">Separado</option>
                                        <option value="União Estável">União Estável</option>
                                    </select>
                                </div>
                            </div>
                        </fieldset>

                        {/* Contatos */}
                        <fieldset className="mb-6 border border-[var(--color-mottu-light)]/40 p-4 rounded">
                            <legend className="text-xl font-semibold mb-2 px-2 text-white">Contatos</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="celular" className="block mb-1 flex items-center gap-1 text-white"><MdPhone size={16} /> Celular:</label>
                                    <IMaskInput
                                        id="celular" name="contatoRequestDto.celular" mask="(00) 00000-0000"
                                        unmask={false} value={formData.contatoRequestDto.celular}
                                        onAccept={(value) => handleMaskedChange('contatoRequestDto.celular', value)}
                                        required placeholder="(99) 99999-9999"
                                        className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 placeholder:text-gray-400"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block mb-1 flex items-center gap-1 text-white"><MdEmailIcon size={16} /> E-mail:</label>
                                    <input type="email" id="email" name="contatoRequestDto.email" value={formData.contatoRequestDto.email} onChange={handleChange} required placeholder="exemplo@dominio.com" className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 placeholder:text-gray-400" />
                                </div>
                                <div>
                                    <label htmlFor="ddd" className="block mb-1 text-sm font-medium text-white flex items-center gap-1"><MdPhone size={16} /> DDD:</label>
                                    <input type="number" id="ddd" name="contatoRequestDto.ddd" value={formData.contatoRequestDto.ddd === 0 ? '' : formData.contatoRequestDto.ddd} onChange={handleChange} required min={11} max={99} placeholder="11" className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 placeholder:text-gray-400" />
                                </div>
                                <div>
                                    <label htmlFor="ddi" className="block mb-1 text-sm font-medium text-white flex items-center gap-1"><MdPhone size={16} /> DDI:</label>
                                    <input type="number" id="ddi" name="contatoRequestDto.ddi" value={formData.contatoRequestDto.ddi === 0 ? '' : formData.contatoRequestDto.ddi} onChange={handleChange} required min={1} max={999} placeholder="55" className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 placeholder:text-gray-400" />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="telefone1" className="block mb-1 flex items-center gap-1 text-white"><MdPhone size={16} /> Telefone 1:</label>
                                    <input type="text" id="telefone1" name="contatoRequestDto.telefone1" value={formData.contatoRequestDto.telefone1} onChange={handleChange} required maxLength={20} className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 placeholder:text-gray-400" />
                                </div>
                                <div>
                                    <label htmlFor="telefone2" className="block mb-1 text-sm font-medium text-white flex items-center gap-1"><MdPhone size={16} /> Telefone 2:</label>
                                    <input type="text" id="telefone2" name="contatoRequestDto.telefone2" value={formData.contatoRequestDto.telefone2 || ''} onChange={handleChange} maxLength={20} className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 placeholder:text-gray-400" />
                                </div>
                                <div>
                                    <label htmlFor="telefone3" className="block mb-1 text-sm font-medium text-white flex items-center gap-1"><MdPhone size={16} /> Telefone 3:</label>
                                    <input type="text" id="telefone3" name="contatoRequestDto.telefone3" value={formData.contatoRequestDto.telefone3 || ''} onChange={handleChange} maxLength={20} className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 placeholder:text-gray-400" />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="contato_outro" className="block mb-1 flex items-center gap-1 text-white"><MdInfo size={16} /> Outro Contato:</label>
                                    <textarea id="contato_outro" name="contatoRequestDto.outro" rows={2} value={formData.contatoRequestDto.outro || ''} onChange={handleChange} maxLength={100} className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 placeholder:text-gray-400" />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="contato_observacao" className="block mb-1 flex items-center gap-1 text-white"><LucideText size={16} /> Observação (Contato):</label>
                                    <textarea id="contato_observacao" name="contatoRequestDto.observacao" rows={2} value={formData.contatoRequestDto.observacao || ''} onChange={handleChange} maxLength={200} className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 placeholder:text-gray-400" />
                                </div>
                            </div>
                        </fieldset>

                        {/* Endereço */}
                        <fieldset className="mb-6 border border-[var(--color-mottu-light)]/40 p-4 rounded">
                            <legend className="text-xl font-semibold mb-2 px-2 text-white">Endereço</legend>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="cep" className="block mb-1 flex items-center gap-1 text-white"><MapPin size={16} /> CEP:</label>
                                    <IMaskInput
                                        id="cep" name="enderecoRequestDto.cep" mask="00000-000"
                                        unmask={false} value={formData.enderecoRequestDto.cep}
                                        onAccept={(value) => handleCepChange(value)}
                                        required placeholder="00000-000"
                                        className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 placeholder:text-gray-400"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="numero" className="block mb-1 flex items-center gap-1 text-white"><MdHome size={16} /> Número:</label>
                                    <input type="number" id="numero" name="enderecoRequestDto.numero" value={formData.enderecoRequestDto.numero === 0 ? '' : formData.enderecoRequestDto.numero} onChange={handleChange} required min={1} placeholder="123" className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 placeholder:text-gray-400" />
                                </div>
                                <div>
                                    <label htmlFor="complemento" className="block mb-1 flex items-center gap-1 text-white"><MdHome size={16} /> Complemento:</label>
                                    <input type="text" id="complemento" name="enderecoRequestDto.complemento" value={formData.enderecoRequestDto.complemento || ''} onChange={handleChange} maxLength={60} className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 h-10 placeholder:text-gray-400" />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="logradouro" className="block mb-1 flex items-center gap-1 text-white"><MdLocationOn size={16} /> Logradouro:</label>
                                    <input type="text" id="logradouro" name="enderecoRequestDto.logradouro" value={formData.enderecoRequestDto.logradouro || ''} onChange={handleChange} required readOnly={!!formData.enderecoRequestDto.logradouro && cleanMaskedValue(formData.enderecoRequestDto.cep).length === 8} className={`w-full p-2 rounded border border-gray-300 h-10 ${!!formData.enderecoRequestDto.logradouro && cleanMaskedValue(formData.enderecoRequestDto.cep).length === 8 ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white text-slate-900'}`} />
                                </div>
                                <div>
                                    <label htmlFor="bairro" className="block mb-1 flex items-center gap-1 text-white"><MdLocationOn size={16} /> Bairro:</label>
                                    <input type="text" id="bairro" name="enderecoRequestDto.bairro" value={formData.enderecoRequestDto.bairro || ''} onChange={handleChange} required readOnly={!!formData.enderecoRequestDto.bairro && cleanMaskedValue(formData.enderecoRequestDto.cep).length === 8} className={`w-full p-2 rounded border border-gray-300 h-10 ${!!formData.enderecoRequestDto.bairro && cleanMaskedValue(formData.enderecoRequestDto.cep).length === 8 ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white text-slate-900'}`} />
                                </div>
                                <div>
                                    <label htmlFor="cidade" className="block mb-1 flex items-center gap-1 text-white"><MdLocationOn size={16} /> Cidade:</label>
                                    <input type="text" id="cidade" name="enderecoRequestDto.cidade" value={formData.enderecoRequestDto.cidade || ''} onChange={handleChange} required readOnly={!!formData.enderecoRequestDto.cidade && cleanMaskedValue(formData.enderecoRequestDto.cep).length === 8} className={`w-full p-2 rounded border border-gray-300 h-10 ${!!formData.enderecoRequestDto.cidade && cleanMaskedValue(formData.enderecoRequestDto.cep).length === 8 ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white text-slate-900'}`} />
                                </div>
                                <div>
                                    <label htmlFor="estado" className="block mb-1 flex items-center gap-1 text-white"><MdLocationOn size={16} /> Estado (UF):</label>
                                    <input type="text" id="estado" name="enderecoRequestDto.estado" value={formData.enderecoRequestDto.estado || ''} onChange={handleChange} required readOnly={!!formData.enderecoRequestDto.estado && cleanMaskedValue(formData.enderecoRequestDto.cep).length === 8} maxLength={2} className={`w-full p-2 rounded border border-gray-300 h-10 ${!!formData.enderecoRequestDto.estado && cleanMaskedValue(formData.enderecoRequestDto.cep).length === 8 ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white text-slate-900'}`} />
                                </div>
                                <div>
                                    <label htmlFor="pais" className="block mb-1 flex items-center gap-1 text-white"><MdLocationOn size={16} /> País:</label>
                                    <input type="text" id="pais" name="enderecoRequestDto.pais" value={formData.enderecoRequestDto.pais || 'Brasil'} onChange={handleChange} required readOnly={!!formData.enderecoRequestDto.pais && cleanMaskedValue(formData.enderecoRequestDto.cep).length === 8} className={`w-full p-2 rounded border border-gray-300 h-10 ${!!formData.enderecoRequestDto.pais && cleanMaskedValue(formData.enderecoRequestDto.cep).length === 8 ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white text-slate-900'}`} />
                                </div>
                                <div className="md:col-span-3">
                                    <label htmlFor="endereco_observacao" className="block mb-1 flex items-center gap-1 text-white"><LucideText size={16} /> Observação (Endereço):</label>
                                    <textarea id="endereco_observacao" name="enderecoRequestDto.observacao" rows={2} value={formData.enderecoRequestDto.observacao || ''} onChange={handleChange} maxLength={200} className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 placeholder:text-gray-400" />
                                </div>
                            </div>
                        </fieldset>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <button
                                type="submit"
                                className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md shadow hover:bg-opacity-80 transition-colors duration-200 ${isLoading || isFetching ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isLoading || isFetching}
                            >
                                <MdSave size={20} /> {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                            <Link
                                href="/clientes/listar"
                                className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-[var(--color-mottu-default)] bg-white rounded-md shadow border border-[var(--color-mottu-default)] hover:bg-gray-50 hover:text-[var(--color-mottu-dark)] hover:border-[var(--color-mottu-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--color-mottu-dark)] focus:ring-offset-2 focus:ring-offset-[var(--color-mottu-default)] transition-colors duration-200"
                            >
                                <MdArrowBack size={20} /> Voltar para Lista
                            </Link>
                        </div>
                    </form>
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