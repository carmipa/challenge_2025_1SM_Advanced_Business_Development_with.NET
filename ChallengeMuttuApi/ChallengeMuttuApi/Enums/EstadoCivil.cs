// Path: ChallengeMuttuApi/Enums/EstadoCivil.cs

using System.Runtime.Serialization; // Necessário para o atributo [EnumMember]

namespace ChallengeMuttuApi.Enums
{
    /// <summary>
    /// Define os estados civis possíveis para um cliente, mapeando os valores do banco de dados Oracle.
    /// Os valores string devem corresponder à constraint CK_CLIENTE_ESTADO_CIVIL no DDL.
    /// </summary>
    public enum EstadoCivil
    {
        /// <summary>
        /// Representa o estado civil 'Solteiro'.
        /// </summary>
        [EnumMember(Value = "Solteiro")]
        Solteiro,

        /// <summary>
        /// Representa o estado civil 'Casado'.
        /// </summary>
        [EnumMember(Value = "Casado")]
        Casado,

        /// <summary>
        /// Representa o estado civil 'Divorciado'.
        /// </summary>
        [EnumMember(Value = "Divorciado")] // ADICIONADO para corresponder ao DDL e ao erro
        Divorciado,                     // O nome do membro do enum pode ser Divorciado

        /// <summary>
        /// Representa o estado civil 'Viúvo'.
        /// </summary>
        [EnumMember(Value = "Viúvo")]    // CORRIGIDO para mapear o valor "Viúvo" do DDL
        Viuvo,                           // O nome do membro do enum pode ser Viuvo (sem acento) ou Viúvo

        /// <summary>
        /// Representa o estado civil 'Separado'.
        /// </summary>
        [EnumMember(Value = "Separado")]
        Separado,

        /// <summary>
        /// Representa o estado civil 'União Estável'.
        /// </summary>
        [EnumMember(Value = "União Estável")] // CORRIGIDO para mapear o valor "União Estável" do DDL
        Uniao_Estavel                        // O nome do membro do enum C# pode ser Uniao_Estavel ou UniaoEstavel
    }
}