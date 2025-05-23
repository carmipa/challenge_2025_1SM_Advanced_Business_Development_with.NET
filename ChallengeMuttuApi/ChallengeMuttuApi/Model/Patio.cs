// Path: ChallengeMuttuApi/Model/Patio.cs - Este arquivo deve estar na pasta 'Model'
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChallengeMuttuApi.Model
{
    /// <summary>
    /// Representa a entidade Pátio no banco de dados, mapeando para a tabela "TB_PATIO".
    /// Armazena informações sobre locais de estacionamento ou armazenamento.
    /// </summary>
    [Table("TB_PATIO")]
    public class Patio
    {
        /// <summary>
        /// Construtor padrão da classe Patio.
        /// Inicializa propriedades de string não anuláveis para evitar warnings CS8618.
        /// </summary>
        public Patio()
        {
            NomePatio = string.Empty;
        }

        /// <summary>
        /// Obtém ou define o identificador único do Pátio.
        /// Mapeia para a coluna "ID_PATIO" (Chave Primária, gerada por identidade).
        /// </summary>
        [Key]
        [Column("ID_PATIO")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IdPatio { get; set; }

        /// <summary>
        /// Obtém ou define o nome do Pátio.
        /// Mapeia para a coluna "NOME_PATIO" (VARCHAR2(50 BYTE), Obrigatório).
        /// </summary>
        [Column("NOME_PATIO")]
        [Required(ErrorMessage = "O nome do Pátio é obrigatório.")]
        [StringLength(50, ErrorMessage = "O nome do Pátio deve ter no máximo 50 caracteres.")]
        public string NomePatio { get; set; }

        /// <summary>
        /// Obtém ou define a data de entrada no Pátio.
        /// Mapeia para a coluna "DATA_ENTRADA" (DATE, Obrigatório).
        /// </summary>
        [Column("DATA_ENTRADA")]
        [Required(ErrorMessage = "A data de entrada é obrigatória.")]
        public DateTime DataEntrada { get; set; }

        /// <summary>
        /// Obtém ou define a data de saída do Pátio.
        /// Mapeia para a coluna "DATA_SAIDA" (DATE, Obrigatório).
        /// </summary>
        [Column("DATA_SAIDA")]
        [Required(ErrorMessage = "A data de saída é obrigatória.")]
        public DateTime DataSaida { get; set; }

        /// <summary>
        /// Obtém ou define observações adicionais sobre o Pátio.
        /// Mapeia para a coluna "OBSERVACAO" (VARCHAR2(100 BYTE), Opcional).
        /// </summary>
        [Column("OBSERVACAO")]
        [StringLength(100, ErrorMessage = "As observações devem ter no máximo 100 caracteres.")]
        public string? Observacao { get; set; }

        // Propriedades de Navegação para tabelas de ligação

        /// <summary>
        /// Coleção de entidades ContatoPatio, representando o relacionamento muitos-para-muitos com Contatos.
        /// </summary>
        public ICollection<ContatoPatio>? ContatoPatios { get; set; }

        /// <summary>
        /// Coleção de entidades EnderecoPatio, representando o relacionamento muitos-para-muitos com Endereços.
        /// </summary>
        public ICollection<EnderecoPatio>? EnderecoPatios { get; set; }

        /// <summary>
        /// Coleção de entidades PatioBox, representando o relacionamento muitos-para-muitos com Boxes.
        /// </summary>
        public ICollection<PatioBox>? PatioBoxes { get; set; }

        /// <summary>
        /// Coleção de entidades VeiculoPatio, representando o relacionamento muitos-para-muitos com Veículos.
        /// </summary>
        public ICollection<VeiculoPatio>? VeiculoPatios { get; set; }

        /// <summary>
        /// Coleção de entidades ZonaPatio, representando o relacionamento muitos-para-muitos com Zonas.
        /// </summary>
        public ICollection<ZonaPatio>? ZonaPatios { get; set; }
    }
}