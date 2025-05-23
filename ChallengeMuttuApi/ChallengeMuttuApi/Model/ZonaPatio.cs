// Path: ChallengeMuttuApi/Model/ZonaPatio.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChallengeMuttuApi.Model
{
    /// <summary>
    /// Representa a tabela de ligação "TB_ZONAPATIO" no banco de dados.
    /// Estabelece o relacionamento muitos-para-muitos entre Pátio e Zona.
    /// A chave primária desta tabela é composta pelos IDs de Pátio e Zona.
    /// </summary>
    [Table("TB_ZONAPATIO")]
    public class ZonaPatio
    {
        /// <summary>
        /// Obtém ou define o ID do Pátio que faz parte da chave composta.
        /// Mapeia para a coluna "TB_PATIO_ID_PATIO" (Parte da Chave Primária Composta).
        /// </summary>
        [Column("TB_PATIO_ID_PATIO")]
        [Required]
        public int TbPatioIdPatio { get; set; }

        /// <summary>
        /// Obtém ou define o ID da Zona que faz parte da chave composta.
        /// Mapeia para a coluna "TB_ZONA_ID_ZONA" (Parte da Chave Primária Composta).
        /// </summary>
        [Column("TB_ZONA_ID_ZONA")]
        [Required]
        public int TbZonaIdZona { get; set; }

        // Propriedades de Navegação (para Entity Framework Core)

        /// <summary>
        /// Propriedade de navegação para a entidade Pátio associada.
        /// </summary>
        [ForeignKey("TbPatioIdPatio")]
        public Patio? Patio { get; set; }

        /// <summary>
        /// Propriedade de navegação para a entidade Zona associada.
        /// </summary>
        [ForeignKey("TbZonaIdZona")]
        public Zona? Zona { get; set; }
    }
}