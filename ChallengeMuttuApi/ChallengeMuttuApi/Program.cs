// Path: ChallengeMuttuApi/Program.cs

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using System;
using System.IO;
using System.Reflection;
using ChallengeMuttuApi.Data;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.HttpLogging;
using System.Text.Json.Serialization; // Adicionado para ReferenceHandler

// Inicializa a aplicação Web e configura os serviços.
var builder = WebApplication.CreateBuilder(args);

// Carrega a configuração do appsettings.json.
var configuration = builder.Configuration;

// Define as URLs de execução da aplicação.
builder.WebHost.UseUrls("http://localhost:5181", "https://localhost:7183");

// Configura o sistema de logging da aplicação.
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();
builder.Logging.AddEventSourceLogger();

builder.Services.AddHttpLogging(logging =>
{
    logging.LoggingFields = HttpLoggingFields.All;
    logging.RequestBodyLogLimit = 4096;
    logging.ResponseBodyLogLimit = 4096;
});

// Verifica e cria a pasta 'wwwroot' se não existir.
string wwwrootPath = Path.Combine(AppContext.BaseDirectory, "wwwroot");
if (!Directory.Exists(wwwrootPath))
{
    Directory.CreateDirectory(wwwrootPath);
    Console.WriteLine($"📂 Pasta 'wwwroot' criada em: {wwwrootPath}");
}
else
{
    Console.WriteLine($"📂 Pasta 'wwwroot' já existe em: {wwwrootPath}");
}

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5181", "https://localhost:7183", "http://localhost:3000") // Adicionada porta 3000 para Next.js
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Adiciona os serviços necessários ao container de injeção de dependência.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        // options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull; // Opcional
    });

builder.Services.AddEndpointsApiExplorer();

// Configura o contexto do banco de dados Oracle.
try
{
    // CERTIFIQUE-SE QUE A STRING DE CONEXÃO "OracleDb" EM appsettings.json ESTÁ CORRETA PARA FIAP:
    // "OracleDb": "User Id=rm557881;Password=fiap25;Data Source=oracle.fiap.com.br:1521/ORCL;"
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseOracle(configuration.GetConnectionString("OracleDb"))
               .LogTo(Console.WriteLine, LogLevel.Information)
               .EnableSensitiveDataLogging()
    );
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Erro CRÍTICO ao configurar o DbContext com Oracle: {ex.Message}");
    // Em um cenário real, você pode querer logar isso de forma mais robusta e/ou impedir o startup da app.
}

// Configura o Swagger para documentação da API.
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Challenge Muttu API",
        Version = "v1",
        Description = @"
            API RESTful para o Challenge Muttu - Gestão de Clientes, Veículos, Endereços, Contatos e mais.
            **Endereço do Projeto GitHub:** [https://github.com/carmipa/challenge_2025_1_semestre_mottu](https://github.com/carmipa/challenge_2025_1_semestre_mottu)
            **Turma:** 2TDSPV / 2TDSPZ
            **Contatos da Equipe:**
            - Arthur Bispo de Lima RM557568: [https://github.com/ArthurBispo00](https://github.com/ArthurBispo00)
            - João Paulo Moreira RM557808: [https://github.com/joao1015](https://github.com/joao1015)
            - Paulo André Carminati RM557881: [https://github.com/carmipa](https://github.com/carmipa)
        ",
        Contact = new OpenApiContact
        {
            Name = "Equipe Metamind Solution",
            Email = "RM557881@fiap.com.br;RM557568@fiap.com.br;RM557808@fiap.com.br",
            Url = new Uri("https://github.com/carmipa/challenge_2025_1_semestre_mottu")
        },
        License = new OpenApiLicense
        {
            Name = "Licença de Exemplo",
            Url = new Uri("https://github.com/carmipa/challenge_2025_1_semestre_mottu/tree/main/Advanced_Business_Development_with.NET")
        }
    });

    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        c.IncludeXmlComments(xmlPath);
    }
    else
    {
        Console.WriteLine($"⚠️ Arquivo de documentação XML não encontrado: {xmlPath}");
    }
});

