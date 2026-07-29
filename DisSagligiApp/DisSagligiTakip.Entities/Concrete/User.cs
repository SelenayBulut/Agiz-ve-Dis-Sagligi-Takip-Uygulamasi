// Kullanıcı sınıfı
using System;
using System.Collections.Generic;

namespace DisSagligiTakip.Entities.Concrete
{
    public class User : BaseEntity
    {
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string FullName { get; set; }
        public DateTime BirthDate { get; set; }

        // Navigation Property (Bir kullanıcının birden çok hedefi olabilir)
        public ICollection<Target> Targets { get; set; }
    }
}