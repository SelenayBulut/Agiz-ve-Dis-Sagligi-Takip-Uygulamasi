using Microsoft.EntityFrameworkCore;
using DisSagligiTakip.Entities.Concrete;

namespace DisSagligiTakip.DataAccess
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Target> Targets { get; set; }
        public DbSet<TrackingRecord> TrackingRecords { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // TrackingRecord ile User arasındaki cascade silme döngüsünü engelliyoruz
            modelBuilder.Entity<TrackingRecord>()
                .HasOne(tr => tr.User)
                .WithMany()
                .HasForeignKey(tr => tr.UserId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}