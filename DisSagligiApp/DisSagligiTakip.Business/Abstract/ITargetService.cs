using DisSagligiTakip.Entities.Concrete;

namespace DisSagligiTakip.Business.Abstract
{
    public interface ITargetService
    {
        List<Target> GetAll();
        void Add(Target target);
    }
}