// src/app/clientes/cadastrar/page.tsx
"use client";

import { useState, FormEvent, ChangeEvent } from 'react'; // Adicionado ChangeEvent
import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import { IMaskInput } from 'react-imask';
import {
    MdPersonAddAlt1, MdSave, MdArrowBack, MdErrorOutline, MdCheckCircle, MdInfo, MdHome, MdLocationOn, MdPhone, MdEmail as MdEmailIcon, MdWork, MdBadge, MdCalendarToday
} from 'react-icons/md';
import { User, Mail, MapPin, Briefcase, Text as LucideText, Calendar as CalendarIcon } from 'lucide-react';
import { ClienteRequestDto, EstadoCivilType, SexoType, EnderecoRequestDto, ContatoRequestDto } from '@/types/cliente'; // Ajuste o path
import { ClienteService } from '@/services/ClienteService'; // Ajuste o path

const cleanMaskedValue = (value: string): string => value.replace(/\D/g, '');

export default function CadastrarClientePage() {
    const today = new Date().toISOString().split('T')[0];

    const initialEnderecoState: EnderecoRequestDto = {
        cep: "",
        numero: 0,
        complemento: "",
        observacao: "",
        logradouro: "", // Adicionado
        bairro: "",     // Adicionado
        cidade: "",     // Adicionado
        estado: "",     // Adicionado
        pais: "Brasil", // Adicionado
    };

    const initialContatoState: ContatoRequestDto = {
        email: "",
        ddd: 0,
        ddi: 55, // Default DDI Brasil
        telefone1: "",
        telefone2: "",
        telefone3: "",
        celular: "",
        outro: "",
        observacao: "",
    };

    const initialClienteState: ClienteRequestDto = {
        nome: "",
        sobrenome: "",
        sexo: "M",
        dataNascimento: "",
        cpf: "",
        profissao: "",
        estadoCivil: "Solteiro",
        enderecoRequestDto: initialEnderecoState,
        contatoRequestDto: initialContatoState,
    };

    const [formData, setFormData] = useState<ClienteRequestDto>(initialClienteState);
    const [tipoDocumentoDisplay, setTipoDocumentoDisplay] = useState("CPF"); // Para máscara
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Estados para campos do ViaCEP (apenas para exibição, são parte do formData.enderecoRequestDto)
    // Estes podem ser removidos se formData.enderecoRequestDto for usado diretamente para os inputs readonly

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const nameParts = name.split('.');

        if (nameParts.length === 2) {
            const [parentKey, childKey] = nameParts as [keyof ClienteRequestDto, string];
            setFormData(prev => {
                const parentObject = prev[parentKey] as any;
                let numericValue: string | number = value;
                if (childKey === 'numero' || childKey === 'ddd' || childKey === 'ddi') {
                    numericValue = parseInt(value, 10);
                    if (isNaN(numericValue)) numericValue = 0; // Default para 0 se não for número válido
                }

                return {
                    ...prev,
                    [parentKey]: {
                        ...parentObject,
                        [childKey]: numericValue
                    }
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
                [parentKey]: {
                    ...((prev[parentKey] as any) || {}),
                    [childKey]: maskedValue
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name as keyof ClienteRequestDto]: maskedValue }));
        }
    };


    const resetForm = () => {
        setFormData({ ...initialClienteState });
        setTipoDocumentoDisplay("CPF");
        setError(null);
        setSuccess(null);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        const clienteDataToSend: ClienteRequestDto = {
            ...formData,
            cpf: cleanMaskedValue(formData.cpf), // Limpa CPF
            contatoRequestDto: {
                ...formData.contatoRequestDto,
                celular: cleanMaskedValue(formData.contatoRequestDto.celular), // Limpa Celular
                // ddd, ddi já são numbers
            },
            enderecoRequestDto: {
                ...formData.enderecoRequestDto,
                cep: cleanMaskedValue(formData.enderecoRequestDto.cep), // Limpa CEP
                // numero já é number
            }
        };

        console.log("Enviando para API (Cliente):", JSON.stringify(clienteDataToSend, null, 2));


        try {
            const response = await ClienteService.create(clienteDataToSend);
            setSuccess(`✅ Cliente "${response.nome} ${response.sobrenome}" (ID: ${response.idCliente}) cadastrado com sucesso!`);
            resetForm();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            const apiError = err.response?.data;
            if (apiError && typeof apiError === 'object') {
                // Se for erro de validação do ASP.NET Core com ModelState
                if (apiError.errors) {
                    const messages = Object.values(apiError.errors).flat().join('; ');
                    setError(`❌ Erro de validação: ${messages}`);
                } else if (apiError.message) {
                    setError(`❌ ${apiError.message}`);
                } else {
                    setError(`❌ ${JSON.stringify(apiError)}`);
                }
            } else if (err.message) {
                setError(`❌ ${err.message}`);
            } else {
                setError('Falha ao cadastrar cliente. Verifique os dados e tente novamente.');
            }
            console.error("Erro detalhado:", err.response || err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCepDetails = async (cepValue: string) => {
        const cleanCep = cleanMaskedValue(cepValue);
        if (cleanCep.length === 8) {
            setError(null); // Limpa erros de CEP anteriores
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                if (!response.ok) throw new Error(`Erro HTTP ${response.status} ao buscar CEP.`);
                const data = await response.json();
                if (data.erro) {
                    throw new Error("CEP não encontrado ou inválido.");
                }
                setFormData(prev => ({
                    ...prev,
                    enderecoRequestDto: {
                        ...prev.enderecoRequestDto,
                        cep: cepValue, // Mantém o CEP com máscara no input
                        logradouro: data.logradouro || '',
                        bairro: data.bairro || '',
                        cidade: data.localidade || '',
                        estado: data.uf || '',
                        pais: 'Brasil', // ViaCEP é para Brasil
                    }
                }));
            } catch (err: any) {
                setError(`Erro ViaCEP: ${err.message}`);
                // Limpa campos do endereço se o CEP for inválido
                setFormData(prev => ({
                    ...prev,
                    enderecoRequestDto: {
                        ...prev.enderecoRequestDto,
                        logradouro: '',
                        bairro: '',
                        cidade: '',
                        estado: '',
                        pais: 'Brasil',
                    }
                }));
            }
        } else if (cleanCep.length === 0) {
            // Limpa campos do endereço se o CEP for apagado
            setFormData(prev => ({
                ...prev,
                enderecoRequestDto: {
                    ...prev.enderecoRequestDto,
                    logradouro: '',
                    bairro: '',
                    cidade: '',
                    estado: '',
                    pais: 'Brasil',
                }
            }));
            setError(null);
        }
    };

    const handleCepChange = (maskedValue: string) => {
        handleMaskedChange('enderecoRequestDto.cep', maskedValue);
        fetchCepDetails(maskedValue);
    };


    const cpfMask = "000.000.000-00";
    // CNPJ não é usado no C# model Cliente.Cpf
    // const cnpjMask = "00.000.000/0000-00";

    return (
        <>
            <NavBar active="clientes-cadastrar" />
            <main className="flex items-center justify-center min-h-screen bg-black text-white px-4 py-10">
                <div className="bg-[var(--color-mottu-default)] p-6 md:p-8 m-4 rounded-lg shadow-xl w-full max-w-4xl">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center flex items-center justify-center text-white">
                        <MdPersonAddAlt1 className="inline-block mr-2 text-3xl" />
                        Cadastrar Cliente
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

                    <form onSubmit={handleSubmit}>
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
                                        {/* Se "H" for necessário, adicione <option value="H">Outro/Homem (conforme regra C#)</option> */}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="dataNascimento" className="block mb-1 flex items-center gap-1 text-white"><CalendarIcon size={16} /> Nascimento:</label>
                                    <input type="date" id="dataNascimento" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} required className="w-full p-2 rounded bg-white text-slate-900 border border-gray-300 focus:ring-sky-500 date-input-fix h-10" />
                                </div>
                                {/* CPF - Removido seletor de tipo de documento pois C# Cliente.Cpf é string(11) */}
                                <div>
                                    <label htmlFor="cpf" className="block mb-1 flex items-center gap-1 text-white"><MdBadge size={16} /> CPF:</label>
                                    <IMaskInput
                                        id="cpf"
                                        name="cpf"
                                        mask={cpfMask}
                                        unmask={false} // Mantenha a máscara no input
                                        value={formData.cpf}
                                        onAccept={(value) => handleMaskedChange('cpf', value)}
                                        required
                                        placeholder="000.000.000-00"
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
                                        <option value="Viúvo">Viúvo</option> {/* Corrigido de Viuvo para Viúvo */}
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
                                        id="celular"
                                        name="contatoRequestDto.celular"
                                        mask="(00) 00000-0000"
                                        unmask={false}
                                        value={formData.contatoRequestDto.celular}
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
                                {/* Opcionais */}
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
                                        id="cep"
                                        name="enderecoRequestDto.cep"
                                        mask="00000-000"
                                        unmask={false}
                                        value={formData.enderecoRequestDto.cep}
                                        onAccept={(value) => handleCepChange(value)} // Usa o handler customizado
                                        required
                                        placeholder="00000-000"
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
                                    <input type="text" id="logradouro" name="enderecoRequestDto.logradouro" value={formData.enderecoRequestDto.logradouro || ''} onChange={handleChange} required={!formData.enderecoRequestDto.cep} readOnly={!!formData.enderecoRequestDto.cep && !!formData.enderecoRequestDto.logradouro} className={`w-full p-2 rounded border border-gray-300 h-10 ${formData.enderecoRequestDto.cep && formData.enderecoRequestDto.logradouro ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white text-slate-900'}`} />
                                </div>
                                <div>
                                    <label htmlFor="bairro" className="block mb-1 flex items-center gap-1 text-white"><MdLocationOn size={16} /> Bairro:</label>
                                    <input type="text" id="bairro" name="enderecoRequestDto.bairro" value={formData.enderecoRequestDto.bairro || ''} onChange={handleChange} required={!formData.enderecoRequestDto.cep} readOnly={!!formData.enderecoRequestDto.cep && !!formData.enderecoRequestDto.bairro} className={`w-full p-2 rounded border border-gray-300 h-10 ${formData.enderecoRequestDto.cep && formData.enderecoRequestDto.bairro ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white text-slate-900'}`} />
                                </div>
                                <div>
                                    <label htmlFor="cidade" className="block mb-1 flex items-center gap-1 text-white"><MdLocationOn size={16} /> Cidade:</label>
                                    <input type="text" id="cidade" name="enderecoRequestDto.cidade" value={formData.enderecoRequestDto.cidade || ''} onChange={handleChange} required={!formData.enderecoRequestDto.cep} readOnly={!!formData.enderecoRequestDto.cep && !!formData.enderecoRequestDto.cidade} className={`w-full p-2 rounded border border-gray-300 h-10 ${formData.enderecoRequestDto.cep && formData.enderecoRequestDto.cidade ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white text-slate-900'}`} />
                                </div>
                                <div>
                                    <label htmlFor="estado" className="block mb-1 flex items-center gap-1 text-white"><MdLocationOn size={16} /> Estado (UF):</label>
                                    <input type="text" id="estado" name="enderecoRequestDto.estado" value={formData.enderecoRequestDto.estado || ''} onChange={handleChange} required={!formData.enderecoRequestDto.cep} readOnly={!!formData.enderecoRequestDto.cep && !!formData.enderecoRequestDto.estado} maxLength={2} className={`w-full p-2 rounded border border-gray-300 h-10 ${formData.enderecoRequestDto.cep && formData.enderecoRequestDto.estado ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white text-slate-900'}`} />
                                </div>
                                <div>
                                    <label htmlFor="pais" className="block mb-1 flex items-center gap-1 text-white"><MdLocationOn size={16} /> País:</label>
                                    <input type="text" id="pais" name="enderecoRequestDto.pais" value={formData.enderecoRequestDto.pais || 'Brasil'} onChange={handleChange} required readOnly={!!formData.enderecoRequestDto.cep && formData.enderecoRequestDto.pais === 'Brasil'} className={`w-full p-2 rounded border border-gray-300 h-10 ${formData.enderecoRequestDto.cep && formData.enderecoRequestDto.pais === 'Brasil' ? 'bg-gray-100 text-gray-700 cursor-not-allowed' : 'bg-white text-slate-900'}`} />
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
                                className={`flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-[var(--color-mottu-dark)] rounded-md shadow hover:bg-opacity-80 transition-colors duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={isLoading}
                            >
                                <MdSave size={20} /> {isLoading ? 'Salvando...' : 'Salvar Cliente'}
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
                .date-input-fix::-webkit-calendar-picker-indicator { cursor: pointer; filter: invert(0.1); } /* Ajuste do filtro para inputs brancos */
                input[type="date"]:required:invalid::-webkit-datetime-edit { color: transparent; }
                input[type="date"]:focus::-webkit-datetime-edit { color: #1e293b !important; } /* text-slate-900 */
                input[type="date"]::-webkit-datetime-edit { color: #1e293b; } /* text-slate-900 */
            `}</style>
        </>
    );
}