// Path: ChallengeMuttuApi/Model/ContatoPatio.cs - Este arquivo deve estar na pasta 'Model'
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChallengeMuttuApi.Model
{
    /// <summary>
    /// Representa a tabela de ligação "TB_CONTATOPATIO" no banco de dados.
    /// Estabelece o relacionamento muitos-para-muitos entre Contato e Pátio.
    /// A chave primária desta tabela é composta pelos IDs de Pátio e Contato.
    /// </summary>
    [Table("TB_CONTATOPATIO")]
    public class ContatoPatio
    {
        /// <summary>
        /// Obtém ou define o ID do Pátio que faz parte da chave composta.
        /// Mapeia para a coluna "TB_PATIO_ID_PATIO" (Parte da Chave Primária Composta).
        /// </summary>
        [Column("TB_PATIO_ID_PATIO")]
        [Required]
        public int TbPatioIdPatio { get; set; }

        /// <summary>
        /// Obtém ou define o ID do Contato que faz parte da chave composta.
        /// Mapeia para a coluna "TB_CONTATO_ID_CONTATO" (Parte da Chave Primária Composta).
        /// </summary>
        [Column("TB_CONTATO_ID_CONTATO")]
        [Required]
        public int TbContatoIdContato { get; set; }

        // Propriedades de Navegação (para Entity Framework Core)

        /// <summary>
        /// Propriedade de navegação para a entidade Pátio associada.
        /// </summary>
        [ForeignKey("TbPatioIdPatio")]
        public Patio? Patio { get; set; }

        /// <summary>
        /// Propriedade de navegação para a entidade Contato associada.
        /// </summary>
        [ForeignKey("TbContatoIdContato")]
        public Contato? Contato { get; set; }
    }
}