// Path: ChallengeMuttuApi/Controllers/ZonasController.cs
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
    /// Controller responsável por gerenciar as operações CRUD para a entidade Zona.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")] // Ex: /api/zonas
    [Produces("application/json")]
    public class ZonasController : ControllerBase
    {
        private readonly AppDbContext _context;

        /// <summary>
        /// Construtor da ZonasController.
        /// </summary>
        /// <param name="context">O contexto do banco de dados da aplicação.</param>
        public ZonasController(AppDbContext context)
        {
            _context = context;
        }

        // ---------------------------------------------------------------------
        // Rotas GET (Recuperação de Dados)
        // ---------------------------------------------------------------------

        /// <summary>
        /// Retorna uma lista de todas as zonas cadastradas.
        /// </summary>
        /// <response code="200">Retorna a lista de zonas.</response>
        /// <response code="204">Não há zonas cadastradas.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Zona>), 200)]
        [ProducesResponseType(204)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<IEnumerable<Zona>>> GetAllZonas()
        {
            try
            {
                var zonas = await _context.Zonas.ToListAsync();
                if (!zonas.Any())
                {
                    return NoContent();
                }
                return Ok(zonas);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar todas as zonas: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao buscar zonas.");
            }
        }

        /// <summary>
        /// Retorna uma zona específica pelo seu ID.
        /// </summary>
        /// <param name="id">O ID da zona a ser buscada.</param>
        /// <response code="200">Retorna a zona encontrada.</response>
        /// <response code="404">Zona não encontrada.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(Zona), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<Zona>> GetZonaById(int id)
        {
            try
            {
                var zona = await _context.Zonas.FindAsync(id);
                if (zona == null)
                {
                    return NotFound("Zona não encontrada.");
                }
                return Ok(zona);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar zona por ID: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao buscar zona.");
            }
        }

        /// <summary>
        /// Pesquisa zonas por parte do nome.
        /// </summary>
        /// <param name="nome">A string a ser pesquisada no nome das zonas.</param>
        /// <response code="200">Retorna a lista de zonas que correspondem à pesquisa.</response>
        /// <response code="204">Nenhuma zona encontrada com o nome especificado.</response>
        /// <response code="400">O parâmetro de nome para pesquisa é obrigatório.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpGet("search-by-name")]
        [ProducesResponseType(typeof(IEnumerable<Zona>), 200)]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<IEnumerable<Zona>>> SearchZonasByName([FromQuery] string nome)
        {
            if (string.IsNullOrWhiteSpace(nome))
            {
                return BadRequest("O parâmetro 'nome' para pesquisa é obrigatório.");
            }

            try
            {
                var zonas = await _context.Zonas
                    .Where(z => z.Nome.ToLower().Contains(nome.ToLower()))
                    .ToListAsync();

                if (!zonas.Any())
                {
                    return NoContent();
                }
                return Ok(zonas);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao pesquisar zonas por nome: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao pesquisar zonas por nome.");
            }
        }

        /// <summary>
        /// Retorna zonas que tiveram entrada ou saída em uma data específica.
        /// </summary>
        /// <param name="date">A data para buscar zonas (formato YYYY-MM-DD).</param>
        /// <param name="type">Tipo de data para buscar ('entrada' ou 'saida').</param>
        /// <response code="200">Retorna a lista de zonas encontradas.</response>
        /// <response code="204">Nenhuma zona encontrada para a data e tipo especificados.</response>
        /// <response code="400">Parâmetros de data ou tipo inválidos.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpGet("by-date")]
        [ProducesResponseType(typeof(IEnumerable<Zona>), 200)]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<IEnumerable<Zona>>> GetZonasByDate(
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
                IQueryable<Zona> query = _context.Zonas;

                if (type.ToLower() == "entrada")
                {
                    query = query.Where(z => z.DataEntrada.Date == date.Date);
                }
                else if (type.ToLower() == "saida")
                {
                    query = query.Where(z => z.DataSaida.Date == date.Date);
                }

                var zonas = await query.ToListAsync();

                if (!zonas.Any())
                {
                    return NoContent();
                }
                return Ok(zonas);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar zonas por data: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao buscar zonas por data.");
            }
        }

        // ---------------------------------------------------------------------
        // Rotas POST (Criação de Dados)
        // ---------------------------------------------------------------------

        /// <summary>
        /// Cria uma nova zona.
        /// </summary>
        /// <param name="zona">Os dados da zona a serem criados.</param>
        /// <response code="201">Zona criada com sucesso.</response>
        /// <response code="400">Dados da zona inválidos.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpPost]
        [ProducesResponseType(typeof(Zona), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<Zona>> CreateZona([FromBody] Zona zona)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                _context.Zonas.Add(zona);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetZonaById), new { id = zona.IdZona }, zona);
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"Erro de banco de dados ao criar zona: {ex.Message}");
                return StatusCode(500, "Erro ao persistir a zona no banco de dados.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro inesperado ao criar zona: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao criar zona.");
            }
        }

        // ---------------------------------------------------------------------
        // Rotas PUT (Atualização de Dados)
        // ---------------------------------------------------------------------

        /// <summary>
        /// Atualiza uma zona existente pelo ID.
        /// </summary>
        /// <param name="id">O ID da zona a ser atualizada.</param>
        /// <param name="zona">Os dados da zona atualizados.</param>
        /// <response code="204">Zona atualizada com sucesso.</response>
        /// <response code="400">ID na URL não corresponde ao ID da zona no corpo da requisição, ou dados inválidos.</response>
        /// <response code="404">Zona não encontrada.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpPut("{id:int}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult> UpdateZona(int id, [FromBody] Zona zona)
        {
            if (id != zona.IdZona)
            {
                return BadRequest("O ID na URL não corresponde ao ID da zona fornecida.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var existingZona = await _context.Zonas.AsNoTracking().FirstOrDefaultAsync(z => z.IdZona == id);
                if (existingZona == null)
                {
                    return NotFound("Zona não encontrada para atualização.");
                }

                _context.Entry(zona).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Zonas.AnyAsync(e => e.IdZona == id))
                {
                    return NotFound("Zona não encontrada para atualização (possivelmente foi excluída por outro processo).");
                }
                throw;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro inesperado ao atualizar zona: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao atualizar zona.");
            }
        }

        // ---------------------------------------------------------------------
        // Rotas DELETE (Exclusão de Dados)
        // ---------------------------------------------------------------------

        /// <summary>
        /// Exclui uma zona pelo ID.
        /// </summary>
        /// <param name="id">O ID da zona a ser excluída.</param>
        /// <response code="204">Zona excluída com sucesso.</response>
        /// <response code="404">Zona não encontrada.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpDelete("{id:int}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult> DeleteZona(int id)
        {
            try
            {
                var zona = await _context.Zonas.FindAsync(id);
                if (zona == null)
                {
                    return NotFound("Zona não encontrada para exclusão.");
                }

                _context.Zonas.Remove(zona);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao excluir zona: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao excluir zona.");
            }
        }
    }
}