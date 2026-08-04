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
    "Dil temizliği de ağız hijyeninin önemli bir parçasıdır, fırçalarken dilinizi de unutmayın.",
    "Ağız hijyeninizi tamamlamak için antibakteriyel bir gargara kullanabilirsiniz.",
    "Fırçanızı kapalı kaplarda saklamak yerine havadar bir ortamda dik konumda kurutun.",
    "Gün boyunca bol su içmek tükürük salgısını artırarak doğal bir temizlik sağlar.",
    "Süt, yoğurt ve peynir gibi kalsiyum açısından zengin gıdalar diş minesini güçlendirir.",
    "Elma ve havuç gibi lifli ve sert gıdalar çiğneme sırasında mekanik temizlik etkisi yaratır.",
    "Sigara ve tütün ürünleri diş eti hastalıklarına ve diş sararmalarına yol açar.",
    "Asitli içecek tüketiminden hemen sonra dişleri fırçalamak minenin aşınmasına neden olur, en az 30 dakika bekleyin.",
    "Şekersiz sakız çiğnemek tükürük akışını hızlandırarak asitleri nötralize etmeye yardımcı olur.",
    "Sabahları çene ağrısı ile uyanıyorsanız diş gıcırdatmaya karşı gece plağı kullanmayı değerlendirin.",
    "Paket açmak veya şişe kapağı açmak için dişlerinizi kesinlikle araç olarak kullanmayın.",
    "Diş minesini güçlendirmek için florür içerikli diş macunlarını tercih edin.",
    "Fırçalama sırasında kanayan diş etleri diş eti iltihabının habercisi olabilir, hekiminize başvurun.",
    "Sıcak veya soğuk hassasiyetiniz varsa diş hekiminizin önereceği hassasiyet giderici ürünler kullanın.",
    "Kahve ve çay gibi leke yapabilecek içeceklerden hemen sonra ağzınızı sade suyla çalkalayın.",
    "Stresli anlarda dişlerinizi sıkmamaya ve çene kaslarınızı serbest bırakmaya özen gösterin.",
    "Yetişkinler için diş fırçasına nohut büyüklüğünde macun sürmek yeterlidir.",
    "Travma riski yüksek sporlarla ilgilenirken dişlerinizi korumak için koruyucu ağız plağı takın.",
    "Gece uyumadan önce su hariç hiçbir şey tüketmeyin; gece tükürük akışı yavaşladığı için çürük riski artar.",
    "Doğru fırçalama için fırçanızı diş etinden dişe doğru süpürme hareketiyle uygulayın."
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