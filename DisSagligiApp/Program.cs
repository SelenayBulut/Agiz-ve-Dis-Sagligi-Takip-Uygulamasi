using DisSagligiTakip.DataAccess;
using DisSagligiTakip.Business.Abstract;
using DisSagligiTakip.Business.Concrete;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// JSON serileştirme ayarları (İlişkisel nesneler arası sonsuz döngüyü önler)
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

// API Dokümantasyon servisleri (Swagger / OpenAPI)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddOpenApi();

// Veritabanı bağlantı ayarı (SQL Server bağlantı dizesi)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Servis Bağımlılıkları (Interface - Manager eşleştirmeleri)
builder.Services.AddScoped<IUserService, UserManager>();
builder.Services.AddScoped<ITargetService, TargetManager>();

var app = builder.Build();

// Uygulama ilk ayağa kalktığında veritabanı kontrolü için scope
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
}

// Geliştirme ortamında Swagger arayüzünü aktif etme
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapOpenApi();
}

// CORS middleware'ini aktif hale getirme
app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.UseAuthorization();

// Controller rotalarını aktif hale getiriyoruz
app.MapControllers();

app.Run();