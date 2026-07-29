using DisSagligiTakip.Business.Abstract;
using DisSagligiTakip.DataAccess;
using DisSagligiTakip.Entities.Concrete;
using Microsoft.EntityFrameworkCore;

namespace DisSagligiTakip.Business.Concrete
{
    public class TargetManager : ITargetService
    {
        private readonly AppDbContext _context;

        public TargetManager(AppDbContext context)
        {
            _context = context;
        }

        public void Add(Target target)
        {
            _context.Targets.Add(target);
            _context.SaveChanges();
        }

        public List<Target> GetAll()
        {
            return _context.Targets
                            .Include(t => t.User)
                            .ToList();
        }
    }
}