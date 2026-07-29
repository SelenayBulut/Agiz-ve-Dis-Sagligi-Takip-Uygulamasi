using DisSagligiTakip.Business.Abstract; 
using DisSagligiTakip.Entities.Concrete;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DisSagligiTakip.DataAccess;

[Route("api/[controller]")]
[ApiController]
public class TrackingRecordsController : ControllerBase
{
    private readonly AppDbContext _context; // Kendi DbContext sınıfının adı

    public TrackingRecordsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        var records = _context.TrackingRecords
            .Include(t => t.Target)
            .Include(t => t.User)
            .ToList();
        return Ok(records);
    }

    [HttpPost]
    public IActionResult Add([FromBody] TrackingRecord trackingRecord)
    {
        _context.TrackingRecords.Add(trackingRecord);
        _context.SaveChanges();
        return Ok(trackingRecord);
    }

    //son 7 günlük kayıtlarını getirecek
    [HttpGet("user/{userId}/last7days")]
    public IActionResult GetLast7Days(int userId)
    {
        var sevenDaysAgo = DateTime.Now.AddDays(-7);

        var records = _context.TrackingRecords
            .Include(t => t.Target)
            .Where(t => t.UserId == userId && t.Date >= sevenDaysAgo)
            .OrderByDescending(t => t.Date)
            .ToList();

        return Ok(records);
    }


}