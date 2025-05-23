// Path: ChallengeMuttuApi/Model/Veiculo.cs - Este arquivo deve estar na pasta 'Model'
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChallengeMuttuApi.Model
{
    /// <summary>
    /// Representa a entidade Veículo no banco de dados, mapeando para a tabela "TB_VEICULO".
    /// Contém informações detalhadas sobre um veículo, como placa, RENAVAM, chassi, fabricante, etc.
    /// </summary>
    [Table("TB_VEICULO")]
    public class Veiculo
    {
        /// <summary>
        /// Construtor padrão da classe Veiculo.
        /// Inicializa propriedades de string não anuláveis para evitar warnings CS8618.
        /// </summary>
        public Veiculo()
        {
            Placa = string.Empty;
            Renavam = string.Empty;
            Chassi = string.Empty;
            Fabricante = string.Empty;
            Modelo = string.Empty;
            Motor = null; // Pode ser nulo conforme DDL
            Combustivel = string.Empty;
        }

        /// <summary>
        /// Obtém ou define o identificador único do Veículo.
        /// Mapeia para a coluna "ID_VEICULO" (Chave Primária, gerada por identidade).
        /// </summary>
        [Key]
        [Column("ID_VEICULO")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IdVeiculo { get; set; }

        /// <summary>
        /// Obtém ou define a placa do veículo.
        /// Mapeia para a coluna "PLACA" (VARCHAR2(10 BYTE), Obrigatório, Único).
        /// </summary>
        [Column("PLACA")]
        [Required(ErrorMessage = "A Placa é obrigatória.")]
        [StringLength(10, ErrorMessage = "A Placa deve ter no máximo 10 caracteres.")]
        // O atributo [Index] foi removido daqui e será configurado via Fluent API no DbContext.
        public string Placa { get; set; }

        /// <summary>
        /// Obtém ou define o número RENAVAM do veículo.
        /// Mapeia para a coluna "RENAVAM" (VARCHAR2(11 CHAR), Obrigatório, Único).
        /// </summary>
        [Column("RENAVAM")]
        [Required(ErrorMessage = "O RENAVAM é obrigatório.")]
        [StringLength(11, ErrorMessage = "O RENAVAM deve ter 11 caracteres.")]
        // O atributo [Index] foi removido daqui e será configurado via Fluent API no DbContext.
        public string Renavam { get; set; }

        /// <summary>
        /// Obtém ou define o número do Chassi do veículo.
        /// Mapeia para a coluna "CHASSI" (VARCHAR2(17 CHAR), Obrigatório, Único).
        /// </summary>
        [Column("CHASSI")]
        [Required(ErrorMessage = "O Chassi é obrigatório.")]
        [StringLength(17, ErrorMessage = "O Chassi deve ter 17 caracteres.")]
        // O atributo [Index] foi removido daqui e será configurado via Fluent API no DbContext.
        public string Chassi { get; set; }

        /// <summary>
        /// Obtém ou define o fabricante do veículo.
        /// Mapeia para a coluna "FABRICANTE" (VARCHAR2(50 BYTE), Obrigatório).
        /// </summary>
        [Column("FABRICANTE")]
        [Required(ErrorMessage = "O Fabricante é obrigatório.")]
        [StringLength(50, ErrorMessage = "O Fabricante deve ter no máximo 50 caracteres.")]
        public string Fabricante { get; set; }

        /// <summary>
        /// Obtém ou define o modelo do veículo.
        /// Mapeia para a coluna "MODELO" (VARCHAR2(60 BYTE), Obrigatório).
        /// </summary>
        [Column("MODELO")]
        [Required(ErrorMessage = "O Modelo é obrigatório.")]
        [StringLength(60, ErrorMessage = "O Modelo deve ter no máximo 60 caracteres.")]
        public string Modelo { get; set; }

        /// <summary>
        /// Obtém ou define o tipo/especificação do motor do veículo.
        /// Mapeia para a coluna "MOTOR" (VARCHAR2(30 BYTE), Opcional).
        /// </summary>
        [Column("MOTOR")]
        [StringLength(30, ErrorMessage = "O Motor deve ter no máximo 30 caracteres.")]
        public string? Motor { get; set; } // Motor é nullable no DDL

        /// <summary>
        /// Obtém ou define o ano de fabricação do veículo.
        /// Mapeia para a coluna "ANO" (NUMBER, Obrigatório).
        /// </summary>
        [Column("ANO")]
        [Required(ErrorMessage = "O Ano é obrigatório.")]
        public int Ano { get; set; }

        /// <summary>
        /// Obtém ou define o tipo de combustível do veículo.
        /// Mapeia para a coluna "COMBUSTIVEL" (VARCHAR2(20 BYTE), Obrigatório).
        /// </summary>
        [Column("COMBUSTIVEL")]
        [Required(ErrorMessage = "O Combustível é obrigatório.")]
        [StringLength(20, ErrorMessage = "O Combustível deve ter no máximo 20 caracteres.")]
        public string Combustivel { get; set; }

        // Propriedades de Navegação para tabelas de ligação

        /// <summary>
        /// Coleção de entidades ClienteVeiculo, representando o relacionamento muitos-para-muitos com Clientes.
        /// </summary>
        public ICollection<ClienteVeiculo>? ClienteVeiculos { get; set; }

        /// <summary>
        /// Coleção de entidades VeiculoBox, representando o relacionamento muitos-para-muitos com Boxes.
        /// </summary>
        public ICollection<VeiculoBox>? VeiculoBoxes { get; set; }

        /// <summary>
        /// Coleção de entidades VeiculoPatio, representando o relacionamento muitos-para-muitos com Pátios.
        /// </summary>
        public ICollection<VeiculoPatio>? VeiculoPatios { get; set; }

        /// <summary>
        /// Coleção de entidades VeiculoRastreamento, representando o relacionamento muitos-para-muitos com Rastreamentos.
        /// </summary>
        public ICollection<VeiculoRastreamento>? VeiculoRastreamentos { get; set; }

        /// <summary>
        /// Coleção de entidades VeiculoZona, representando o relacionamento muitos-para-muitos com Zonas.
        /// </summary>
        public ICollection<VeiculoZona>? VeiculoZonas { get; set; }
    }
}