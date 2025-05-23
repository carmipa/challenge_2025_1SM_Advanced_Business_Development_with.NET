// Path: ChallengeMuttuApi/Model/VeiculoRastreamento.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChallengeMuttuApi.Model
{
    /// <summary>
    /// Representa a tabela de ligação "TB_VEICULORASTREAMENTO" no banco de dados.
    /// Estabelece o relacionamento muitos-para-muitos entre Veículo e Rastreamento.
    /// A chave primária desta tabela é composta pelos IDs de Veículo e Rastreamento.
    /// </summary>
    [Table("TB_VEICULORASTREAMENTO")]
    public class VeiculoRastreamento
    {
        /// <summary>
        /// Obtém ou define o ID do Veículo que faz parte da chave composta.
        /// Mapeia para a coluna "TB_VEICULO_ID_VEICULO" (Parte da Chave Primária Composta).
        /// </summary>
        [Column("TB_VEICULO_ID_VEICULO")]
        [Required]
        public int TbVeiculoIdVeiculo { get; set; }

        /// <summary>
        /// Obtém ou define o ID do Rastreamento que faz parte da chave composta.
        /// Mapeia para a coluna "TB_RASTREAMENTO_ID_RASTREAMENTO" (Parte da Chave Primária Composta).
        /// </summary>
        [Column("TB_RASTREAMENTO_ID_RASTREAMENTO")]
        [Required]
        public int TbRastreamentoIdRastreamento { get; set; }

        // Propriedades de Navegação (para Entity Framework Core)

        /// <summary>
        /// Propriedade de navegação para a entidade Veículo associada.
        /// </summary>
        [ForeignKey("TbVeiculoIdVeiculo")]
        public Veiculo? Veiculo { get; set; }

        /// <summary>
        /// Propriedade de navegação para a entidade Rastreamento associada.
        /// </summary>
        [ForeignKey("TbRastreamentoIdRastreamento")]
        public Rastreamento? Rastreamento { get; set; }
    }
}