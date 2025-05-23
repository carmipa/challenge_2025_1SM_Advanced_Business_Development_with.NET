// Path: ChallengeMuttuApi/Model/Endereco.cs - Este arquivo deve estar na pasta 'Model'
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChallengeMuttuApi.Model
{
    /// <summary>
    /// Representa a entidade Endereço no banco de dados, mapeando para a tabela "TB_ENDERECO".
    /// Contém detalhes de um endereço como CEP, logradouro, cidade, estado, etc.
    /// </summary>
    [Table("TB_ENDERECO")]
    public class Endereco
    {
        /// <summary>
        /// Construtor padrão da classe Endereco.
        /// Inicializa propriedades de string não anuláveis para evitar warnings CS8618.
        /// </summary>
        public Endereco()
        {
            Cep = string.Empty;
            Logradouro = string.Empty;
            Bairro = string.Empty;
            Cidade = string.Empty;
            Estado = string.Empty;
            Pais = string.Empty;
        }

        /// <summary>
        /// Obtém ou define o identificador único do Endereço.
        /// Mapeia para a coluna "ID_ENDERECO" (Chave Primária, gerada por identidade).
        /// </summary>
        [Key]
        [Column("ID_ENDERECO")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IdEndereco { get; set; }

        /// <summary>
        /// Obtém ou define o CEP (Código de Endereçamento Postal) do endereço.
        /// Mapeia para a coluna "CEP" (VARCHAR2(9 CHAR), Obrigatório).
        /// </summary>
        [Column("CEP")]
        [Required(ErrorMessage = "O CEP é obrigatório.")]
        [StringLength(9, ErrorMessage = "O CEP deve ter no máximo 9 caracteres.")]
        public string Cep { get; set; }

        /// <summary>
        /// Obtém ou define o número do endereço.
        /// Mapeia para a coluna "NUMERO" (NUMBER(7,0), Obrigatório).
        /// </summary>
        [Column("NUMERO")]
        [Required(ErrorMessage = "O Número é obrigatório.")]
        public int Numero { get; set; }

        /// <summary>
        /// Obtém ou define o nome do logradouro (rua, avenida, etc.).
        /// Mapeia para a coluna "LOGRADOURO" (VARCHAR2(50 BYTE), Obrigatório).
        /// </summary>
        [Column("LOGRADOURO")]
        [Required(ErrorMessage = "O Logradouro é obrigatório.")]
        [StringLength(50, ErrorMessage = "O Logradouro deve ter no máximo 50 caracteres.")]
        public string Logradouro { get; set; }

        /// <summary>
        /// Obtém ou define o nome do bairro.
        /// Mapeia para a coluna "BAIRRO" (VARCHAR2(50 BYTE), Obrigatório).
        /// </summary>
        [Column("BAIRRO")]
        [Required(ErrorMessage = "O Bairro é obrigatório.")]
        [StringLength(50, ErrorMessage = "O Bairro deve ter no máximo 50 caracteres.")]
        public string Bairro { get; set; }

        /// <summary>
        /// Obtém ou define o nome da cidade.
        /// Mapeia para a coluna "CIDADE" (VARCHAR2(50 BYTE), Obrigatório).
        /// </summary>
        [Column("CIDADE")]
        [Required(ErrorMessage = "A Cidade é obrigatória.")]
        [StringLength(50, ErrorMessage = "A Cidade deve ter no máximo 50 caracteres.")]
        public string Cidade { get; set; }

        /// <summary>
        /// Obtém ou define a sigla do estado (UF).
        /// Mapeia para a coluna "ESTADO" (VARCHAR2(2 CHAR), Obrigatório).
        /// </summary>
        [Column("ESTADO")]
        [Required(ErrorMessage = "O Estado é obrigatório.")]
        [StringLength(2, ErrorMessage = "O Estado deve ter 2 caracteres (sigla).")]
        public string Estado { get; set; }

        /// <summary>
        /// Obtém ou define o nome do país.
        /// Mapeia para a coluna "PAIS" (VARCHAR2(50 BYTE), Obrigatório).
        /// </summary>
        [Column("PAIS")]
        [Required(ErrorMessage = "O País é obrigatório.")]
        [StringLength(50, ErrorMessage = "O País deve ter no máximo 50 caracteres.")]
        public string Pais { get; set; }

        /// <summary>
        /// Obtém ou define o complemento do endereço (ex: apartamento, bloco).
        /// Mapeia para a coluna "COMPLEMENTO" (VARCHAR2(60 BYTE), Opcional).
        /// </summary>
        [Column("COMPLEMENTO")]
        [StringLength(60, ErrorMessage = "O Complemento deve ter no máximo 60 caracteres.")]
        public string? Complemento { get; set; }

        /// <summary>
        /// Obtém ou define observações adicionais sobre o endereço.
        /// Mapeia para a coluna "OBSERVACAO" (VARCHAR2(200 BYTE), Opcional).
        /// </summary>
        [Column("OBSERVACAO")]
        [StringLength(200, ErrorMessage = "As observações devem ter no máximo 200 caracteres.")]
        public string? Observacao { get; set; }

        // Propriedades de Navegação (para Entity Framework Core)

        /// <summary>
        /// Coleção de entidades Cliente associadas a este Endereço.
        /// Representa o relacionamento um-para-muitos onde um Endereço pode ser associado a múltiplos Clientes.
        /// </summary>
        public ICollection<Cliente>? Clientes { get; set; }

        /// <summary>
        /// Coleção de entidades EnderecoPatio, representando o relacionamento muitos-para-muitos com Pátios.
        /// </summary>
        public ICollection<EnderecoPatio>? EnderecoPatios { get; set; }
    }
}