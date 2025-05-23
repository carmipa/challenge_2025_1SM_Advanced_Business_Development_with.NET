// Path: ChallengeMuttuApi/Model/Zona.cs - Este arquivo deve estar na pasta 'Model'
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChallengeMuttuApi.Model
{
    /// <summary>
    /// Representa a entidade Zona no banco de dados, mapeando para a tabela "TB_ZONA".
    /// Descreve uma área ou zona específica, com nome, datas de entrada/saída e observações.
    /// </summary>
    [Table("TB_ZONA")]
    public class Zona
    {
        /// <summary>
        /// Construtor padrão da classe Zona.
        /// Inicializa propriedades de string não anuláveis para evitar warnings CS8618.
        /// </summary>
        public Zona()
        {
            Nome = string.Empty;
        }

        /// <summary>
        /// Obtém ou define o identificador único da Zona.
        /// Mapeia para a coluna "ID_ZONA" (Chave Primária, gerada por identidade).
        /// </summary>
        [Key]
        [Column("ID_ZONA")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IdZona { get; set; }

        /// <summary>
        /// Obtém ou define o nome da Zona.
        /// Mapeia para a coluna "NOME" (VARCHAR2(50 BYTE), Obrigatório).
        /// </summary>
        [Column("NOME")]
        [Required(ErrorMessage = "O nome da Zona é obrigatório.")]
        [StringLength(50, ErrorMessage = "O nome da Zona deve ter no máximo 50 caracteres.")]
        public string Nome { get; set; }

        /// <summary>
        /// Obtém ou define a data de entrada na Zona.
        /// Mapeia para a coluna "DATA_ENTRADA" (DATE, Obrigatório).
        /// </summary>
        [Column("DATA_ENTRADA")]
        [Required(ErrorMessage = "A data de entrada é obrigatória.")]
        public DateTime DataEntrada { get; set; }

        /// <summary>
        /// Obtém ou define a data de saída da Zona.
        /// Mapeia para a coluna "DATA_SAIDA" (DATE, Obrigatório).
        /// </summary>
        [Column("DATA_SAIDA")]
        [Required(ErrorMessage = "A data de saída é obrigatória.")]
        public DateTime DataSaida { get; set; }

        /// <summary>
        /// Obtém ou define observações adicionais sobre a Zona.
        /// Mapeia para a coluna "OBSERVACAO" (VARCHAR2(100 BYTE), Opcional).
        /// </summary>
        [Column("OBSERVACAO")]
        [StringLength(100, ErrorMessage = "As observações devem ter no máximo 100 caracteres.")]
        public string? Observacao { get; set; }

        // Propriedades de Navegação para tabelas de ligação

        /// <summary>
        /// Coleção de entidades VeiculoZona, representando o relacionamento muitos-para-muitos com Veículos.
        /// </summary>
        public ICollection<VeiculoZona>? VeiculoZonas { get; set; }

        /// <summary>
        /// Coleção de entidades ZonaBox, representando o relacionamento muitos-para-muitos com Boxes.
        /// </summary>
        public ICollection<ZonaBox>? ZonaBoxes { get; set; }

        /// <summary>
        /// Coleção de entidades ZonaPatio, representando o relacionamento muitos-para-muitos com Pátios.
        /// </summary>
        public ICollection<ZonaPatio>? ZonaPatios { get; set; }
    }
}