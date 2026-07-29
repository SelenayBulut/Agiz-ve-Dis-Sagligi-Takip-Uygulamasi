using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class SuggestionsController : ControllerBase
{
    // Sistemde kayıtlı diş sağlığı önerileri listesi
    private static readonly List<string> _suggestions = new List<string>
    {
        "Dişlerinizi günde en az iki kez iki dakika boyunca fırçalamayı unutmayın.",
        "Diş ipi kullanımı arayüz temizliği için diş fırçası kadar önemlidir.",
        "Asitli ve şekerli gıdalar tükettikten sonra ağzınızı suyla çalkalayınız.",
        "Diş fırçanızı en geç 3 ila 4 ayda bir değiştirmelisiniz.",
        "Altı ayda bir düzenli diş hekimi kontrolüne gitmek olası sorunları önler.",
        "Dil temizliği de ağız hijyeninin önemli bir parçasıdır, fırçalarken dilinizi de unutmayın."
    };

    [HttpGet("random")]
    public IActionResult GetRandomSuggestion()
    {
        var random = new Random();
        int index = random.Next(_suggestions.Count);
        var selectedSuggestion = _suggestions[index];

        return Ok(new { suggestion = selectedSuggestion });
    }
}