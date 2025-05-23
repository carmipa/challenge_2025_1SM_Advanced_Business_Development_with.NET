// Path: ChallengeMuttuApi/Controllers/PatiosController.cs
using ChallengeMuttuApi.Data;
using ChallengeMuttuApi.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChallengeMuttuApi.Controllers
{
    /// <summary>
    /// Controller responsável por gerenciar as operações CRUD para a entidade Pátio.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")] // Ex: /api/patios
    [Produces("application/json")]
    public class PatiosController : ControllerBase
    {
        private readonly AppDbContext _context;

        /// <summary>
        /// Construtor da PatiosController.
        /// </summary>
        /// <param name="context">O contexto do banco de dados da aplicação.</param>
        public PatiosController(AppDbContext context)
        {
            _context = context;
        }

        // ---------------------------------------------------------------------
        // Rotas GET (Recuperação de Dados)
        // ---------------------------------------------------------------------

        /// <summary>
        /// Retorna uma lista de todos os pátios cadastrados.
        /// </summary>
        /// <response code="200">Retorna a lista de pátios.</response>
        /// <response code="204">Não há pátios cadastrados.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Patio>), 200)]
        [ProducesResponseType(204)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<IEnumerable<Patio>>> GetAllPatios()
        {
            try
            {
                var patios = await _context.Patios.ToListAsync();
                if (!patios.Any())
                {
                    return NoContent();
                }
                return Ok(patios);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar todos os pátios: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao buscar pátios.");
            }
        }

        /// <summary>
        /// Retorna um pátio específico pelo seu ID.
        /// </summary>
        /// <param name="id">O ID do pátio a ser buscado.</param>
        /// <response code="200">Retorna o pátio encontrado.</response>
        /// <response code="404">Pátio não encontrado.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(Patio), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<Patio>> GetPatioById(int id)
        {
            try
            {
                var patio = await _context.Patios.FindAsync(id);
                if (patio == null)
                {
                    return NotFound("Pátio não encontrado.");
                }
                return Ok(patio);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar pátio por ID: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao buscar pátio.");
            }
        }

        /// <summary>
        /// Pesquisa pátios por parte do nome do pátio.
        /// </summary>
        /// <param name="nomePatio">A string a ser pesquisada no nome dos pátios.</param>
        /// <response code="200">Retorna a lista de pátios que correspondem à pesquisa.</response>
        /// <response code="204">Nenhum pátio encontrado com o nome especificado.</response>
        /// <response code="400">O parâmetro de nome para pesquisa é obrigatório.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpGet("search-by-name")]
        [ProducesResponseType(typeof(IEnumerable<Patio>), 200)]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<IEnumerable<Patio>>> SearchPatiosByName([FromQuery] string nomePatio)
        {
            if (string.IsNullOrWhiteSpace(nomePatio))
            {
                return BadRequest("O parâmetro 'nomePatio' para pesquisa é obrigatório.");
            }

            try
            {
                var patios = await _context.Patios
                    .Where(p => p.NomePatio.ToLower().Contains(nomePatio.ToLower()))
                    .ToListAsync();

                if (!patios.Any())
                {
                    return NoContent();
                }
                return Ok(patios);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao pesquisar pátios por nome: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao pesquisar pátios por nome.");
            }
        }

        /// <summary>
        /// Retorna pátios que entraram ou saíram em uma data específica.
        /// </summary>
        /// <param name="date">A data para buscar pátios (formato YYYY-MM-DD).</param>
        /// <param name="type">Tipo de data para buscar ('entrada' ou 'saida').</param>
        /// <response code="200">Retorna a lista de pátios encontrados.</response>
        /// <response code="204">Nenhum pátio encontrado para a data e tipo especificados.</response>
        /// <response code="400">Parâmetros de data ou tipo inválidos.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpGet("by-date")]
        [ProducesResponseType(typeof(IEnumerable<Patio>), 200)]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<IEnumerable<Patio>>> GetPatiosByDate(
            [FromQuery] DateTime date,
            [FromQuery] string type)
        {
            if (date == default)
            {
                return BadRequest("Data inválida. Use o formato YYYY-MM-DD.");
            }
            if (string.IsNullOrWhiteSpace(type) || (type.ToLower() != "entrada" && type.ToLower() != "saida"))
            {
                return BadRequest("Tipo de busca inválido. Use 'entrada' ou 'saida'.");
            }

            try
            {
                IQueryable<Patio> query = _context.Patios;

                if (type.ToLower() == "entrada")
                {
                    query = query.Where(p => p.DataEntrada.Date == date.Date);
                }
                else if (type.ToLower() == "saida")
                {
                    query = query.Where(p => p.DataSaida.Date == date.Date);
                }

                var patios = await query.ToListAsync();

                if (!patios.Any())
                {
                    return NoContent();
                }
                return Ok(patios);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar pátios por data: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao buscar pátios por data.");
            }
        }


        // ---------------------------------------------------------------------
        // Rotas POST (Criação de Dados)
        // ---------------------------------------------------------------------

        /// <summary>
        /// Cria um novo pátio.
        /// </summary>
        /// <param name="patio">Os dados do pátio a serem criados.</param>
        /// <response code="201">Pátio criado com sucesso.</response>
        /// <response code="400">Dados do pátio inválidos.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpPost]
        [ProducesResponseType(typeof(Patio), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<Patio>> CreatePatio([FromBody] Patio patio)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                _context.Patios.Add(patio);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetPatioById), new { id = patio.IdPatio }, patio);
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"Erro de banco de dados ao criar pátio: {ex.Message}");
                return StatusCode(500, "Erro ao persistir o pátio no banco de dados.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro inesperado ao criar pátio: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao criar pátio.");
            }
        }

        // ---------------------------------------------------------------------
        // Rotas PUT (Atualização de Dados)
        // ---------------------------------------------------------------------

        /// <summary>
        /// Atualiza um pátio existente pelo ID.
        /// </summary>
        /// <param name="id">O ID do pátio a ser atualizado.</param>
        /// <param name="patio">Os dados do pátio atualizados.</param>
        /// <response code="204">Pátio atualizado com sucesso.</response>
        /// <response code="400">ID na URL não corresponde ao ID do pátio no corpo da requisição, ou dados inválidos.</response>
        /// <response code="404">Pátio não encontrado.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpPut("{id:int}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult> UpdatePatio(int id, [FromBody] Patio patio)
        {
            if (id != patio.IdPatio)
            {
                return BadRequest("O ID na URL não corresponde ao ID do pátio fornecido.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var existingPatio = await _context.Patios.AsNoTracking().FirstOrDefaultAsync(p => p.IdPatio == id);
                if (existingPatio == null)
                {
                    return NotFound("Pátio não encontrado para atualização.");
                }

                _context.Entry(patio).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Patios.AnyAsync(e => e.IdPatio == id))
                {
                    return NotFound("Pátio não encontrado para atualização (possivelmente foi excluído por outro processo).");
                }
                throw;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro inesperado ao atualizar pátio: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao atualizar pátio.");
            }
        }

        // ---------------------------------------------------------------------
        // Rotas DELETE (Exclusão de Dados)
        // ---------------------------------------------------------------------

        /// <summary>
        /// Exclui um pátio pelo ID.
        /// </summary>
        /// <param name="id">O ID do pátio a ser excluído.</param>
        /// <response code="204">Pátio excluído com sucesso.</response>
        /// <response code="404">Pátio não encontrado.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpDelete("{id:int}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult> DeletePatio(int id)
        {
            try
            {
                var patio = await _context.Patios.FindAsync(id);
                if (patio == null)
                {
                    return NotFound("Pátio não encontrado para exclusão.");
                }

                _context.Patios.Remove(patio);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao excluir pátio: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao excluir pátio.");
            }
        }
    }
}