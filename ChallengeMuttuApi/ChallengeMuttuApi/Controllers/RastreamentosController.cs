// Path: ChallengeMuttuApi/Controllers/RastreamentosController.cs
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
    /// Controller responsável por gerenciar as operações CRUD para a entidade Rastreamento.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")] // Ex: /api/rastreamentos
    [Produces("application/json")]
    public class RastreamentosController : ControllerBase
    {
        private readonly AppDbContext _context;

        /// <summary>
        /// Construtor da RastreamentosController.
        /// </summary>
        /// <param name="context">O contexto do banco de dados da aplicação.</param>
        public RastreamentosController(AppDbContext context)
        {
            _context = context;
        }

        // ---------------------------------------------------------------------
        // Rotas GET (Recuperação de Dados)
        // ---------------------------------------------------------------------

        /// <summary>
        /// Retorna uma lista de todos os rastreamentos cadastrados.
        /// </summary>
        /// <response code="200">Retorna a lista de rastreamentos.</response>
        /// <response code="204">Não há rastreamentos cadastrados.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Rastreamento>), 200)]
        [ProducesResponseType(204)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<IEnumerable<Rastreamento>>> GetAllRastreamentos()
        {
            try
            {
                var rastreamentos = await _context.Rastreamentos.ToListAsync();
                if (!rastreamentos.Any())
                {
                    return NoContent();
                }
                return Ok(rastreamentos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar todos os rastreamentos: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao buscar rastreamentos.");
            }
        }

        /// <summary>
        /// Retorna um rastreamento específico pelo seu ID.
        /// </summary>
        /// <param name="id">O ID do rastreamento a ser buscado.</param>
        /// <response code="200">Retorna o rastreamento encontrado.</response>
        /// <response code="404">Rastreamento não encontrado.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(Rastreamento), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<Rastreamento>> GetRastreamentoById(int id)
        {
            try
            {
                var rastreamento = await _context.Rastreamentos.FindAsync(id);
                if (rastreamento == null)
                {
                    return NotFound("Rastreamento não encontrado.");
                }
                return Ok(rastreamento);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar rastreamento por ID: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao buscar rastreamento.");
            }
        }

        /// <summary>
        /// Pesquisa rastreamentos por um range de Latitude e Longitude.
        /// </summary>
        /// <param name="minLat">Latitude mínima.</param>
        /// <param name="maxLat">Latitude máxima.</param>
        /// <param name="minLong">Longitude mínima.</param>
        /// <param name="maxLong">Longitude máxima.</param>
        /// <response code="200">Retorna a lista de rastreamentos que correspondem à pesquisa.</response>
        /// <response code="204">Nenhum rastreamento encontrado no range especificado.</response>
        /// <response code="400">Parâmetros de latitude/longitude inválidos.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpGet("search-by-coordinates")]
        [ProducesResponseType(typeof(IEnumerable<Rastreamento>), 200)]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<IEnumerable<Rastreamento>>> SearchRastreamentosByCoordinates(
            [FromQuery] decimal minLat, [FromQuery] decimal maxLat,
            [FromQuery] decimal minLong, [FromQuery] decimal maxLong)
        {
            // Validação básica dos ranges (pode ser mais robusta)
            if (minLat > maxLat || minLong > maxLong)
            {
                return BadRequest("Parâmetros de latitude ou longitude inválidos (min > max).");
            }

            try
            {
                var rastreamentos = await _context.Rastreamentos
                    .Where(r => r.GprsLatitude >= minLat && r.GprsLatitude <= maxLat &&
                                r.GprsLongitude >= minLong && r.GprsLongitude <= maxLong)
                    .ToListAsync();

                if (!rastreamentos.Any())
                {
                    return NoContent();
                }
                return Ok(rastreamentos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao pesquisar rastreamentos por coordenadas: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao pesquisar rastreamentos por coordenadas.");
            }
        }

        /// <summary>
        /// Retorna rastreamentos por um range específico das coordenadas IPS (x, y).
        /// </summary>
        /// <param name="minX">Coordenada X mínima.</param>
        /// <param name="maxX">Coordenada X máxima.</param>
        /// <param name="minY">Coordenada Y mínima.</param>
        /// <param name="maxY">Coordenada Y máxima.</param>
        /// <response code="200">Retorna a lista de rastreamentos encontrados.</response>
        /// <response code="204">Nenhum rastreamento encontrado no range IPS especificado.</response>
        /// <response code="400">Parâmetros de coordenadas IPS inválidos.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpGet("by-ips-range")]
        [ProducesResponseType(typeof(IEnumerable<Rastreamento>), 200)]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<IEnumerable<Rastreamento>>> GetRastreamentosByIpsRange(
            [FromQuery] decimal minX, [FromQuery] decimal maxX,
            [FromQuery] decimal minY, [FromQuery] decimal maxY)
        {
            if (minX > maxX || minY > maxY)
            {
                return BadRequest("Parâmetros de coordenadas IPS inválidos (min > max).");
            }

            try
            {
                var rastreamentos = await _context.Rastreamentos
                    .Where(r => r.IpsX >= minX && r.IpsX <= maxX &&
                                r.IpsY >= minY && r.IpsY <= maxY)
                    .ToListAsync();

                if (!rastreamentos.Any())
                {
                    return NoContent();
                }
                return Ok(rastreamentos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar rastreamentos por range IPS: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao buscar rastreamentos por range IPS.");
            }
        }

        // ---------------------------------------------------------------------
        // Rotas POST (Criação de Dados)
        // ---------------------------------------------------------------------

        /// <summary>
        /// Cria um novo rastreamento.
        /// </summary>
        /// <param name="rastreamento">Os dados do rastreamento a serem criados.</param>
        /// <response code="201">Rastreamento criado com sucesso.</response>
        /// <response code="400">Dados do rastreamento inválidos.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpPost]
        [ProducesResponseType(typeof(Rastreamento), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<Rastreamento>> CreateRastreamento([FromBody] Rastreamento rastreamento)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                _context.Rastreamentos.Add(rastreamento);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetRastreamentoById), new { id = rastreamento.IdRastreamento }, rastreamento);
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"Erro de banco de dados ao criar rastreamento: {ex.Message}");
                return StatusCode(500, "Erro ao persistir o rastreamento no banco de dados.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro inesperado ao criar rastreamento: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao criar rastreamento.");
            }
        }

        // ---------------------------------------------------------------------
        // Rotas PUT (Atualização de Dados)
        // ---------------------------------------------------------------------

        /// <summary>
        /// Atualiza um rastreamento existente pelo ID.
        /// </summary>
        /// <param name="id">O ID do rastreamento a ser atualizado.</param>
        /// <param name="rastreamento">Os dados do rastreamento atualizados.</param>
        /// <response code="204">Rastreamento atualizado com sucesso.</response>
        /// <response code="400">ID na URL não corresponde ao ID do rastreamento no corpo da requisição, ou dados inválidos.</response>
        /// <response code="404">Rastreamento não encontrado.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpPut("{id:int}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult> UpdateRastreamento(int id, [FromBody] Rastreamento rastreamento)
        {
            if (id != rastreamento.IdRastreamento)
            {
                return BadRequest("O ID na URL não corresponde ao ID do rastreamento fornecido.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var existingRastreamento = await _context.Rastreamentos.AsNoTracking().FirstOrDefaultAsync(r => r.IdRastreamento == id);
                if (existingRastreamento == null)
                {
                    return NotFound("Rastreamento não encontrado para atualização.");
                }

                _context.Entry(rastreamento).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Rastreamentos.AnyAsync(e => e.IdRastreamento == id))
                {
                    return NotFound("Rastreamento não encontrado para atualização (possivelmente foi excluído por outro processo).");
                }
                throw;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro inesperado ao atualizar rastreamento: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao atualizar rastreamento.");
            }
        }

        // ---------------------------------------------------------------------
        // Rotas DELETE (Exclusão de Dados)
        // ---------------------------------------------------------------------

        /// <summary>
        /// Exclui um rastreamento pelo ID.
        /// </summary>
        /// <param name="id">O ID do rastreamento a ser excluído.</param>
        /// <response code="204">Rastreamento excluído com sucesso.</response>
        /// <response code="404">Rastreamento não encontrado.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpDelete("{id:int}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult> DeleteRastreamento(int id)
        {
            try
            {
                var rastreamento = await _context.Rastreamentos.FindAsync(id);
                if (rastreamento == null)
                {
                    return NotFound("Rastreamento não encontrado para exclusão.");
                }

                _context.Rastreamentos.Remove(rastreamento);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao excluir rastreamento: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao excluir rastreamento.");
            }
        }
    }
}