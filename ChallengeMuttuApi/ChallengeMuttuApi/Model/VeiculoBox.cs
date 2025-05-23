// Path: ChallengeMuttuApi/Model/VeiculoBox.cs - Este arquivo deve estar na pasta 'Model'
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChallengeMuttuApi.Model
{
    /// <summary>
    /// Representa a tabela de ligação "TB_VEICULOBOX" no banco de dados.
    /// Estabelece o relacionamento muitos-para-muitos entre Veículo e Box.
    /// A chave primária desta tabela é composta pelos IDs de Veículo e Box.
    /// </summary>
    [Table("TB_VEICULOBOX")]
    public class VeiculoBox
    {
        /// <summary>
        /// Obtém ou define o ID do Veículo que faz parte da chave composta.
        /// Mapeia para a coluna "TB_VEICULO_ID_VEICULO" (Parte da Chave Primária Composta).
        /// </summary>
        [Column("TB_VEICULO_ID_VEICULO")]
        [Required]
        public int TbVeiculoIdVeiculo { get; set; }

        /// <summary>
        /// Obtém ou define o ID do Box que faz parte da chave composta.
        /// Mapeia para a coluna "TB_BOX_ID_BOX" (Parte da Chave Primária Composta).
        /// </summary>
        [Column("TB_BOX_ID_BOX")]
        [Required]
        public int TbBoxIdBox { get; set; }

        // Propriedades de Navegação (para Entity Framework Core)

        /// <summary>
        /// Propriedade de navegação para a entidade Veículo associada.
        /// </summary>
        [ForeignKey("TbVeiculoIdVeiculo")]
        public Veiculo? Veiculo { get; set; }

        /// <summary>
        /// Propriedade de navegação para a entidade Box associada.
        /// </summary>
        [ForeignKey("TbBoxIdBox")]
        public Box? Box { get; set; }
    }
}