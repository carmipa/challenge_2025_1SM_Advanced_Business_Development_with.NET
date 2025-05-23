// Path: ChallengeMuttuApi/Model/PatioBox.cs - Este arquivo deve estar na pasta 'Model'
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChallengeMuttuApi.Model
{
    /// <summary>
    /// Representa a tabela de ligação "TB_PATIOBOX" no banco de dados.
    /// Estabelece o relacionamento muitos-para-muitos entre Pátio e Box.
    /// A chave primária desta tabela é composta pelos IDs de Pátio e Box.
    /// </summary>
    [Table("TB_PATIOBOX")]
    public class PatioBox
    {
        /// <summary>
        /// Obtém ou define o ID do Pátio que faz parte da chave composta.
        /// Mapeia para a coluna "TB_PATIO_ID_PATIO" (Parte da Chave Primária Composta).
        /// </summary>
        [Column("TB_PATIO_ID_PATIO")]
        [Required]
        public int TbPatioIdPatio { get; set; }

        /// <summary>
        /// Obtém ou define o ID do Box que faz parte da chave composta.
        /// Mapeia para a coluna "TB_BOX_ID_BOX" (Parte da Chave Primária Composta).
        /// </summary>
        [Column("TB_BOX_ID_BOX")]
        [Required]
        public int TbBoxIdBox { get; set; }

        // Propriedades de Navegação (para Entity Framework Core)

        /// <summary>
        /// Propriedade de navegação para a entidade Pátio associada.
        /// </summary>
        [ForeignKey("TbPatioIdPatio")]
        public Patio? Patio { get; set; }

        /// <summary>
        /// Propriedade de navegação para a entidade Box associada.
        /// </summary>
        [ForeignKey("TbBoxIdBox")]
        public Box? Box { get; set; }
    }
}