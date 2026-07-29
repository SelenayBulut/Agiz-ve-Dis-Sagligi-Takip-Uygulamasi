// Durum ve Takip Kayıtları Sınıfı
using System;

namespace DisSagligiTakip.Entities.Concrete
{
    public class TrackingRecord : BaseEntity
    {
        public int TargetId { get; set; } // Foreign Key
        public int UserId { get; set; }  // Foreign Key
        public DateTime Date { get; set; }
        public int Duration { get; set; } // Dakika veya süre cinsinden
        public bool IsApplied { get; set; }
        public string NoteText { get; set; }
        public string ImagePath { get; set; }

        // Navigation Properties
        public Target? Target { get; set; }
        public User? User { get; set; }
    }
}