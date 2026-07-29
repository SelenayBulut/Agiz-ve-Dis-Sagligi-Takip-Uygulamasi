using DisSagligiTakip.DataAccess;
using DisSagligiTakip.Business.Abstract;
using DisSagligiTakip.Business.Concrete;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

// CORS Politikası (React frontend uygulamasından gelecek isteklere izin vermek için)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

// Swagger servisleri
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddOpenApi();

// Veritabanı bağlantısı
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Servis bağımlılıkları (DI)
builder.Services.AddScoped<IUserService, UserManager>();
builder.Services.AddScoped<ITargetService, TargetManager>();

var app = builder.Build();

// Uygulama çalışırken veritabanı kontrolü için scope
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapOpenApi();
}

// CORS middleware'ini aktif hale getiriyoruz (Controller rotalarından önce olmalı)
app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.UseAuthorization();

// Controller rotalarını aktif hale getiriyoruz
app.MapControllers();

app.Run();