// Cria a aplicação Web.
var app = builder.Build();

// Middleware para logar informações de CORS, restrito ao ambiente de Desenvolvimento.
if (app.Environment.IsDevelopment())
{
    app.Use(async (context, next) =>
    {
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        var request = context.Request; // Armazena a requisição para usar no OnStarting
        logger.LogInformation(1, "==================================================="); // EventId = 1 (exemplo)
        logger.LogInformation(2, "CORS DEBUG: Entrando no middleware de log CORS.");
        logger.LogInformation(3, "CORS DEBUG: Requisição: {Method} {Path}", request.Method, request.Path);
        logger.LogInformation(4, "CORS DEBUG: Origem da Requisição: {Origin}", request.Headers["Origin"].ToString() ?? "(não presente)");

        context.Response.OnStarting(() => {
            logger.LogInformation(5, "CORS DEBUG: Cabeçalhos da Resposta sendo enviados para {Path}:", request.Path);
            foreach (var header in context.Response.Headers)
            {
                if (header.Key.StartsWith("Access-Control-", StringComparison.OrdinalIgnoreCase) ||
                    header.Key.Equals("Vary", StringComparison.OrdinalIgnoreCase))
                {
                    logger.LogInformation(6, "CORS DEBUG: Response Header: {Key}: {Value}", header.Key, header.Value.ToString() ?? "(null ou vazio)");
                }
            }
            logger.LogInformation(7, "===================================================");
            return Task.CompletedTask;
        });
        await next.Invoke();
    });
}

app.UseHttpLogging();

// Configura o pipeline de requisições HTTP.
// Swagger UI é disponibilizado apenas em ambiente de Desenvolvimento.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Challenge Muttu API v1");
        c.RoutePrefix = "swagger"; // Define o prefixo da rota para acessar o Swagger UI.
    });
}

// Enable HTTPS redirection. Ensure an SSL certificate is configured for the app and Kestrel/IIS is listening on HTTPS ports.
app.UseHttpsRedirection();

app.UseStaticFiles();
app.UseRouting();
app.UseCors();
app.UseAuthorization();
app.MapControllers();

// Middleware global para tratamento de exceções
app.Use(async (context, next) =>
{
    try
    {
        await next.Invoke();
    }
    catch (Exception ex)
    {
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "❌ Erro NÃO TRATADO durante a requisição para {Path}: {ErrorMessage}", context.Request.Path, ex.Message);

        var currentEx = ex.InnerException;
        int counter = 0;
        while (currentEx != null && counter < 5)
        {
            logger.LogError(currentEx, "--- Inner Exception (Nível {Counter}) --- Message: {InnerMessage}", ++counter, currentEx.Message);
            currentEx = currentEx.InnerException;
        }

        if (!context.Response.HasStarted)
        {
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            // Evite enviar detalhes da exceção para o cliente em produção
            var responseMessage = app.Environment.IsDevelopment()
                ? $"Erro interno do servidor: {ex.Message} (Verifique logs do servidor para mais detalhes)."
                : "Ocorreu um erro interno no servidor. Tente novamente mais tarde.";
            await context.Response.WriteAsync(responseMessage);
        }
    }
});

// Inicia a aplicação Web.
try
{
    app.Run();
}
catch (Exception ex)
{
    var logger = app.Services?.GetService<ILogger<Program>>();
    if (logger != null)
    {
        logger.LogError(ex, "❌ Erro CRÍTICO durante a inicialização ou execução da aplicação: {ErrorMessage}", ex.Message);
    }
    else
    {
        Console.WriteLine($"ERRO CRÍTICO NA APLICAÇÃO (logger indisponível): {ex.Message}");
        if (ex.InnerException != null) Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
    }
    // Não relance a exceção aqui se quiser que a aplicação tente continuar ou feche graciosamente.
    // Se relançar, a aplicação vai parar abruptamente.
    // throw; 
    Environment.Exit(1); // Encerra a aplicação com código de erro
}