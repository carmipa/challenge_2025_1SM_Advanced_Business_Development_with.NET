// Caminho original no seu .txt: Data\AppDbContext.cs
using ChallengeMuttuApi.Enums;
using ChallengeMuttuApi.Model;
using Microsoft.EntityFrameworkCore;
// using System.ComponentModel.DataAnnotations; // Este using não parece ser necessário aqui, como estava comentado no seu .txt [cite: 533]

namespace ChallengeMuttuApi.Data
{
    /// <summary>
    /// Contexto de banco de dados da aplicação, responsável por mapear as entidades
    /// C# para as tabelas do banco de dados e gerenciar as operações de persistência.
    /// </summary>
    public class AppDbContext : DbContext
    {
        /// <summary>
        /// Construtor da classe AppDbContext.
        /// </summary>
        /// <param name="options">Opções de configuração do DbContext.</param>
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // 🔹 Todos os DbSets para suas tabelas principais

        /// <summary>
        /// Tabela dos boxex de entrada e saida dos conteiner. (Comentário baseado na sua imagem de erro)
        /// </summary>
        public DbSet<Box> Boxes { get; set; }
        /// <summary>
        /// Representa a coleção de Clientes no banco de dados. (Substitua pelo seu comentário original se diferente)
        /// </summary>
        public DbSet<Cliente> Clientes { get; set; }
        /// <summary>
        /// Representa a coleção de Contatos no banco de dados. (Substitua pelo seu comentário original se diferente)
        /// </summary>
        public DbSet<Contato> Contatos { get; set; }
        /// <summary>
        /// Representa a coleção de Endereços no banco de dados. (Substitua pelo seu comentário original se diferente)
        /// </summary>
        public DbSet<Endereco> Enderecos { get; set; }
        /// <summary>
        /// Representa a coleção de Pátios no banco de dados. (Substitua pelo seu comentário original se diferente)
        /// </summary>
        public DbSet<Patio> Patios { get; set; }
        /// <summary>
        /// Representa a coleção de Rastreamentos no banco de dados. (Substitua pelo seu comentário original se diferente)
        /// </summary>
        public DbSet<Rastreamento> Rastreamentos { get; set; }
        /// <summary>
        /// Representa a coleção de Veículos no banco de dados. (Substitua pelo seu comentário original se diferente)
        /// </summary>
        public DbSet<Veiculo> Veiculos { get; set; }
        /// <summary>
        /// Representa a coleção de Zonas no banco de dados. (Substitua pelo seu comentário original se diferente)
        /// </summary>
        public DbSet<Zona> Zonas { get; set; }

        // 🔹 DbSets para suas tabelas de ligação (models que representam as tabelas de junção)

        /// <summary>
        /// Representa a coleção de ligações entre Clientes e Veículos. (Substitua pelo seu comentário original se diferente)
        /// </summary>
        public DbSet<ClienteVeiculo> ClienteVeiculos { get; set; }
        /// <summary>
        /// Representa a coleção de ligações entre Contatos e Pátios. (Substitua pelo seu comentário original se diferente)
        /// </summary>
        public DbSet<ContatoPatio> ContatoPatios { get; set; }
        /// <summary>
        /// Representa a coleção de ligações entre Endereços e Pátios. (Substitua pelo seu comentário original se diferente)
        /// </summary>
        public DbSet<EnderecoPatio> EnderecoPatios { get; set; }
        /// <summary>
        /// Representa a coleção de ligações entre Pátios e Boxes. (Substitua pelo seu comentário original se diferente)
        /// </summary>
        public DbSet<PatioBox> PatioBoxes { get; set; }
        /// <summary>
        /// Representa a coleção de ligações entre Veículos e Boxes. (Substitua pelo seu comentário original se diferente)
        /// </summary>
        public DbSet<VeiculoBox> VeiculoBoxes { get; set; }
        /// <summary>
        /// Representa a coleção de ligações entre Veículos e Pátios. (Substitua pelo seu comentário original se diferente)
        /// </summary>
        public DbSet<VeiculoPatio> VeiculoPatios { get; set; }
        /// <summary>
        /// Representa a coleção de ligações entre Veículos e Rastreamentos. (Substitua pelo seu comentário original se diferente)
        /// </summary>
        public DbSet<VeiculoRastreamento> VeiculoRastreamentos { get; set; }
        /// <summary>
        /// Representa a coleção de ligações entre Veículos e Zonas. (Substitua pelo seu comentário original se diferente)
        /// </summary>
        public DbSet<VeiculoZona> VeiculoZonas { get; set; }
        /// <summary>
        /// Representa a coleção de ligações entre Zonas e Boxes. (Substitua pelo seu comentário original se diferente)
        /// </summary>
        public DbSet<ZonaBox> ZonaBoxes { get; set; }
        /// <summary>
        /// Representa a coleção de ligações entre Zonas e Pátios. (Substitua pelo seu comentário original se diferente)
        /// </summary>
        public DbSet<ZonaPatio> ZonaPatios { get; set; }


