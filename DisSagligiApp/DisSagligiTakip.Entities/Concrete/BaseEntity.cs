
// Tüm veritabanı varlıkları (entities) için ortak olan temel özellikleri barındıran soyut sınıf.
namespace DisSagligiTakip.Entities.Concrete
{
    public abstract class BaseEntity
    {
        public int Id { get; set; }
    }
}