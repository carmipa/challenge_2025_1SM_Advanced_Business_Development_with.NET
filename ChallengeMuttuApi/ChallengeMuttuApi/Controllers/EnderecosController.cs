// Path: ChallengeMuttuApi/Controllers/EnderecosController.cs
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
    /// Controller responsável por gerenciar as operações CRUD para a entidade Endereço.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")] // Ex: /api/enderecos
    [Produces("application/json")]
    public class EnderecosController : ControllerBase
    {
        private readonly AppDbContext _context;

        /// <summary>
        /// Construtor da EnderecosController.
        /// </summary>
        /// <param name="context">O contexto do banco de dados da aplicação.</param>
        public EnderecosController(AppDbContext context)
        {
            _context = context;
        }

        // ---------------------------------------------------------------------
        // Rotas GET (Recuperação de Dados)
        // ---------------------------------------------------------------------

        /// <summary>
        /// Retorna uma lista de todos os endereços cadastrados.
        /// </summary>
        /// <response code="200">Retorna a lista de endereços.</response>
        /// <response code="204">Não há endereços cadastrados.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Endereco>), 200)]
        [ProducesResponseType(204)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<IEnumerable<Endereco>>> GetAllEnderecos()
        {
            try
            {
                var enderecos = await _context.Enderecos.ToListAsync();
                if (!enderecos.Any())
                {
                    return NoContent();
                }
                return Ok(enderecos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar todos os endereços: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao buscar endereços.");
            }
        }

        /// <summary>
        /// Retorna um endereço específico pelo seu ID.
        /// </summary>
        /// <param name="id">O ID do endereço a ser buscado.</param>
        /// <response code="200">Retorna o endereço encontrado.</response>
        /// <response code="404">Endereço não encontrado.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(Endereco), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<Endereco>> GetEnderecoById(int id)
        {
            try
            {
                var endereco = await _context.Enderecos.FindAsync(id);
                if (endereco == null)
                {
                    return NotFound("Endereço não encontrado.");
                }
                return Ok(endereco);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar endereço por ID: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao buscar endereço.");
            }
        }

        /// <summary>
        /// Retorna endereços por CEP.
        /// </summary>
        /// <param name="cep">O CEP do endereço a ser buscado.</param>
        /// <response code="200">Retorna a lista de endereços com o CEP especificado.</response>
        /// <response code="204">Nenhum endereço encontrado com o CEP especificado.</response>
        /// <response code="400">O CEP fornecido é inválido.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpGet("by-cep/{cep}")]
        [ProducesResponseType(typeof(IEnumerable<Endereco>), 200)]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<IEnumerable<Endereco>>> GetEnderecosByCep(string cep)
        {
            if (string.IsNullOrWhiteSpace(cep) || cep.Length != 9) // Validação básica para CEP de 9 caracteres
            {
                return BadRequest("CEP inválido. Deve conter 9 caracteres.");
            }

            try
            {
                var enderecos = await _context.Enderecos.Where(e => e.Cep == cep).ToListAsync();
                if (!enderecos.Any())
                {
                    return NoContent();
                }
                return Ok(enderecos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar endereços por CEP: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao buscar endereços por CEP.");
            }
        }

        /// <summary>
        /// Pesquisa endereços por parte da cidade e estado.
        /// </summary>
        /// <param name="cidade">A string a ser pesquisada na cidade dos endereços.</param>
        /// <param name="estado">A sigla do estado para pesquisa.</param>
        /// <response code="200">Retorna a lista de endereços que correspondem à pesquisa.</response>
        /// <response code="204">Nenhum endereço encontrado.</response>
        /// <response code="400">Os parâmetros de pesquisa são obrigatórios.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpGet("search-by-location")]
        [ProducesResponseType(typeof(IEnumerable<Endereco>), 200)]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<IEnumerable<Endereco>>> SearchEnderecosByLocation(
            [FromQuery] string cidade,
            [FromQuery] string estado)
        {
            if (string.IsNullOrWhiteSpace(cidade) || string.IsNullOrWhiteSpace(estado))
            {
                return BadRequest("Os parâmetros 'cidade' e 'estado' para pesquisa são obrigatórios.");
            }

            try
            {
                var enderecos = await _context.Enderecos
                    .Where(e => e.Cidade.ToLower().Contains(cidade.ToLower()) &&
                                e.Estado.ToLower() == estado.ToLower())
                    .ToListAsync();

                if (!enderecos.Any())
                {
                    return NoContent();
                }
                return Ok(enderecos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao pesquisar endereços por localização: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao pesquisar endereços por localização.");
            }
        }

        // ---------------------------------------------------------------------
        // Rotas POST (Criação de Dados)
        // ---------------------------------------------------------------------

        /// <summary>
        /// Cria um novo endereço.
        /// </summary>
        /// <param name="endereco">Os dados do endereço a serem criados.</param>
        /// <response code="201">Endereço criado com sucesso.</response>
        /// <response code="400">Dados do endereço inválidos.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpPost]
        [ProducesResponseType(typeof(Endereco), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<Endereco>> CreateEndereco([FromBody] Endereco endereco)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                _context.Enderecos.Add(endereco);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetEnderecoById), new { id = endereco.IdEndereco }, endereco);
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"Erro de banco de dados ao criar endereço: {ex.Message}");
                return StatusCode(500, "Erro ao persistir o endereço no banco de dados.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro inesperado ao criar endereço: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao criar endereço.");
            }
        }

        // ---------------------------------------------------------------------
        // Rotas PUT (Atualização de Dados)
        // ---------------------------------------------------------------------

        /// <summary>
        /// Atualiza um endereço existente pelo ID.
        /// </summary>
        /// <param name="id">O ID do endereço a ser atualizado.</param>
        /// <param name="endereco">Os dados do endereço atualizados.</param>
        /// <response code="204">Endereço atualizado com sucesso.</response>
        /// <response code="400">ID na URL não corresponde ao ID do endereço no corpo da requisição, ou dados inválidos.</response>
        /// <response code="404">Endereço não encontrado.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpPut("{id:int}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult> UpdateEndereco(int id, [FromBody] Endereco endereco)
        {
            if (id != endereco.IdEndereco)
            {
                return BadRequest("O ID na URL não corresponde ao ID do endereço fornecido.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var existingEndereco = await _context.Enderecos.AsNoTracking().FirstOrDefaultAsync(e => e.IdEndereco == id);
                if (existingEndereco == null)
                {
                    return NotFound("Endereço não encontrado para atualização.");
                }

                _context.Entry(endereco).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Enderecos.AnyAsync(e => e.IdEndereco == id))
                {
                    return NotFound("Endereço não encontrado para atualização (possivelmente foi excluído por outro processo).");
                }
                throw;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro inesperado ao atualizar endereço: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao atualizar endereço.");
            }
        }

        // ---------------------------------------------------------------------
        // Rotas DELETE (Exclusão de Dados)
        // ---------------------------------------------------------------------

        /// <summary>
        /// Exclui um endereço pelo ID.
        /// </summary>
        /// <param name="id">O ID do endereço a ser excluído.</param>
        /// <response code="204">Endereço excluído com sucesso.</response>
        /// <response code="404">Endereço não encontrado.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpDelete("{id:int}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult> DeleteEndereco(int id)
        {
            try
            {
                var endereco = await _context.Enderecos.FindAsync(id);
                if (endereco == null)
                {
                    return NotFound("Endereço não encontrado para exclusão.");
                }

                _context.Enderecos.Remove(endereco);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao excluir endereço: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao excluir endereço.");
            }
        }
    }
}