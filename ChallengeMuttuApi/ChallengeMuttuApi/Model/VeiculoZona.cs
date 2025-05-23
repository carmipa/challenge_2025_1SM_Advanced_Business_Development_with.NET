// Path: ChallengeMuttuApi/Model/VeiculoZona.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChallengeMuttuApi.Model
{
    /// <summary>
    /// Representa a tabela de ligação "TB_VEICULOZONA" no banco de dados.
    /// Estabelece o relacionamento muitos-para-muitos entre Veículo e Zona.
    /// A chave primária desta tabela é composta pelos IDs de Veículo e Zona.
    /// </summary>
    [Table("TB_VEICULOZONA")]
    public class VeiculoZona
    {
        /// <summary>
        /// Obtém ou define o ID do Veículo que faz parte da chave composta.
        /// Mapeia para a coluna "TB_VEICULO_ID_VEICULO" (Parte da Chave Primária Composta).
        /// </summary>
        [Column("TB_VEICULO_ID_VEICULO")]
        [Required]
        public int TbVeiculoIdVeiculo { get; set; }

        /// <summary>
        /// Obtém ou define o ID da Zona que faz parte da chave composta.
        /// Mapeia para a coluna "TB_ZONA_ID_ZONA" (Parte da Chave Primária Composta).
        /// </summary>
        [Column("TB_ZONA_ID_ZONA")]
        [Required]
        public int TbZonaIdZona { get; set; }

        // Propriedades de Navegação (para Entity Framework Core)

        /// <summary>
        /// Propriedade de navegação para a entidade Veículo associada.
        /// </summary>
        [ForeignKey("TbVeiculoIdVeiculo")]
        public Veiculo? Veiculo { get; set; }

        /// <summary>
        /// Propriedade de navegação para a entidade Zona associada.
        /// </summary>
        [ForeignKey("TbZonaIdZona")]
        public Zona? Zona { get; set; }
    }
}