        /// <summary>
        /// Configura o modelo de dados que será usado pelo Entity Framework Core.
        /// Este método é chamado quando o contexto de banco de dados está sendo criado.
        /// </summary>
        /// <param name="modelBuilder">O construtor de modelo usado para configurar as entidades e seus mapeamentos.</param>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 🔹 Configuração de Chaves Compostas para Tabelas de Ligação
            // Os comentários XML internos no OnModelCreating não são padrão e podem ser removidos se não desejados.
            // Se mantidos, precisam estar corretamente posicionados para não causar CS1587.
            // Para esta correção, vou remover os comentários XML internos do OnModelCreating,
            // pois o erro CS1587 geralmente se aplica a membros de classe como propriedades (DbSet).

            modelBuilder.Entity<ClienteVeiculo>()
                .HasKey(cv => new {
                    cv.TbClienteIdCliente,
                    cv.TbClienteTbEnderecoIdEndereco,
                    cv.TbClienteTbContatoIdContato,
                    cv.TbVeiculoIdVeiculo
                });

            modelBuilder.Entity<ClienteVeiculo>()
                .HasOne(cv => cv.Cliente)
                .WithMany(c => c.ClienteVeiculos)
                .HasForeignKey(cv => cv.TbClienteIdCliente);

            modelBuilder.Entity<ClienteVeiculo>()
                .HasOne(cv => cv.Veiculo)
                .WithMany(v => v.ClienteVeiculos)
                .HasForeignKey(cv => cv.TbVeiculoIdVeiculo);

            modelBuilder.Entity<ContatoPatio>()
                .HasKey(cp => new { cp.TbPatioIdPatio, cp.TbContatoIdContato });
            modelBuilder.Entity<ContatoPatio>()
                .HasOne(cp => cp.Patio)
                .WithMany(p => p.ContatoPatios)
                .HasForeignKey(cp => cp.TbPatioIdPatio);
            modelBuilder.Entity<ContatoPatio>()
                .HasOne(cp => cp.Contato)
                .WithMany(c => c.ContatoPatios)
                .HasForeignKey(cp => cp.TbContatoIdContato);

            modelBuilder.Entity<EnderecoPatio>()
                .HasKey(ep => new { ep.TbEnderecoIdEndereco, ep.TbPatioIdPatio });
            modelBuilder.Entity<EnderecoPatio>()
                .HasOne(ep => ep.Endereco)
                .WithMany(e => e.EnderecoPatios)
                .HasForeignKey(ep => ep.TbEnderecoIdEndereco);
            modelBuilder.Entity<EnderecoPatio>()
                .HasOne(ep => ep.Patio)
                .WithMany(p => p.EnderecoPatios)
                .HasForeignKey(ep => ep.TbPatioIdPatio);

            modelBuilder.Entity<PatioBox>()
                .HasKey(pb => new { pb.TbPatioIdPatio, pb.TbBoxIdBox });
            modelBuilder.Entity<PatioBox>()
                .HasOne(pb => pb.Patio)
                .WithMany(p => p.PatioBoxes)
                .HasForeignKey(pb => pb.TbPatioIdPatio);
            modelBuilder.Entity<PatioBox>()
                .HasOne(pb => pb.Box)
                .WithMany(b => b.PatioBoxes)
                .HasForeignKey(pb => pb.TbBoxIdBox);

            modelBuilder.Entity<VeiculoBox>()
                .HasKey(vb => new { vb.TbVeiculoIdVeiculo, vb.TbBoxIdBox });
            modelBuilder.Entity<VeiculoBox>()
                .HasOne(vb => vb.Veiculo)
                .WithMany(v => v.VeiculoBoxes)
                .HasForeignKey(vb => vb.TbVeiculoIdVeiculo);
            modelBuilder.Entity<VeiculoBox>()
                .HasOne(vb => vb.Box)
                .WithMany(b => b.VeiculoBoxes)
                .HasForeignKey(vb => vb.TbBoxIdBox);

