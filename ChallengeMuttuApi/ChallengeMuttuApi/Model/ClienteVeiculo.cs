// Path: ChallengeMuttuApi/Model/ClienteVeiculo.cs - Este arquivo deve estar na pasta 'Model'
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChallengeMuttuApi.Model
{
    /// <summary>
    /// Representa a tabela de ligação "TB_CLIENTEVEICULO" no banco de dados.
    /// Estabelece o relacionamento muitos-para-muitos entre Cliente e Veículo.
    /// A chave primária desta tabela é composta pela combinação do ID do Cliente e do ID do Veículo.
    /// <remarks>
    /// Esta tabela agora utiliza uma chave primária composta padrão, formada por TB_CLIENTE_ID_CLIENTE e TB_VEICULO_ID_VEICULO.
    /// </remarks>
    /// </summary>
    [Table("TB_CLIENTEVEICULO")]
    public class ClienteVeiculo
    {
        /// <summary>
        /// Obtém ou define o ID do Cliente que faz parte da chave composta.
        /// Mapeia para a coluna "TB_CLIENTE_ID_CLIENTE" (Parte da Chave Primária Composta).
        /// </summary>
        [Column("TB_CLIENTE_ID_CLIENTE")]
        [Required]
        public int TbClienteIdCliente { get; set; }

        /// <summary>
        /// Obtém ou define o ID do Veículo que faz parte da chave composta.
        /// Mapeia para a coluna "TB_VEICULO_ID_VEICULO" (Parte da Chave Primária Composta).
        /// </summary>
        [Column("TB_VEICULO_ID_VEICULO")]
        [Required]
        public int TbVeiculoIdVeiculo { get; set; }

        // Propriedades de Navegação (para Entity Framework Core)

        /// <summary>
        /// Propriedade de navegação para a entidade Cliente associada.
        /// </summary>
        [ForeignKey("TbClienteIdCliente")]
        public Cliente? Cliente { get; set; }

        /// <summary>
        /// Propriedade de navegação para a entidade Veiculo associada.
        /// </summary>
        [ForeignKey("TbVeiculoIdVeiculo")]
        public Veiculo? Veiculo { get; set; }
    }
}