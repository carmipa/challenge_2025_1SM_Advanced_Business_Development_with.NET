// Path: ChallengeMuttuApi/Model/ZonaBox.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChallengeMuttuApi.Model
{
    /// <summary>
    /// Representa a tabela de ligação "TB_ZONABOX" no banco de dados.
    /// Estabelece o relacionamento muitos-para-muitos entre Zona e Box.
    /// A chave primária desta tabela é composta pelos IDs de Zona e Box.
    /// </summary>
    [Table("TB_ZONABOX")]
    public class ZonaBox
    {
        /// <summary>
        /// Obtém ou define o ID da Zona que faz parte da chave composta.
        /// Mapeia para a coluna "TB_ZONA_ID_ZONA" (Parte da Chave Primária Composta).
        /// </summary>
        [Column("TB_ZONA_ID_ZONA")]
        [Required]
        public int TbZonaIdZona { get; set; }

        /// <summary>
        /// Obtém ou define o ID do Box que faz parte da chave composta.
        /// Mapeia para a coluna "TB_BOX_ID_BOX" (Parte da Chave Primária Composta).
        /// </summary>
        [Column("TB_BOX_ID_BOX")]
        [Required]
        public int TbBoxIdBox { get; set; }

        // Propriedades de Navegação (para Entity Framework Core)

        /// <summary>
        /// Propriedade de navegação para a entidade Zona associada.
        /// </summary>
        [ForeignKey("TbZonaIdZona")]
        public Zona? Zona { get; set; }

        /// <summary>
        /// Propriedade de navegação para a entidade Box associada.
        /// </summary>
        [ForeignKey("TbBoxIdBox")]
        public Box? Box { get; set; }
    }
}