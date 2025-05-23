// Path: ChallengeMuttuApi/Model/Cliente.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ChallengeMuttuApi.Enums;
using System.Linq; // Necessário para .All(char.IsDigit)

namespace ChallengeMuttuApi.Model
{
    [Table("TB_CLIENTE")]
    public class Cliente
    {
        // Campos de apoio para propriedades 'required' com setters customizados
        private string _sexo = null!; // Diz ao compilador que será inicializado (via 'required' ou EF Core)
        private string _cpf = null!;  // Diz ao compilador que será inicializado

        // Campo de apoio para EstadoCivil, se necessário para lógica complexa no setter (como no seu código original)
        private EstadoCivil _estadoCivil;

        /// <summary>
        /// Construtor padrão da classe Cliente.
        /// Inicializa propriedades de string não anuláveis e não 'required' para evitar warnings CS8618.
        /// Propriedades 'required' (Nome, Sexo, Cpf) são responsabilidade do código que instancia o objeto.
        /// </summary>
        public Cliente()
        {
            // Propriedades 'required' (Nome, Sexo, Cpf) NÃO são inicializadas aqui,
            // pois o modificador 'required' garante que o chamador as fornecerá.
            // O EF Core também lida com a população dessas propriedades.

            // Inicializa propriedades NÃO 'required' e NÃO anuláveis
            Sobrenome = string.Empty;
            Profissao = string.Empty;
            DataCadastro = DateTime.UtcNow; // Usar UtcNow para consistência
            // EstadoCivil (enum) e DataNascimento (DateTime) terão seus valores padrão se não definidos.
            // TbEnderecoIdEndereco e TbContatoIdContato (int) terão valor padrão 0.
        }

