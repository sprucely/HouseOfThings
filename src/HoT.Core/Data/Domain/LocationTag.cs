using Microsoft.EntityFrameworkCore;

namespace HoT.Core.Data.Domain
{
    public class LocationTag
    {
        public int LocationId { get; set; }

        public int TagId { get; set; }

        public Location Location { get; set; }

        public Tag Tag { get; set; }

        internal static void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<LocationTag>()
                .HasKey(lt => new { lt.LocationId, lt.TagId });
            modelBuilder.Entity<LocationTag>()
                .HasIndex(lt => lt.TagId);
            modelBuilder.Entity<Tag>()
                .HasMany(t => t.Locations)
                .WithMany(l => l.Tags)
                .UsingEntity<LocationTag>(
                lt => lt
                    .HasOne(lt => lt.Location )
                    .WithMany()
                    .HasForeignKey(lt => lt.LocationId),
                lt => lt
                    .HasOne(lt => lt.Tag)
                    .WithMany()
                    .HasForeignKey(lt => lt.TagId))
                .ToTable("LocationsTags")
                .HasKey(lt => new { lt.LocationId, lt.TagId });
        }
    }
}