namespace DisSagligiTakip.Entities.DTOs
{
    public class UserRegisterDto
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; } // Kullanıcının formdan girdi düz şifre
        public DateTime BirthDate { get; set; }
    }
}