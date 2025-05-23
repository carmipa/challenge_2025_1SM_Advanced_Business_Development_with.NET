// Path: ChallengeMuttuApi/Model/EnderecoPatio.cs - Este arquivo deve estar na pasta 'Model'
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChallengeMuttuApi.Model
{
    /// <summary>
    /// Representa a tabela de ligação "TB_ENDERECIOPATIO" no banco de dados.
    /// Estabelece o relacionamento muitos-para-muitos entre Endereço e Pátio.
    /// A chave primária desta tabela é composta pelos IDs de Endereço e Pátio.
    /// </summary>
    [Table("TB_ENDERECIOPATIO")]
    public class EnderecoPatio
    {
        /// <summary>
        /// Obtém ou define o ID do Endereço que faz parte da chave composta.
        /// Mapeia para a coluna "TB_ENDERECO_ID_ENDERECO" (Parte da Chave Primária Composta).
        /// </summary>
        [Column("TB_ENDERECO_ID_ENDERECO")]
        [Required]
        public int TbEnderecoIdEndereco { get; set; }

        /// <summary>
        /// Obtém ou define o ID do Pátio que faz parte da chave composta.
        /// Mapeia para a coluna "TB_PATIO_ID_PATIO" (Parte da Chave Primária Composta).
        /// </summary>
        [Column("TB_PATIO_ID_PATIO")]
        [Required]
        public int TbPatioIdPatio { get; set; }

        // Propriedades de Navegação (para Entity Framework Core)

        /// <summary>
        /// Propriedade de navegação para a entidade Endereço associada.
        /// </summary>
        [ForeignKey("TbEnderecoIdEndereco")]
        public Endereco? Endereco { get; set; }

        /// <summary>
        /// Propriedade de navegação para a entidade Pátio associada.
        /// </summary>
        [ForeignKey("TbPatioIdPatio")]
        public Patio? Patio { get; set; }
    }
}