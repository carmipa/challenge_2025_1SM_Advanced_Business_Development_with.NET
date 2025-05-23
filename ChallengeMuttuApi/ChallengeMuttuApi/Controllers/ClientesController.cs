// Path: ChallengeMuttuApi/Controllers/ClientesController.cs
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
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class ClientesController : ControllerBase
    {
        private readonly AppDbContext _context;
        // Se você configurar ILogger via DI:
        // private readonly ILogger<ClientesController> _logger;

        public ClientesController(AppDbContext context /*, ILogger<ClientesController> logger */)
        {
            _context = context;
            // _logger = logger;
        }

        private void LogDetailedException(string contextMessage, Exception ex, int? entityId = null)
        {
            string logMessage = entityId.HasValue ? $"{contextMessage} (ID: {entityId.Value})" : contextMessage;

            // Substitua Console.WriteLine por _logger.LogError se estiver usando ILogger
            Console.WriteLine($"--- ERRO DETALHADO: {logMessage} ---");
            Console.WriteLine($"Exceção Principal: {ex.GetType().FullName} - {ex.Message}");
            Console.WriteLine($"StackTrace Principal:\n{ex.StackTrace}");

            var currentEx = ex.InnerException;
            int counter = 0;
            while (currentEx != null && counter < 5) // Limita a profundidade do log
            {
                Console.WriteLine($"--- Inner Exception (Nível {++counter}) ---");
                Console.WriteLine($"Tipo: {currentEx.GetType().FullName}");
                Console.WriteLine($"Mensagem: {currentEx.Message}");
                Console.WriteLine($"StackTrace:\n{currentEx.StackTrace}");
                currentEx = currentEx.InnerException;
            }
            Console.WriteLine($"--- FIM DO LOG DE ERRO DETALHADO ({logMessage}) ---");
        }

        // GET: api/clientes
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Cliente>), 200)]
        [ProducesResponseType(204)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<IEnumerable<Cliente>>> GetAllClientes(
            // Se você decidir implementar filtros e paginação no backend, os parâmetros viriam aqui.
            // Ex: [FromQuery] ClienteFilterDto filters, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10
            )
        {
            try
            {
                var query = _context.Clientes
                                    // .Include(c => c.Endereco) // Descomente se o frontend precisa do objeto Endereco
                                    // .Include(c => c.Contato)  // Descomente se o frontend precisa do objeto Contato
                                    .AsNoTracking();

                // TODO: Adicionar lógica de filtro aqui se `ClienteFilterDto filters` for implementado.
                // Ex: if (!string.IsNullOrWhiteSpace(filters.Nome)) query = query.Where(c => c.Nome.Contains(filters.Nome));
                // Ex: if (filters.Cpf != null) query = query.Where(c => c.Cpf == filters.Cpf);

                var clientes = await query.ToListAsync();

                if (!clientes.Any())
                {
                    return NoContent();
                }
                return Ok(clientes);
            }
            catch (Exception ex)
            {
                LogDetailedException("Erro ao buscar todos os clientes", ex);
                return StatusCode(500, "Erro interno do servidor ao buscar clientes. Verifique os logs do servidor.");
            }
        }

        // GET: api/clientes/5
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(Cliente), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<Cliente>> GetClienteById(int id)
        {
            try
            {
                var cliente = await _context.Clientes
                                          // .Include(c => c.Endereco) // Descomente se necessário
                                          // .Include(c => c.Contato)  // Descomente se necessário
                                          .AsNoTracking()
                                          .FirstOrDefaultAsync(c => c.IdCliente == id);

                if (cliente == null)
                {
                    return NotFound($"Cliente com ID {id} não encontrado.");
                }
                return Ok(cliente);
            }
            catch (Exception ex)
            {
                LogDetailedException("Erro ao buscar cliente por ID", ex, id);
                return StatusCode(500, "Erro interno do servidor ao buscar cliente. Verifique os logs do servidor.");
            }
        }

        // GET: api/clientes/by-cpf/12345678901
        [HttpGet("by-cpf/{cpf}")]
        [ProducesResponseType(typeof(Cliente), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<Cliente>> GetClienteByCpf(string cpf)
        {
            if (string.IsNullOrWhiteSpace(cpf) || cpf.Length != 11 || !cpf.All(char.IsDigit))
            {
                return BadRequest("CPF inválido. Deve conter 11 dígitos numéricos.");
            }

            try
            {
                var cliente = await _context.Clientes
                                          // .Include(c => c.Endereco) // Descomente se necessário
                                          // .Include(c => c.Contato)  // Descomente se necessário
                                          .AsNoTracking()
                                          .FirstOrDefaultAsync(c => c.Cpf == cpf);
                if (cliente == null)
                {
                    return NotFound($"Cliente com CPF '{cpf}' não encontrado.");
                }
                return Ok(cliente);
            }
            catch (Exception ex)
            {
                LogDetailedException($"Erro ao buscar cliente por CPF ({cpf})", ex);
                return StatusCode(500, "Erro interno do servidor ao buscar cliente por CPF. Verifique os logs do servidor.");
            }
        }

        // GET: api/clientes/search-by-name?nome=maria
        [HttpGet("search-by-name")]
        [ProducesResponseType(typeof(IEnumerable<Cliente>), 200)]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<ActionResult<IEnumerable<Cliente>>> SearchClientesByName([FromQuery] string nome)
        {
            if (string.IsNullOrWhiteSpace(nome))
            {
                return BadRequest("O parâmetro 'nome' para pesquisa é obrigatório.");
            }

            try
            {
                var nomeLower = nome.ToLower();
                var clientes = await _context.Clientes
                                          // .Include(c => c.Endereco) // Descomente se necessário
                                          // .Include(c => c.Contato)  // Descomente se necessário
                                          .AsNoTracking()
                                          .Where(c => c.Nome.ToLower().Contains(nomeLower) || (c.Sobrenome != null && c.Sobrenome.ToLower().Contains(nomeLower)))
                                          .ToListAsync();
                if (!clientes.Any())
                {
                    return NoContent();
                }
                return Ok(clientes);
            }
            catch (Exception ex)
            {
                LogDetailedException($"Erro ao pesquisar clientes por nome ({nome})", ex);
                return StatusCode(500, "Erro interno do servidor ao pesquisar clientes. Verifique os logs do servidor.");
            }
        }

        // POST: api/clientes
        [HttpPost]
        [ProducesResponseType(typeof(Cliente), 201)]
        [ProducesResponseType(typeof(ValidationProblemDetails), 400)] // Para erros de ModelState
        [ProducesResponseType(500)]
        public async Task<ActionResult<Cliente>> CreateCliente([FromBody] Cliente cliente)
        {
            // Validação do CPF e Sexo já ocorre nos setters do modelo Cliente.cs
            // Se ocorrer erro, uma ArgumentException será lançada e capturada abaixo.
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Verifica se o CPF já existe (mesmo que o modelo também possa ter um índice único)
                var existingClienteByCpf = await _context.Clientes.AsNoTracking().FirstOrDefaultAsync(c => c.Cpf == cliente.Cpf);
                if (existingClienteByCpf != null)
                {
                    ModelState.AddModelError("Cpf", "Já existe um cliente cadastrado com este CPF.");
                    return Conflict(new ValidationProblemDetails(ModelState) { Title = "Conflito de CPF" });
                }

                // Valida se os IDs de Endereço e Contato referenciam registros existentes, se forem > 0
                if (cliente.TbEnderecoIdEndereco > 0 && !await _context.Enderecos.AnyAsync(e => e.IdEndereco == cliente.TbEnderecoIdEndereco))
                {
                    ModelState.AddModelError("TbEnderecoIdEndereco", $"Endereço com ID {cliente.TbEnderecoIdEndereco} não encontrado.");
                }
                if (cliente.TbContatoIdContato > 0 && !await _context.Contatos.AnyAsync(ct => ct.IdContato == cliente.TbContatoIdContato))
                {
                    ModelState.AddModelError("TbContatoIdContato", $"Contato com ID {cliente.TbContatoIdContato} não encontrado.");
                }
                if (!ModelState.IsValid) // Verifica novamente após validações manuais
                {
                    return BadRequest(new ValidationProblemDetails(ModelState) { Title = "Erro de validação de referência" });
                }


                if (cliente.DataCadastro == DateTime.MinValue)
                {
                    cliente.DataCadastro = DateTime.UtcNow;
                }

                _context.Clientes.Add(cliente);
                await _context.SaveChangesAsync();

                // Para retornar o objeto com Endereco/Contato, seria necessário carregá-los após o SaveChangesAsync
                // ou o GetClienteById chamado por CreatedAtAction já os traria se configurado com .Include()
                return CreatedAtAction(nameof(GetClienteById), new { id = cliente.IdCliente }, cliente);
            }
            catch (ArgumentException argEx) // Captura validações dos setters do modelo Cliente
            {
                LogDetailedException("Erro de argumento ao criar cliente", argEx);
                return BadRequest(new ProblemDetails { Title = "Dados inválidos fornecidos.", Detail = argEx.Message, Status = StatusCodes.Status400BadRequest });
            }
            catch (DbUpdateException dbEx)
            {
                LogDetailedException("Erro de banco de dados ao criar cliente", dbEx);
                var oracleEx = dbEx.InnerException as Oracle.ManagedDataAccess.Client.OracleException;
                if (oracleEx != null)
                {
                    return StatusCode(500, $"Erro de banco de dados Oracle: {oracleEx.Message} (Erro {oracleEx.Number}).");
                }
                return StatusCode(500, "Erro ao persistir o cliente no banco. Verifique se os IDs de endereço e contato são válidos.");
            }
            catch (Exception ex)
            {
                LogDetailedException("Erro inesperado ao criar cliente", ex);
                return StatusCode(500, "Erro interno do servidor ao criar cliente. Verifique os logs.");
            }
        }

        // PUT: api/clientes/5
        [HttpPut("{id:int}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(typeof(ValidationProblemDetails), 400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult> UpdateCliente(int id, [FromBody] Cliente clienteData)
        {
            if (id != clienteData.IdCliente)
            {
                return BadRequest("O ID na URL não corresponde ao ID do cliente no corpo da requisição.");
            }

            // Validação do CPF e Sexo ocorre nos setters.
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var clienteToUpdate = await _context.Clientes.FindAsync(id);

            if (clienteToUpdate == null)
            {
                return NotFound($"Cliente com ID {id} não encontrado para atualização.");
            }

            // Valida se os IDs de Endereço e Contato referenciam registros existentes, se forem > 0 e diferentes do atual
            if (clienteData.TbEnderecoIdEndereco > 0 && clienteData.TbEnderecoIdEndereco != clienteToUpdate.TbEnderecoIdEndereco && !await _context.Enderecos.AnyAsync(e => e.IdEndereco == clienteData.TbEnderecoIdEndereco))
            {
                ModelState.AddModelError("TbEnderecoIdEndereco", $"Novo Endereço com ID {clienteData.TbEnderecoIdEndereco} não encontrado.");
            }
            if (clienteData.TbContatoIdContato > 0 && clienteData.TbContatoIdContato != clienteToUpdate.TbContatoIdContato && !await _context.Contatos.AnyAsync(ct => ct.IdContato == clienteData.TbContatoIdContato))
            {
                ModelState.AddModelError("TbContatoIdContato", $"Novo Contato com ID {clienteData.TbContatoIdContato} não encontrado.");
            }
            if (!ModelState.IsValid) // Verifica novamente após validações manuais
            {
                return BadRequest(new ValidationProblemDetails(ModelState) { Title = "Erro de validação de referência" });
            }


            // Atualiza as propriedades do cliente existente
            try
            {
                clienteToUpdate.Nome = clienteData.Nome;
                clienteToUpdate.Sobrenome = clienteData.Sobrenome;
                clienteToUpdate.Sexo = clienteData.Sexo; // Setter do modelo fará a validação
                clienteToUpdate.DataNascimento = clienteData.DataNascimento;
                clienteToUpdate.Profissao = clienteData.Profissao;
                clienteToUpdate.EstadoCivil = clienteData.EstadoCivil; // Setter do enum fará a validação
                clienteToUpdate.TbEnderecoIdEndereco = clienteData.TbEnderecoIdEndereco;
                clienteToUpdate.TbContatoIdContato = clienteData.TbContatoIdContato;
                // DataCadastro geralmente não é alterada

                // Verifica duplicidade de CPF se ele foi alterado
                if (clienteToUpdate.Cpf != clienteData.Cpf)
                {
                    var clienteWithSameCpf = await _context.Clientes.AsNoTracking().FirstOrDefaultAsync(c => c.Cpf == clienteData.Cpf && c.IdCliente != id);
                    if (clienteWithSameCpf != null)
                    {
                        ModelState.AddModelError("Cpf", "Já existe outro cliente cadastrado com este CPF.");
                        return Conflict(new ValidationProblemDetails(ModelState) { Title = "Conflito de CPF" });
                    }
                    clienteToUpdate.Cpf = clienteData.Cpf; // Setter do modelo fará a validação
                }

                _context.Entry(clienteToUpdate).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (ArgumentException argEx) // Captura validações dos setters do modelo Cliente
            {
                LogDetailedException($"Erro de argumento ao atualizar cliente ID {id}", argEx);
                return BadRequest(new ProblemDetails { Title = "Dados inválidos fornecidos.", Detail = argEx.Message, Status = StatusCodes.Status400BadRequest });
            }
            catch (DbUpdateConcurrencyException concEx)
            {
                LogDetailedException($"Erro de concorrência ao atualizar cliente ID {id}", concEx);
                if (!await _context.Clientes.AnyAsync(e => e.IdCliente == id))
                {
                    return NotFound("Cliente não encontrado (concorrência).");
                }
                else
                {
                    return StatusCode(409, "Conflito de concorrência ao atualizar. Tente novamente.");
                }
            }
            catch (DbUpdateException dbEx)
            {
                LogDetailedException($"Erro de banco de dados ao atualizar cliente ID {id}", dbEx);
                var oracleEx = dbEx.InnerException as Oracle.ManagedDataAccess.Client.OracleException;
                if (oracleEx != null)
                {
                    return StatusCode(500, $"Erro de banco de dados Oracle: {oracleEx.Message} (Erro {oracleEx.Number}).");
                }
                return StatusCode(500, "Erro ao atualizar o cliente no banco.");
            }
            catch (Exception ex)
            {
                LogDetailedException($"Erro inesperado ao atualizar cliente ID {id}", ex);
                return StatusCode(500, "Erro interno do servidor ao atualizar cliente. Verifique os logs.");
            }
        }

        // DELETE: api/clientes/5
        [HttpDelete("{id:int}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<ActionResult> DeleteCliente(int id)
        {
            try
            {
                var cliente = await _context.Clientes.FindAsync(id);
                if (cliente == null)
                {
                    return NotFound($"Cliente com ID {id} não encontrado para exclusão.");
                }

                _context.Clientes.Remove(cliente);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateException dbEx)
            {
                LogDetailedException($"Erro de banco de dados ao excluir cliente ID {id}", dbEx);
                var oracleEx = dbEx.InnerException as Oracle.ManagedDataAccess.Client.OracleException;
                if (oracleEx != null && (oracleEx.Number == 2292))
                { // ORA-02292: integrity constraint (SCHEMA.CONSTRAINT_NAME) violated - child record found
                    return Conflict($"Não é possível excluir o cliente ID {id} pois ele possui registros relacionados. Detalhe: {oracleEx.Message}");
                }
                return StatusCode(500, "Erro ao excluir o cliente do banco de dados. Verifique dependências.");
            }
            catch (Exception ex)
            {
                LogDetailedException($"Erro ao excluir cliente ID {id}", ex);
                return StatusCode(500, "Erro interno do servidor ao excluir cliente. Verifique os logs.");
            }
        }
    }
}