// Hedef sınıfı
using System.Collections.Generic;

namespace DisSagligiTakip.Entities.Concrete
{
    public class Target : BaseEntity
    {
        public int UserId { get; set; } // Foreign Key
        public string Title { get; set; }
        public string Description { get; set; }
        public string Period { get; set; }
        public string Priority { get; set; } // Düşük, Orta, Yüksek

        // Navigation Properties
        public User? User { get; set; }
        public ICollection<TrackingRecord> TrackingRecords { get; set; }
    }
}