// Path: ChallengeMuttuApi/Controllers/VeiculosController.cs
using ChallengeMuttuApi.Data;
using ChallengeMuttuApi.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChallengeMuttuApi.Controllers
{
    /// <summary>
    /// Controller responsável por gerenciar as operações CRUD para a entidade Veículo.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")] // Ex: /api/veiculos
    [Produces("application/json")]
    public class VeiculosController : ControllerBase
    {
        private readonly AppDbContext _context;

        /// <summary>
        /// Construtor da VeiculosController.
        /// Injeta a instância do AppDbContext.
        /// </summary>
        /// <param name="context">O contexto do banco de dados da aplicação.</param>
        public VeiculosController(AppDbContext context)
        {
            _context = context;
        }

        // ---------------------------------------------------------------------
        // Rotas GET (Recuperação de Dados)
        // ---------------------------------------------------------------------

        /// <summary>
        /// Retorna uma lista de todos os veículos cadastrados.
        /// </summary>
        /// <response code="200">Retorna a lista de veículos.</response>
        /// <response code="204">Não há veículos cadastrados.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Veiculo>), 200)]
        [ProducesResponseType(204)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<IEnumerable<Veiculo>>> GetAllVeiculos()
        {
            try
            {
                var veiculos = await _context.Veiculos.ToListAsync();
                if (!veiculos.Any())
                {
                    return NoContent();
                }
                return Ok(veiculos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar todos os veículos: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao buscar veículos.");
            }
        }

        /// <summary>
        /// Retorna um veículo específico pelo seu ID.
        /// </summary>
        /// <param name="id">O ID do veículo a ser buscado.</param>
        /// <response code="200">Retorna o veículo encontrado.</response>
        /// <response code="404">Veículo não encontrado.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(Veiculo), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<Veiculo>> GetVeiculoById(int id)
        {
            try
            {
                var veiculo = await _context.Veiculos.FindAsync(id);
                if (veiculo == null)
                {
                    return NotFound("Veículo não encontrado.");
                }
                return Ok(veiculo);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar veículo por ID: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao buscar veículo.");
            }
        }

        /// <summary>
        /// Retorna um veículo pela sua placa.
        /// </summary>
        /// <remarks>
        /// Exemplo: GET /api/veiculos/by-placa/ABC1234
        /// </remarks>
        /// <param name="placa">A placa do veículo a ser buscado.</param>
        /// <response code="200">Retorna o veículo encontrado.</response>
        /// <response code="400">A placa fornecida é inválida.</response>
        /// <response code="404">Veículo com a placa especificada não encontrado.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpGet("by-placa/{placa}")]
        [ProducesResponseType(typeof(Veiculo), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<Veiculo>> GetVeiculoByPlaca(string placa)
        {
            if (string.IsNullOrWhiteSpace(placa) || placa.Length > 10) // Exemplo de validação básica
            {
                return BadRequest("Placa inválida.");
            }

            try
            {
                var veiculo = await _context.Veiculos.FirstOrDefaultAsync(v => v.Placa == placa);
                if (veiculo == null)
                {
                    return NotFound($"Veículo com placa '{placa}' não encontrado.");
                }
                return Ok(veiculo);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar veículo por placa: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao buscar veículo por placa.");
            }
        }

        /// <summary>
        /// Pesquisa veículos por parte do modelo.
        /// </summary>
        /// <remarks>
        /// Exemplo: GET /api/veiculos/search-by-model?modelo=gol
        /// </remarks>
        /// <param name="modelo">A string a ser pesquisada no modelo dos veículos.</param>
        /// <response code="200">Retorna a lista de veículos que correspondem à pesquisa.</response>
        /// <response code="204">Nenhum veículo encontrado com o modelo especificado.</response>
        /// <response code="400">O parâmetro de modelo para pesquisa é obrigatório.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpGet("search-by-model")]
        [ProducesResponseType(typeof(IEnumerable<Veiculo>), 200)]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<IEnumerable<Veiculo>>> SearchVeiculosByModel([FromQuery] string modelo)
        {
            if (string.IsNullOrWhiteSpace(modelo))
            {
                return BadRequest("O parâmetro 'modelo' para pesquisa é obrigatório.");
            }

            try
            {
                var veiculos = await _context.Veiculos
                    .Where(v => v.Modelo.ToLower().Contains(modelo.ToLower()))
                    .ToListAsync();

                if (!veiculos.Any())
                {
                    return NoContent();
                }
                return Ok(veiculos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao pesquisar veículos por modelo: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao pesquisar veículos por modelo.");
            }
        }


        // ---------------------------------------------------------------------
        // Rotas POST (Criação de Dados)
        // ---------------------------------------------------------------------

        /// <summary>
        /// Cria um novo veículo.
        /// </summary>
        /// <param name="veiculo">Os dados do veículo a serem criados.</param>
        /// <response code="201">Veículo criado com sucesso.</response>
        /// <response code="400">Dados do veículo inválidos ou já existe um veículo com a mesma placa, RENAVAM ou chassi.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpPost]
        [ProducesResponseType(typeof(Veiculo), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<Veiculo>> CreateVeiculo([FromBody] Veiculo veiculo)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Verifica duplicidade para Placa, RENAVAM e Chassi
                if (await _context.Veiculos.AnyAsync(v => v.Placa == veiculo.Placa || v.Renavam == veiculo.Renavam || v.Chassi == veiculo.Chassi))
                {
                    return BadRequest("Já existe um veículo cadastrado com a mesma Placa, RENAVAM ou Chassi.");
                }

                _context.Veiculos.Add(veiculo);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetVeiculoById), new { id = veiculo.IdVeiculo }, veiculo);
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"Erro de banco de dados ao criar veículo: {ex.Message}");
                return StatusCode(500, "Erro ao persistir o veículo no banco de dados.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro inesperado ao criar veículo: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao criar veículo.");
            }
        }

        // ---------------------------------------------------------------------
        // Rotas PUT (Atualização de Dados)
        // ---------------------------------------------------------------------

        /// <summary>
        /// Atualiza um veículo existente pelo ID.
        /// </summary>
        /// <param name="id">O ID do veículo a ser atualizado.</param>
        /// <param name="veiculo">Os dados do veículo atualizados.</param>
        /// <response code="204">Veículo atualizado com sucesso.</response>
        /// <response code="400">ID na URL não corresponde ao ID do veículo no corpo da requisição, ou dados inválidos.</response>
        /// <response code="404">Veículo não encontrado.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpPut("{id:int}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult> UpdateVeiculo(int id, [FromBody] Veiculo veiculo)
        {
            if (id != veiculo.IdVeiculo)
            {
                return BadRequest("O ID na URL não corresponde ao ID do veículo fornecido.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var existingVeiculo = await _context.Veiculos.AsNoTracking().FirstOrDefaultAsync(v => v.IdVeiculo == id);
                if (existingVeiculo == null)
                {
                    return NotFound("Veículo não encontrado para atualização.");
                }

                // Verifica duplicidade de chaves únicas se elas foram alteradas
                if (existingVeiculo.Placa != veiculo.Placa && await _context.Veiculos.AnyAsync(v => v.Placa == veiculo.Placa))
                {
                    return BadRequest("Já existe outro veículo com esta Placa.");
                }
                if (existingVeiculo.Renavam != veiculo.Renavam && await _context.Veiculos.AnyAsync(v => v.Renavam == veiculo.Renavam))
                {
                    return BadRequest("Já existe outro veículo com este RENAVAM.");
                }
                if (existingVeiculo.Chassi != veiculo.Chassi && await _context.Veiculos.AnyAsync(v => v.Chassi == veiculo.Chassi))
                {
                    return BadRequest("Já existe outro veículo com este Chassi.");
                }

                _context.Entry(veiculo).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Veiculos.AnyAsync(e => e.IdVeiculo == id))
                {
                    return NotFound("Veículo não encontrado para atualização (possivelmente foi excluído por outro processo).");
                }
                throw;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro inesperado ao atualizar veículo: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao atualizar veículo.");
            }
        }

        // ---------------------------------------------------------------------
        // Rotas DELETE (Exclusão de Dados)
        // ---------------------------------------------------------------------

        /// <summary>
        /// Exclui um veículo pelo ID.
        /// </summary>
        /// <param name="id">O ID do veículo a ser excluído.</param>
        /// <response code="204">Veículo excluído com sucesso.</response>
        /// <response code="404">Veículo não encontrado.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpDelete("{id:int}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult> DeleteVeiculo(int id)
        {
            try
            {
                var veiculo = await _context.Veiculos.FindAsync(id);
                if (veiculo == null)
                {
                    return NotFound("Veículo não encontrado para exclusão.");
                }

                _context.Veiculos.Remove(veiculo);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao excluir veículo: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao excluir veículo.");
            }
        }
    }
}