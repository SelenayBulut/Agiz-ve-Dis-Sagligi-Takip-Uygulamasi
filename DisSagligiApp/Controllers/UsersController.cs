using DisSagligiTakip.Business.Abstract;
using DisSagligiTakip.Entities.Concrete;
using DisSagligiTakip.Entities.DTOs;
using DisSagligiTakip.Business.Utilities;
using DisSagligiTakip.DataAccess;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Net.Mail;

namespace DisSagligiApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly AppDbContext _context;

        public UsersController(IUserService userService,AppDbContext context)
        {
            _userService = userService;
            _context = context;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var users = _userService.GetAll();
            return Ok(users);
        }

        [HttpPost]
        public IActionResult Add(User user)
        {
            user.PasswordHash = EncryptionHelper.Encrypt(user.PasswordHash);
            _userService.Add(user);
            return Ok("Kullanıcı başarıyla eklendi.");
        }

        [HttpPut("update-profile/{id}")]
        public IActionResult UpdateProfile(int id, [FromBody] UserUpdateDto model)
        {
            var user = _context.Users.Find(id);
            if (user == null)
            {
                return NotFound(new { message = "Kullanıcı bulunamadı." });
            }

            if (model == null)
            {
                return BadRequest(new { message = "Geçersiz veri gönderildi." });
            }

            //  Boş Alan Kontrolleri ve Özel Mesajlar
            if (string.IsNullOrWhiteSpace(model.FullName))
            {
                return BadRequest(new { message = "Lütfen Ad Soyad alanını doldurunuz." });
            }

            if (string.IsNullOrWhiteSpace(model.Email))
            {
                return BadRequest(new { message = "Lütfen Mail Adresi alanını doldurunuz." });
            }

            if (model.BirthDate == default)
            {
                return BadRequest(new { message = "Lütfen Doğum Tarihi alanını doldurunuz." });
            }

            //  Mail adresi değişiyorsa, başka bir kullanıcı tarafından kullanılıp kullanılmadığını kontrol et
            var cleanEmail = model.Email.Trim().ToLower();
            if (user.Email != cleanEmail)
            {
                bool emailExists = _context.Users.Any(u => u.Email == cleanEmail && u.Id != id);
                if (emailExists)
                {
                    return BadRequest(new { message = "Bu mail adresi başka bir kullanıcıya kayıtlı." });
                }
            }

            //  Parola kriterleri kontrolü 
            if (!string.IsNullOrEmpty(model.Password))
            {
                if (model.Password.Length < 8 || 
                    !model.Password.Any(char.IsUpper) || 
                    !model.Password.Any(char.IsLower) || 
                    !model.Password.Any(char.IsDigit))
                {
                    return BadRequest(new { message = "Parola en az 8 karakter olmalı, büyük harf, küçük harf ve rakam içermelidir." });
                }
                
                // Parola şifreleme
                user.PasswordHash = EncryptionHelper.Encrypt(model.Password);
            }

            // Diğer bilgileri güncelle
            user.FullName = model.FullName.Trim();
            user.Email = cleanEmail;
            user.BirthDate = model.BirthDate;

            _context.Users.Update(user);
            _context.SaveChanges();

            return Ok(new { message = "Profil başarıyla güncellendi.", user });
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] UserRegisterDto model)
        {
            if (model == null)
            {
                return BadRequest(new { message = "Geçersiz veri gönderildi." });
            }

            // 1. Boş Alan Kontrolleri
            if (string.IsNullOrWhiteSpace(model.FullName))
            {
                return BadRequest(new { message = "Lütfen Ad Soyad alanını doldurunuz." });
            }

            if (string.IsNullOrWhiteSpace(model.Email))
            {
                return BadRequest(new { message = "Lütfen Mail Adresi alanını doldurunuz." });
            }

            if (!model.BirthDate.HasValue)
            {
                return BadRequest(new { message = "Lütfen Doğum Tarihi alanını doldurunuz." });
            }

            if (string.IsNullOrWhiteSpace(model.Password))
            {
                return BadRequest(new { message = "Parola alanı boş bırakılamaz." });
            }

            // Parola Kriter Kontrolü (Backend Tarafı)
            // En az 8 karakter, en az bir büyük harf, bir küçük harf ve bir rakam içeriyor mu?
            var passwordRegex = new System.Text.RegularExpressions.Regex(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$");
            if (!passwordRegex.IsMatch(model.Password))
            {
                return BadRequest(new { message = "Parola en az 8 karakter olmalı, büyük harf, küçük harf ve rakam içermelidir." });
            }

            // Aynı mail adresi kontrolü
            var cleanEmail = model.Email.Trim().ToLower();
            var existingUser = _context.Users.FirstOrDefault(u => u.Email != null && u.Email.ToLower() == cleanEmail);
            
            if (existingUser != null)
            {
                return BadRequest(new { message = "Bu mail adresi zaten kayıtlı." });
            }

            // Parolayı şifreleme ve kaydetme
            string encryptedPassword = EncryptionHelper.Encrypt(model.Password);

            var user = new User
            {
                FullName = model.FullName.Trim(),
                Email = cleanEmail,
                BirthDate = model.BirthDate.Value,
                PasswordHash = encryptedPassword
            };

            _userService.Add(user);
            SendWelcomeEmail(user.Email, user.FullName);

            return Ok(new { message = "Kayıt başarıyla gerçekleşti. Bilgilendirme maili gönderildi." });
        }

        private void SendWelcomeEmail(string userEmail, string fullName)
        {
            try
            {
                var smtpClient = new SmtpClient("smtp.gmail.com")
                {
                    Port = 587,
                    Credentials = new NetworkCredential("agizvesagliktakip.bot@gmail.com", "cizt yodk uecj hece"),
                    EnableSsl = true,
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress("agizvesagliktakip.bot@gmail.com", "Ağız ve Diş Sağlığı Takip Sistemi"),
                    Subject = "Aramıza Hoş Geldiniz - Kaydınız Başarıyla Tamamlandı",
                    IsBodyHtml = true,
                };

                mailMessage.To.Add(userEmail);

                mailMessage.Body = $@"
                    <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: 0 auto;'>
                        <h2 style='color: #28a745;'>Aramıza Hoş Geldiniz, {fullName}!</h2>
                        <p>Ağız ve Diş Sağlığı Takip Uygulaması'na kayıt işleminiz başarıyla gerçekleştirilmiştir.</p>
                        <p>Sisteme giriş yaparak randevularınızı oluşturabilir ve diş sağlığınızı kolayca takip edebilirsiniz.</p>
                        <br/>
                        <hr style='border: none; border-top: 1px solid #eee;' />
                        <p style='font-size: 12px; color: #777;'>Bu e-posta otomatik olarak gönderilmiştir, lütfen yanıtlamayın.</p>
                    </div>
                ";

                smtpClient.Send(mailMessage);
            }
            catch (Exception ex)
            {
                // E-posta gönderiminde bir hata olursa kayıt patlamasın diye sadece konsola yazdırıyoruz
                Console.WriteLine("Mail gönderilemedi: " + ex.Message);
            }
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] UserLoginDto model)
        {
            if (string.IsNullOrEmpty(model.Email) && string.IsNullOrEmpty(model.Password))
            {
                return BadRequest(new { message = "Mail adresi ve parola alanları boş bırakılamaz." });
            }
            
            if (string.IsNullOrEmpty(model.Email))
            {
                return BadRequest(new { message = "Lütfen mail adresinizi giriniz." });
            }
            
            if (string.IsNullOrEmpty(model.Password))
            {
                return BadRequest(new { message = "Lütfen parolanızı giriniz." });
            }

            var cleanEmail = model.Email.Trim().ToLower();

            var user = _context.Users.FirstOrDefault(u => u.Email != null && u.Email.ToLower() == cleanEmail);
            if (user == null)
            {
                return BadRequest(new { message = "Bu mail adresine kayıtlı bir kullanıcı bulunamadı." });
            }

            // Kayıt olurken şifreler nasıl kaydediliyorsa giriş yaparken de aynı şekilde şifreleyip kıyaslıyoruz
            string encryptedInputPassword = EncryptionHelper.Encrypt(model.Password);

            if (user.PasswordHash != encryptedInputPassword)
            {
                return BadRequest(new { message = "Girdiğiniz parola hatalı." });
            }

            return Ok(new { message = "Giriş başarılı!", user = new { user.Id, user.FullName, user.Email } });
        }

        [HttpPost("check-email")]
        public IActionResult CheckEmail([FromBody] CheckEmailDto model)
        {
            if (model == null || string.IsNullOrEmpty(model.Email))
            {
                return BadRequest(new { message = "Mail adresi boş olamaz." });
            }

            var cleanEmail = model.Email.Trim().ToLower();
            var user = _context.Users.FirstOrDefault(u => u.Email != null && u.Email.ToLower() == cleanEmail);

            if (user == null)
            {
                return BadRequest(new { message = "Bu mail adresine kayıtlı kullanıcı bulunamadı." });
            }

            return Ok(new { message = "Kullanıcı sistemde mevcut." });
        }

        [HttpPost("reset-password")]
        public IActionResult ResetPassword([FromBody] ForgotPasswordDto model)
        {
            var inputEmail = model.Email?.Trim().ToLower();
            var user = _context.Users.FirstOrDefault(u => u.Email.ToLower() == inputEmail);
            
            if (user == null)
            {
                return BadRequest(new { message = "Kullanıcı bulunamadı." });
            }

            if (model.NewPassword.Length < 8 || 
                !model.NewPassword.Any(char.IsUpper) || 
                !model.NewPassword.Any(char.IsLower) || 
                !model.NewPassword.Any(char.IsDigit))
            {
                return BadRequest(new { message = "Parola en az 8 karakter olmalı, büyük harf, küçük harf ve rakam içermelidir." });
            }

            user.PasswordHash = EncryptionHelper.Encrypt(model.NewPassword);
            _context.Users.Update(user);
            _context.SaveChanges();

            return Ok(new { message = "Parola başarıyla güncellendi." });
        }
    }
}