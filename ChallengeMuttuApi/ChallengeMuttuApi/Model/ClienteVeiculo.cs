// Path: ChallengeMuttuApi/Model/ClienteVeiculo.cs - Este arquivo deve estar na pasta 'Model'
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChallengeMuttuApi.Model
{
    /// <summary>
    /// Representa a tabela de ligação "TB_CLIENTEVEICULO" no banco de dados.
    /// Estabelece o relacionamento muitos-para-muitos entre Cliente e Veículo.
    /// A chave primária desta tabela é composta por uma combinação de IDs de Cliente, Endereço, Contato e Veículo.
    /// <remarks>
    /// OBS: O design da PK composta (CLIENTEVEICULO_PK) é incomum e pode exigir configuração explícita no DbContext.
    /// A chave primária inclui o ID do Endereço e Contato do Cliente, o que não é padrão em relacionamentos
    /// muitos-para-muitos típicos. Considere revisar o design do banco de dados se essa granularidade não for intencional.
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
        /// Obtém ou define o ID do Endereço do Cliente que faz parte da chave composta.
        /// Mapeia para a coluna "TB_CLIENTE_TB_ENDERECO_ID_ENDERECO" (Parte da Chave Primária Composta).
        /// Este campo é uma anomalia no DDL, pois a PK de TB_CLIENTE é apenas ID_CLIENTE.
        /// Recomenda-se revisão do design do banco se esta complexidade não for intencional.
        /// </summary>
        [Column("TB_CLIENTE_TB_ENDERECO_ID_ENDERECO")]
        [Required]
        public int TbClienteTbEnderecoIdEndereco { get; set; }

        /// <summary>
        /// Obtém ou define o ID do Contato do Cliente que faz parte da chave composta.
        /// Mapeia para a coluna "TB_CLIENTE_TB_CONTATO_ID_CONTATO" (Parte da Chave Primária Composta).
        /// Este campo é uma anomalia no DDL, similar ao Endereço.
        /// </summary>
        [Column("TB_CLIENTE_TB_CONTATO_ID_CONTATO")]
        [Required]
        public int TbClienteTbContatoIdContato { get; set; }

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