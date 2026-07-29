using DisSagligiTakip.Entities.Concrete;

namespace DisSagligiTakip.Business.Abstract
{
    public interface IUserService
    {
        List<User> GetAll();
        void Add(User user);
    }
}