        [Key]
        [Column("ID_CLIENTE")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IdCliente { get; set; }

        [Column("DATA_CADASTRO")]
        [Required(ErrorMessage = "A data de cadastro é obrigatória.")]
        public DateTime DataCadastro { get; set; } // Já inicializada no construtor

        [Column("SEXO")]
        [Required(ErrorMessage = "O Sexo é obrigatório.")]
        [StringLength(2, ErrorMessage = "O Sexo deve ter no máximo 2 caracteres.")]
        public required string Sexo
        {
            get => _sexo;
            set
            {
                // DDL CHECK (SEXO IN ('M', 'H', 'MH')) [cite: 43]
                // O frontend envia 'M' ou 'F'. Ajuste se 'H' ou 'MH' forem cenários válidos.
                string upperValue = value?.ToUpperInvariant() ?? string.Empty;
                if (upperValue == "M" || upperValue == "F" || upperValue == "H" || upperValue == "MH") // Incluindo MH conforme DDL
                    _sexo = upperValue;
                else
                    throw new ArgumentException("Sexo inválido! Use 'M' (Masculino), 'F' (Feminino), 'H' (Outro/Não especificado) ou 'MH'.", nameof(Sexo));
            }
        }

        [Column("NOME")]
        [Required(ErrorMessage = "O Nome é obrigatório.")]
        [StringLength(100, ErrorMessage = "O Nome deve ter no máximo 100 caracteres.")]
        public required string Nome { get; set; }

        [Column("SOBRENOME")]
        [Required(ErrorMessage = "O Sobrenome é obrigatório.")] // Adicionado Required baseado no DDL NOT NULL [cite: 5]
        [StringLength(100, ErrorMessage = "O Sobrenome deve ter no máximo 100 caracteres.")]
        public string Sobrenome { get; set; } // Inicializado no construtor

        [Column("DATA_NASCIMENTO")]
        [Required(ErrorMessage = "A Data de Nascimento é obrigatória.")]
        public DateTime DataNascimento { get; set; }

        [Column("CPF")]
        [Required(ErrorMessage = "O CPF é obrigatório.")]
        [StringLength(11, MinimumLength = 11, ErrorMessage = "O CPF deve ter exatamente 11 dígitos.")]
        public required string Cpf
        {
            get => _cpf;
            set
            {
                // Limpa qualquer formatação (pontos, traços) antes de validar e armazenar
                var cleanedValue = new string((value ?? string.Empty).Where(char.IsDigit).ToArray());
                if (cleanedValue.Length == 11) // Não precisa mais do .All(char.IsDigit) pois já filtramos
                    _cpf = cleanedValue;
                else
                    throw new ArgumentException("CPF inválido! Deve conter 11 dígitos numéricos após remoção de formatação.", nameof(Cpf));
            }
        }

        [Column("PROFISSAO")]
        [Required(ErrorMessage = "A Profissão é obrigatória.")] // Adicionado Required baseado no DDL NOT NULL [cite: 5]
        [StringLength(50, ErrorMessage = "A Profissão deve ter no máximo 50 caracteres.")]
        public string Profissao { get; set; } // Inicializado no construtor

        [Column("ESTADO_CIVIL")]
        [Required(ErrorMessage = "O Estado Civil é obrigatório.")]
        [StringLength(50)] // O EnumDataType já valida os valores, mas StringLength pode ser mantido
        // [EnumDataType(typeof(EstadoCivil), ErrorMessage = "Estado civil inválido!")] // Esta validação é boa para model binding
        public EstadoCivil EstadoCivil // A conversão para string é feita no AppDbContext
        {
            get => _estadoCivil;
            set
            {
                // A validação com Enum.IsDefined é boa se o tipo no banco for NUMBER e mapeado para int no C#.
                // Como está mapeado para string no banco (VARCHAR2(50 CHAR)) e a conversão é feita no AppDbContext,
                // o setter aqui pode apenas atribuir, confiando na conversão e na constraint do banco.
                // No entanto, para consistência com seu código original, manteremos a validação.
                if (!Enum.IsDefined(typeof(EstadoCivil), value)) // DDL CK_CLIENTE_ESTADO_CIVIL valida os valores string [cite: 44]
                    throw new ArgumentException("Estado civil inválido!", nameof(EstadoCivil));
                _estadoCivil = value;
            }
        }

        [Column("TB_ENDERECO_ID_ENDERECO")]
        [Required(ErrorMessage = "O ID do Endereço é obrigatório.")]
        public int TbEnderecoIdEndereco { get; set; }

        [Column("TB_CONTATO_ID_CONTATO")]
        [Required(ErrorMessage = "O ID do Contato é obrigatório.")]
        public int TbContatoIdContato { get; set; }

        [ForeignKey("TbEnderecoIdEndereco")]
        public Endereco? Endereco { get; set; }

        [ForeignKey("TbContatoIdContato")]
        public Contato? Contato { get; set; }

        public ICollection<ClienteVeiculo>? ClienteVeiculos { get; set; }

        // Construtor parametrizado.
        // Com membros 'required', este construtor precisaria do atributo [SetsRequiredMembers]
        // se ele próprio inicializasse TODOS os membros 'required'.
        // No entanto, é mais comum usar inicializadores de objeto com membros 'required'.
        // Se você mantiver este construtor, certifique-se de que ele chame os setters das propriedades 'required'.
        [System.Diagnostics.CodeAnalysis.SetsRequiredMembers] // Adicionado para indicar que os required são setados
        public Cliente(int idCliente, string nome, string sobrenome, string sexo, string cpf,
                               string profissao, EstadoCivil estadoCivil, DateTime dataNascimento,
                               int tbEnderecoIdEndereco, int tbContatoIdContato)
        {
            IdCliente = idCliente;
            Nome = nome; // Setter de 'required' é chamado
            Sobrenome = sobrenome;
            Profissao = profissao;
            EstadoCivil = estadoCivil; // Setter de enum é chamado
            DataNascimento = dataNascimento;
            DataCadastro = DateTime.UtcNow; // Use UtcNow
            Sexo = sexo;   // Setter de 'required' é chamado
            Cpf = cpf;     // Setter de 'required' é chamado
            TbEnderecoIdEndereco = tbEnderecoIdEndereco;
            TbContatoIdContato = tbContatoIdContato;
        }
    }
}