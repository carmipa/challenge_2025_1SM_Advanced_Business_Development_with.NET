// Path: ChallengeMuttuApi/Model/VeiculoPatio.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChallengeMuttuApi.Model
{
    /// <summary>
    /// Representa a tabela de ligação "TB_VEICULOPATIO" no banco de dados.
    /// Estabelece o relacionamento muitos-para-muitos entre Veículo e Pátio.
    /// A chave primária desta tabela é composta pelos IDs de Veículo e Pátio.
    /// </summary>
    [Table("TB_VEICULOPATIO")]
    public class VeiculoPatio
    {
        /// <summary>
        /// Obtém ou define o ID do Veículo que faz parte da chave composta.
        /// Mapeia para a coluna "TB_VEICULO_ID_VEICULO" (Parte da Chave Primária Composta).
        /// </summary>
        [Column("TB_VEICULO_ID_VEICULO")]
        [Required]
        public int TbVeiculoIdVeiculo { get; set; }

        /// <summary>
        /// Obtém ou define o ID do Pátio que faz parte da chave composta.
        /// Mapeia para a coluna "TB_PATIO_ID_PATIO" (Parte da Chave Primária Composta).
        /// </summary>
        [Column("TB_PATIO_ID_PATIO")]
        [Required]
        public int TbPatioIdPatio { get; set; }

        // Propriedades de Navegação (para Entity Framework Core)

        /// <summary>
        /// Propriedade de navegação para a entidade Veículo associada.
        /// </summary>
        [ForeignKey("TbVeiculoIdVeiculo")]
        public Veiculo? Veiculo { get; set; }

        /// <summary>
        /// Propriedade de navegação para a entidade Pátio associada.
        /// </summary>
        [ForeignKey("TbPatioIdPatio")]
        public Patio? Patio { get; set; }
    }
}