            modelBuilder.Entity<VeiculoPatio>()
                .HasKey(vp => new { vp.TbVeiculoIdVeiculo, vp.TbPatioIdPatio });
            modelBuilder.Entity<VeiculoPatio>()
                .HasOne(vp => vp.Veiculo)
                .WithMany(v => v.VeiculoPatios)
                .HasForeignKey(vp => vp.TbVeiculoIdVeiculo);
            modelBuilder.Entity<VeiculoPatio>()
                .HasOne(vp => vp.Patio)
                .WithMany(p => p.VeiculoPatios)
                .HasForeignKey(vp => vp.TbPatioIdPatio);

            modelBuilder.Entity<VeiculoRastreamento>()
                .HasKey(vr => new { vr.TbVeiculoIdVeiculo, vr.TbRastreamentoIdRastreamento });
            modelBuilder.Entity<VeiculoRastreamento>()
                .HasOne(vr => vr.Veiculo)
                .WithMany(v => v.VeiculoRastreamentos)
                .HasForeignKey(vr => vr.TbVeiculoIdVeiculo);
            modelBuilder.Entity<VeiculoRastreamento>()
                .HasOne(vr => vr.Rastreamento)
                .WithMany(r => r.VeiculoRastreamentos)
                .HasForeignKey(vr => vr.TbRastreamentoIdRastreamento);

            modelBuilder.Entity<VeiculoZona>()
                .HasKey(vz => new { vz.TbVeiculoIdVeiculo, vz.TbZonaIdZona });
            modelBuilder.Entity<VeiculoZona>()
                .HasOne(vz => vz.Veiculo)
                .WithMany(v => v.VeiculoZonas)
                .HasForeignKey(vz => vz.TbVeiculoIdVeiculo);
            modelBuilder.Entity<VeiculoZona>()
                .HasOne(vz => vz.Zona)
                .WithMany(z => z.VeiculoZonas)
                .HasForeignKey(vz => vz.TbZonaIdZona);

            modelBuilder.Entity<ZonaBox>()
                .HasKey(zb => new { zb.TbZonaIdZona, zb.TbBoxIdBox });
            modelBuilder.Entity<ZonaBox>()
                .HasOne(zb => zb.Zona)
                .WithMany(z => z.ZonaBoxes)
                .HasForeignKey(zb => zb.TbZonaIdZona);
            modelBuilder.Entity<ZonaBox>()
                .HasOne(zb => zb.Box)
                .WithMany(b => b.ZonaBoxes)
                .HasForeignKey(zb => zb.TbBoxIdBox);

            modelBuilder.Entity<ZonaPatio>()
                .HasKey(zp => new { zp.TbPatioIdPatio, zp.TbZonaIdZona });
            modelBuilder.Entity<ZonaPatio>()
                .HasOne(zp => zp.Patio)
                .WithMany(p => p.ZonaPatios)
                .HasForeignKey(zp => zp.TbPatioIdPatio);
            modelBuilder.Entity<ZonaPatio>()
                .HasOne(zp => zp.Zona)
                .WithMany(z => z.ZonaPatios)
                .HasForeignKey(zp => zp.TbZonaIdZona);

            // 🔹 Configuração de Índices Únicos usando Fluent API
            modelBuilder.Entity<Cliente>()
                .HasIndex(c => c.Cpf)
                .IsUnique();

            modelBuilder.Entity<Veiculo>()
                .HasIndex(v => v.Placa)
                .IsUnique();
            modelBuilder.Entity<Veiculo>()
                .HasIndex(v => v.Renavam)
                .IsUnique();
            modelBuilder.Entity<Veiculo>()
                .HasIndex(v => v.Chassi)
                .IsUnique();

            // 🔹 Configurações adicionais de mapeamento
            modelBuilder.Entity<Cliente>()
                .Property(c => c.EstadoCivil)
                .HasConversion<string>();

            modelBuilder.Entity<Box>()
                .Property(b => b.Status)
                .HasConversion(
                    v => v ? "A" : "I", // De bool para string ('A' ou 'I')
                    v => v == "A"       // De string ('A' ou 'I') para bool
                );
        }
    }
}