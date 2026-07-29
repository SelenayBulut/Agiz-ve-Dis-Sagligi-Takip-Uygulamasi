using DisSagligiTakip.Business.Abstract;
using DisSagligiTakip.Entities.Concrete;
using DisSagligiTakip.DataAccess;
using Microsoft.AspNetCore.Mvc;

namespace DisSagligiApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TargetsController : ControllerBase
    {
        private readonly ITargetService _targetService;
        private readonly AppDbContext _context;

        // TEK VE BİRLEŞTİRİLMİŞ CONSTRUCTOR
        public TargetsController(ITargetService targetService, AppDbContext context)
        {
            _targetService = targetService;
            _context = context;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var targets = _targetService.GetAll();
            return Ok(targets);
        }

        [HttpPost]
        public IActionResult Add([FromBody] Target target)
        {
            _targetService.Add(target);
            return Ok(new { message = "Hedef başarıyla eklendi!" });
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteTarget(int id, [FromQuery] bool confirmed = false)
        {
            // 1. Hedef var mı kontrol et
            var target = _context.Targets.Find(id);
            if (target == null)
            {
                return NotFound(new { message = "Hedef bulunamadı." });
            }

            // 2. Bu hedefe ait daha önce girilmiş takip kaydı (durum bilgisi) var mı?
            bool hasRecords = _context.TrackingRecords.Any(t => t.TargetId == id);

            // 3. Eğer kayıt varsa VE kullanıcı henüz onay vermediyse (confirmed=false)
            if (hasRecords && !confirmed)
            {
                return BadRequest(new { 
                    requiresConfirmation = true, 
                    message = "Bu hedefe ait geçmiş kayıtlar bulunmaktadır. Hedefi silmek istediğinize emin misiniz?" 
                });
            }

            // 4. Kayıt yoksa veya kullanıcı onay verdiyse (confirmed=true) hedefi sil
            _context.Targets.Remove(target);
            _context.SaveChanges();

            return Ok(new { message = "Hedef başarıyla silindi." });
        }
    }
}