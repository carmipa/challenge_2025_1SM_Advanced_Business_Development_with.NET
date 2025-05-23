// Path: ChallengeMuttuApi/Model/Box.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChallengeMuttuApi.Model
{
    /// <summary>
    /// Representa a entidade Box no banco de dados, mapeando para a tabela "TB_BOX".
    /// Armazena informações sobre caixas ou compartimentos, como nome, status e datas.
    /// </summary>
    [Table("TB_BOX")]
    public class Box
    {
        /// <summary>
        /// Construtor padrão da classe Box.
        /// Inicializa propriedades de string não anuláveis para evitar warnings CS8618.
        /// </summary>
        public Box()
        {
            Nome = string.Empty;
            Status = false; // Valor padrão para status (Inativo)
        }

        /// <summary>
        /// Obtém ou define o identificador único do Box.
        /// Mapeia para a coluna "ID_BOX" (Chave Primária, gerada por identidade).
        /// </summary>
        [Key]
        [Column("ID_BOX")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)] // Indica que o valor é gerado pelo banco de dados (coluna IDENTITY)
        public int IdBox { get; set; }

        /// <summary>
        /// Obtém ou define o nome do Box.
        /// Mapeia para a coluna "NOME" (VARCHAR2(50 BYTE), Obrigatório).
        /// </summary>
        [Column("NOME")]
        [Required(ErrorMessage = "O nome do Box é obrigatório.")]
        [StringLength(50, ErrorMessage = "O nome do Box deve ter no máximo 50 caracteres.")]
        public string Nome { get; set; }

        /// <summary>
        /// Obtém ou define o status atual do Box.
        /// Mapeia para a coluna "STATUS" (VARCHAR2(1 CHAR), Obrigatório) no banco de dados,
        /// convertido para bool (true para Ativo ('A'), false para Inativo ('I')).
        /// </summary>
        [Column("STATUS")]
        [Required(ErrorMessage = "O status do Box é obrigatório.")]
        public bool Status { get; set; }

        /// <summary>
        /// Obtém ou define a data de entrada do Box.
        /// Mapeia para a coluna "DATA_ENTRADA" (DATE, Obrigatório).
        /// </summary>
        [Column("DATA_ENTRADA")]
        [Required(ErrorMessage = "A data de entrada é obrigatória.")]
        public DateTime DataEntrada { get; set; }

        /// <summary>
        /// Obtém ou define a data de saída do Box.
        /// Mapeia para a coluna "DATA_SAIDA" (DATE, Obrigatório).
        /// </summary>
        [Column("DATA_SAIDA")]
        [Required(ErrorMessage = "A data de saída é obrigatória.")]
        public DateTime DataSaida { get; set; }

        /// <summary>
        /// Obtém ou define observações adicionais sobre o Box.
        /// Mapeia para a coluna "OBSERVACAO" (VARCHAR2(100 BYTE), Opcional).
        /// </summary>
        [Column("OBSERVACAO")]
        [StringLength(100, ErrorMessage = "As observações devem ter no máximo 100 caracteres.")]
        public string? Observacao { get; set; } // "?" indica que a propriedade pode ser nula

        /// <summary>
        /// Coleção de entidades PatioBox, representando o relacionamento muitos-para-muitos com Pátios.
        /// </summary>
        public ICollection<PatioBox>? PatioBoxes { get; set; }

        /// <summary>
        /// Coleção de entidades VeiculoBox, representando o relacionamento muitos-para-muitos com Veículos.
        /// </summary>
        public ICollection<VeiculoBox>? VeiculoBoxes { get; set; }

        /// <summary>
        /// Coleção de entidades ZonaBox, representando o relacionamento muitos-para-muitos com Zonas.
        /// </summary>
        public ICollection<ZonaBox>? ZonaBoxes { get; set; }
    }
}