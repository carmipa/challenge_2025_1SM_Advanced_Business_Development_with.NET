// Caminho original no seu .txt: Model\Filial.cs
using System.ComponentModel.DataAnnotations;

namespace ChallengeMuttuApi.Model
{
    public class Filial
    {
        public int FilialId { get; set; }

        [MaxLength(50)]
        [Required]
        public string Nome { get; set; }

        /// <summary>
        /// Construtor padrão da classe Filial.
        /// Inicializa a propriedade Nome para evitar o warning/erro CS8618
        /// se nullable reference types estiverem habilitados.
        /// </summary>
        public Filial()
        {
            Nome = string.Empty;
        }

        // Construtor parametrizado opcional, se útil
        public Filial(string nome)
        {
            Nome = nome;
        }
    }
}