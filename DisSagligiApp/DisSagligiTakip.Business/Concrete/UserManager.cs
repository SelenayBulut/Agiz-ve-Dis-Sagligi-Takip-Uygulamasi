using DisSagligiTakip.Business.Abstract;
using DisSagligiTakip.DataAccess;
using DisSagligiTakip.Entities.Concrete;

namespace DisSagligiTakip.Business.Concrete
{
    public class UserManager : IUserService
    {
        private readonly AppDbContext _context;

        public UserManager(AppDbContext context)
        {
            _context = context;
        }

        public List<User> GetAll()
        {
            return _context.Users.ToList();
        }

        public void Add(User user)
        {
            _context.Users.Add(user);
            _context.SaveChanges();
        }
    }
}