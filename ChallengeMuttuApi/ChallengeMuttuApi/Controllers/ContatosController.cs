// Path: ChallengeMuttuApi/Controllers/ContatosController.cs
using ChallengeMuttuApi.Data;
using ChallengeMuttuApi.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace ChallengeMuttuApi.Controllers
{
    /// <summary>
    /// Controller responsável por gerenciar as operações CRUD para a entidade Contato.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")] // Ex: /api/contatos
    [Produces("application/json")]
    public class ContatosController : ControllerBase
    {
        private readonly AppDbContext _context;

        /// <summary>
        /// Construtor da ContatosController.
        /// </summary>
        /// <param name="context">O contexto do banco de dados da aplicação.</param>
        public ContatosController(AppDbContext context)
        {
            _context = context;
        }

        // ---------------------------------------------------------------------
        // Rotas GET (Recuperação de Dados)
        // ---------------------------------------------------------------------

        /// <summary>
        /// Retorna uma lista de todos os contatos cadastrados.
        /// </summary>
        /// <response code="200">Retorna a lista de contatos.</response>
        /// <response code="204">Não há contatos cadastrados.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Contato>), 200)]
        [ProducesResponseType(204)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<IEnumerable<Contato>>> GetAllContatos()
        {
            try
            {
                var contatos = await _context.Contatos.ToListAsync();
                if (!contatos.Any())
                {
                    return NoContent();
                }
                return Ok(contatos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar todos os contatos: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao buscar contatos.");
            }
        }

        /// <summary>
        /// Retorna um contato específico pelo seu ID.
        /// </summary>
        /// <param name="id">O ID do contato a ser buscado.</param>
        /// <response code="200">Retorna o contato encontrado.</response>
        /// <response code="404">Contato não encontrado.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(Contato), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<Contato>> GetContatoById(int id)
        {
            try
            {
                var contato = await _context.Contatos.FindAsync(id);
                if (contato == null)
                {
                    return NotFound("Contato não encontrado.");
                }
                return Ok(contato);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar contato por ID: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao buscar contato.");
            }
        }

        /// <summary>
        /// Retorna um contato pelo seu endereço de e-mail.
        /// </summary>
        /// <param name="email">O endereço de e-mail do contato a ser buscado.</param>
        /// <response code="200">Retorna o contato encontrado.</response>
        /// <response code="400">O e-mail fornecido é inválido.</response>
        /// <response code="404">Contato com o e-mail especificado não encontrado.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpGet("by-email/{email}")]
        [ProducesResponseType(typeof(Contato), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<Contato>> GetContatoByEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email) || !new EmailAddressAttribute().IsValid(email))
            {
                return BadRequest("E-mail inválido.");
            }

            try
            {
                var contato = await _context.Contatos.FirstOrDefaultAsync(c => c.Email == email);
                if (contato == null)
                {
                    return NotFound($"Contato com e-mail '{email}' não encontrado.");
                }
                return Ok(contato);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao buscar contato por e-mail: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao buscar contato por e-mail.");
            }
        }

        /// <summary>
        /// Pesquisa contatos por parte do número de celular.
        /// </summary>
        /// <param name="celular">A string a ser pesquisada no número de celular dos contatos.</param>
        /// <response code="200">Retorna a lista de contatos que correspondem à pesquisa.</response>
        /// <response code="204">Nenhum contato encontrado com o celular especificado.</response>
        /// <response code="400">O parâmetro de celular para pesquisa é obrigatório.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpGet("search-by-celular")]
        [ProducesResponseType(typeof(IEnumerable<Contato>), 200)]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<IEnumerable<Contato>>> SearchContatosByCelular([FromQuery] string celular)
        {
            if (string.IsNullOrWhiteSpace(celular))
            {
                return BadRequest("O parâmetro 'celular' para pesquisa é obrigatório.");
            }

            try
            {
                var contatos = await _context.Contatos
                    .Where(c => c.Celular.Contains(celular)) // Usando Contains para pesquisa parcial
                    .ToListAsync();

                if (!contatos.Any())
                {
                    return NoContent();
                }
                return Ok(contatos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao pesquisar contatos por celular: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao pesquisar contatos por celular.");
            }
        }

        // ---------------------------------------------------------------------
        // Rotas POST (Criação de Dados)
        // ---------------------------------------------------------------------

        /// <summary>
        /// Cria um novo contato.
        /// </summary>
        /// <param name="contato">Os dados do contato a serem criados.</param>
        /// <response code="201">Contato criado com sucesso.</response>
        /// <response code="400">Dados do contato inválidos ou já existe um contato com o mesmo e-mail.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpPost]
        [ProducesResponseType(typeof(Contato), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<Contato>> CreateContato([FromBody] Contato contato)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Verifica duplicidade de e-mail
                if (await _context.Contatos.AnyAsync(c => c.Email == contato.Email))
                {
                    return BadRequest("Já existe um contato cadastrado com este e-mail.");
                }

                _context.Contatos.Add(contato);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetContatoById), new { id = contato.IdContato }, contato);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"Erro de banco de dados ao criar contato: {ex.Message}");
                return StatusCode(500, "Erro ao persistir o contato no banco de dados.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro inesperado ao criar contato: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao criar contato.");
            }
        }

        // ---------------------------------------------------------------------
        // Rotas PUT (Atualização de Dados)
        // ---------------------------------------------------------------------

        /// <summary>
        /// Atualiza um contato existente pelo ID.
        /// </summary>
        /// <param name="id">O ID do contato a ser atualizado.</param>
        /// <param name="contato">Os dados do contato atualizados.</param>
        /// <response code="204">Contato atualizado com sucesso.</response>
        /// <response code="400">ID na URL não corresponde ao ID do contato no corpo da requisição, ou dados inválidos.</response>
        /// <response code="404">Contato não encontrado.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpPut("{id:int}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult> UpdateContato(int id, [FromBody] Contato contato)
        {
            if (id != contato.IdContato)
            {
                return BadRequest("O ID na URL não corresponde ao ID do contato fornecido.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var existingContato = await _context.Contatos.AsNoTracking().FirstOrDefaultAsync(c => c.IdContato == id);
                if (existingContato == null)
                {
                    return NotFound("Contato não encontrado para atualização.");
                }

                // Verifica duplicidade de e-mail se ele foi alterado
                if (existingContato.Email != contato.Email)
                {
                    var contatoWithSameEmail = await _context.Contatos.AsNoTracking().FirstOrDefaultAsync(c => c.Email == contato.Email);
                    if (contatoWithSameEmail != null && contatoWithSameEmail.IdContato != id)
                    {
                        return BadRequest("Já existe outro contato cadastrado com este e-mail.");
                    }
                }

                _context.Entry(contato).State = EntityState.Modified;
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Contatos.AnyAsync(e => e.IdContato == id))
                {
                    return NotFound("Contato não encontrado para atualização (possivelmente foi excluído por outro processo).");
                }
                throw;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro inesperado ao atualizar contato: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao atualizar contato.");
            }
        }

        // ---------------------------------------------------------------------
        // Rotas DELETE (Exclusão de Dados)
        // ---------------------------------------------------------------------

        /// <summary>
        /// Exclui um contato pelo ID.
        /// </summary>
        /// <param name="id">O ID do contato a ser excluído.</param>
        /// <response code="204">Contato excluído com sucesso.</response>
        /// <response code="404">Contato não encontrado.</response>
        /// <response code="500">Ocorreu um erro interno no servidor.</response>
        [HttpDelete("{id:int}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult> DeleteContato(int id)
        {
            try
            {
                var contato = await _context.Contatos.FindAsync(id);
                if (contato == null)
                {
                    return NotFound("Contato não encontrado para exclusão.");
                }

                _context.Contatos.Remove(contato);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao excluir contato: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor ao excluir contato.");
            }
        }
    }
}