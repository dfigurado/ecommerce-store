using API.Middleware;
using API.SignalR;
using Infrastructure.Data;
using Domain.Interfaces;
using Infrastructure.Repository;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using Infrastructure.Services;
using Domain.Entities;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
// Add services to the container.
builder.Services.AddDbContext<StoreContext>(opt =>
{
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

builder.Services.ConfigureApplicationCookie(opt =>
{
    opt.Cookie.Name = ".AspNetCore.Identity.Application";
    opt.Cookie.HttpOnly = true;
    opt.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    opt.Cookie.SameSite = SameSiteMode.None; // Allow cross-site cookies for SPA on different origin
    opt.SlidingExpiration = true;
    opt.ExpireTimeSpan = TimeSpan.FromHours(24);

    opt.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = 401;
        return Task.CompletedTask;
    };
    opt.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = 403;
        return Task.CompletedTask;
    };
});
builder.Services.AddCors(option =>
{
    option.AddPolicy("ShopCors", 
        policy => 
        {
            policy.WithOrigins(
                "https://localhost:4200", 
                "http://localhost:4200"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
        });
});
builder.Services.AddSignalR();
builder.Services.AddSingleton<IConnectionMultiplexer>(config =>
{
    var connString = builder.Configuration.GetConnectionString("Redis")
        ?? throw new Exception("Cannot get redis connection string");
    var configuration = ConfigurationOptions.Parse(connString, true);
    return ConnectionMultiplexer.Connect(configuration);
});
builder.Services.AddSingleton<ICartService, CartService>();
builder.Services.AddAuthorization();
builder.Services
    .AddIdentityApiEndpoints<AppUser>()
    .AddApiEndpoints()
    .AddEntityFrameworkStores<StoreContext>();
builder.Services.AddScoped<IPaymentService, PaymentService>();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
//builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseMiddleware<ExceptionMiddleware>();
app.UseCors("ShopCors");

app.UseAuthentication();
app.UseAuthorization();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();
app.MapGroup("api").MapIdentityApi<AppUser>();
app.MapHub<NotificationsHub>("/hub/notifications");
app.MapFallbackToController("Index", "Fallback");

try
{
    using var scope = app.Services.CreateScope();
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<StoreContext>();
    await context.Database.MigrateAsync();
    await StoreContextSeed.SeedAsync(context);
}
catch (Exception ex)
{
    Console.WriteLine(ex);
}

app.Run();