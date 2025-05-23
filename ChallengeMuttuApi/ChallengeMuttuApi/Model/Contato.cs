// Path: ChallengeMuttuApi/Model/Contato.cs - Este arquivo deve estar na pasta 'Model'
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChallengeMuttuApi.Model
{
    /// <summary>
    /// Representa a entidade Contato no banco de dados, mapeando para a tabela "TB_CONTATO".
    /// Contém informações de contato como e-mail, telefones e observações.
    /// </summary>
    [Table("TB_CONTATO")]
    public class Contato
    {
        /// <summary>
        /// Construtor padrão da classe Contato.
        /// Inicializa propriedades de string não anuláveis para evitar warnings CS8618.
        /// </summary>
        public Contato()
        {
            Email = string.Empty;
            Telefone1 = string.Empty;
            Celular = string.Empty;
        }

        /// <summary>
        /// Obtém ou define o identificador único do Contato.
        /// Mapeia para a coluna "ID_CONTATO" (Chave Primária, gerada por identidade).
        /// </summary>
        [Key]
        [Column("ID_CONTATO")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IdContato { get; set; }

        /// <summary>
        /// Obtém ou define o endereço de e-mail principal do contato.
        /// Mapeia para a coluna "EMAIL" (VARCHAR2(100 BYTE), Obrigatório).
        /// </summary>
        [Column("EMAIL")]
        [Required(ErrorMessage = "O e-mail é obrigatório.")]
        [StringLength(100, ErrorMessage = "O e-mail deve ter no máximo 100 caracteres.")]
        [EmailAddress(ErrorMessage = "Formato de e-mail inválido.")] // Atributo para validação de formato de e-mail
        public string Email { get; set; }

        /// <summary>
        /// Obtém ou define o DDD (Código de Discagem Direta a Distância) do telefone principal.
        /// Mapeia para a coluna "DDD" (NUMBER(4,0), Obrigatório).
        /// Possui validação de range entre 11 e 99.
        /// </summary>
        [Column("DDD")]
        [Required(ErrorMessage = "O DDD é obrigatório.")]
        [Range(11, 99, ErrorMessage = "O DDD deve ser entre 11 e 99.")] // Baseado na CHECK constraint do DDL
        public int Ddd { get; set; }

        /// <summary>
        /// Obtém ou define o DDI (Código de Discagem Direta Internacional) do telefone principal.
        /// Mapeia para a coluna "DDI" (NUMBER(4,0), Obrigatório).
        /// </summary>
        [Column("DDI")]
        [Required(ErrorMessage = "O DDI é obrigatório.")]
        [Range(0, 9999, ErrorMessage = "O DDI deve ter no máximo 4 dígitos.")] // Assumindo range razoável para DDI
        public int Ddi { get; set; }

        /// <summary>
        /// Obtém ou define o primeiro número de telefone do contato.
        /// Mapeia para a coluna "TELEFONE1" (VARCHAR2(20 BYTE), Obrigatório).
        /// </summary>
        [Column("TELEFONE1")]
        [Required(ErrorMessage = "O Telefone 1 é obrigatório.")]
        [StringLength(20, ErrorMessage = "O Telefone 1 deve ter no máximo 20 caracteres.")]
        public string Telefone1 { get; set; }

        /// <summary>
        /// Obtém ou define o segundo número de telefone do contato.
        /// Mapeia para a coluna "TELEFONE2" (VARCHAR2(20 BYTE), Opcional).
        /// </summary>
        [Column("TELEFONE2")]
        [StringLength(20, ErrorMessage = "O Telefone 2 deve ter no máximo 20 caracteres.")]
        public string? Telefone2 { get; set; }

        /// <summary>
        /// Obtém ou define o terceiro número de telefone do contato.
        /// Mapeia para a coluna "TELEFONE3" (VARCHAR2(20 BYTE), Opcional).
        /// </summary>
        [Column("TELEFONE3")]
        [StringLength(20, ErrorMessage = "O Telefone 3 deve ter no máximo 20 caracteres.")]
        public string? Telefone3 { get; set; }

        /// <summary>
        /// Obtém ou define o número de celular do contato.
        /// Mapeia para a coluna "CELULAR" (VARCHAR2(20 BYTE), Obrigatório).
        /// </summary>
        [Column("CELULAR")]
        [Required(ErrorMessage = "O Celular é obrigatório.")]
        [StringLength(20, ErrorMessage = "O Celular deve ter no máximo 20 caracteres.")]
        public string Celular { get; set; }

        /// <summary>
        /// Obtém ou define outras informações de contato.
        /// Mapeia para a coluna "OUTRO" (VARCHAR2(100 BYTE), Opcional).
        /// </summary>
        [Column("OUTRO")]
        [StringLength(100, ErrorMessage = "O campo Outro deve ter no máximo 100 caracteres.")]
        public string? Outro { get; set; }

        /// <summary>
        /// Obtém ou define observações adicionais sobre o contato.
        /// Mapeia para a coluna "OBSERVACAO" (VARCHAR2(200 BYTE), Opcional).
        /// </summary>
        [Column("OBSERVACAO")]
        [StringLength(200, ErrorMessage = "As observações devem ter no máximo 200 caracteres.")]
        public string? Observacao { get; set; }

        // Propriedades de Navegação (para Entity Framework Core)

        /// <summary>
        /// Coleção de entidades Cliente associadas a este Contato.
        /// Representa o relacionamento um-para-muitos onde um Contato pode ser associado a múltiplos Clientes.
        /// </summary>
        public ICollection<Cliente>? Clientes { get; set; }

        /// <summary>
        /// Coleção de entidades ContatoPatio, representando o relacionamento muitos-para-muitos com Pátios.
        /// </summary>
        public ICollection<ContatoPatio>? ContatoPatios { get; set; }
    }
}