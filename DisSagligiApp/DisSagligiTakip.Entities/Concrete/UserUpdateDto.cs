namespace DisSagligiTakip.Entities.DTOs 
{
    public class UserUpdateDto
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public DateTime BirthDate { get; set; }
    }
}