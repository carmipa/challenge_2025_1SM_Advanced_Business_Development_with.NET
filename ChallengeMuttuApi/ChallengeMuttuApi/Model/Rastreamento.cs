// Path: ChallengeMuttuApi/Model/Rastreamento.cs - Este arquivo deve estar na pasta 'Model'
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChallengeMuttuApi.Model
{
    /// <summary>
    /// Representa a entidade Rastreamento no banco de dados, mapeando para a tabela "TB_RASTREAMENTO".
    /// Contém dados de posicionamento interno (IPS) e GPRS (Latitude, Longitude, Altitude).
    /// </summary>
    [Table("TB_RASTREAMENTO")]
    public class Rastreamento
    {
        /// <summary>
        /// Construtor padrão da classe Rastreamento.
        /// </summary>
        public Rastreamento() { }

        /// <summary>
        /// Obtém ou define o identificador único do Rastreamento.
        /// Mapeia para a coluna "ID_RASTREAMENTO" (Chave Primária, gerada por identidade).
        /// </summary>
        [Key]
        [Column("ID_RASTREAMENTO")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IdRastreamento { get; set; }

        /// <summary>
        /// Obtém ou define a coordenada X do posicionamento interno (IPS).
        /// Mapeia para a coluna "IPS_X" (NUMBER(38,8), Obrigatório).
        /// Comentário no DDL: 'Coordenada X do posicionamento interno (IPS) com 4 inteiros e 3 decimais.'
        /// </summary>
        [Column("IPS_X", TypeName = "NUMBER(38,8)")] // Especifica o tipo para mapeamento decimal em Oracle
        [Required(ErrorMessage = "A coordenada IPS_X é obrigatória.")]
        public decimal IpsX { get; set; }

        /// <summary>
        /// Obtém ou define a coordenada Y do posicionamento interno (IPS).
        /// Mapeia para a coluna "IPS_Y" (NUMBER(38,8), Obrigatório).
        /// Comentário no DDL: 'Coordenada Y do posicionamento interno (IPS) com 4 inteiros e 3 decimais.'
        /// </summary>
        [Column("IPS_Y", TypeName = "NUMBER(38,8)")]
        [Required(ErrorMessage = "A coordenada IPS_Y é obrigatória.")]
        public decimal IpsY { get; set; }

        /// <summary>
        /// Obtém ou define a coordenada Z do posicionamento interno (IPS).
        /// Mapeia para a coluna "IPS_Z" (NUMBER(38,8), Obrigatório).
        /// Comentário no DDL: 'Coordenada Z do posicionamento interno (IPS) com 4 inteiros e 3 decimais.'
        /// </summary>
        [Column("IPS_Z", TypeName = "NUMBER(38,8)")]
        [Required(ErrorMessage = "A coordenada IPS_Z é obrigatória.")]
        public decimal IpsZ { get; set; }

        /// <summary>
        /// Obtém ou define a latitude do posicionamento GPRS.
        /// Mapeia para a coluna "GPRS_LATITUDE" (NUMBER(38,8), Obrigatório).
        /// Comentário no DDL: 'Latitude do posicionamento GPRS (ex: -90.000000 a +90.000000) com 6 decimais.'
        /// </summary>
        [Column("GPRS_LATITUDE", TypeName = "NUMBER(38,8)")]
        [Required(ErrorMessage = "A Latitude GPRS é obrigatória.")]
        public decimal GprsLatitude { get; set; }

        /// <summary>
        /// Obtém ou define a longitude do posicionamento GPRS.
        /// Mapeia para a coluna "GPRS_LONGITUDE" (NUMBER(38,8), Obrigatório).
        /// Comentário no DDL: 'Longitude do posicionamento GPRS (ex: -180.000000 a +180.000000) com 6 decimais.'
        /// </summary>
        [Column("GPRS_LONGITUDE", TypeName = "NUMBER(38,8)")]
        [Required(ErrorMessage = "A Longitude GPRS é obrigatória.")]
        public decimal GprsLongitude { get; set; }

        /// <summary>
        /// Obtém ou define a altitude do posicionamento GPRS.
        /// Mapeia para a coluna "GPRS_ALTITUDE" (NUMBER(38,8), Obrigatório).
        /// Comentário no DDL: 'Altitude do posicionamento GPRS (ex: 99999.99m) com 2 decimais.'
        /// </summary>
        [Column("GPRS_ALTITUDE", TypeName = "NUMBER(38,8)")]
        [Required(ErrorMessage = "A Altitude GPRS é obrigatória.")]
        public decimal GprsAltitude { get; set; }

        // Propriedades de Navegação (para Entity Framework Core)

        /// <summary>
        /// Coleção de entidades VeiculoRastreamento, representando o relacionamento muitos-para-muitos com Veículos.
        /// </summary>
        public ICollection<VeiculoRastreamento>? VeiculoRastreamentos { get; set; }
    }
}