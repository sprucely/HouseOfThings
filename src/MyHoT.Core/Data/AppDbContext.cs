

using Microsoft.EntityFrameworkCore;
using MyHoT.Core.Data.Domain;

namespace MyHoT.Core.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<Item> Items { get; set; }

        public DbSet<ItemTag> ItemsTags { get; set; }

        public DbSet<Location> Locations { get; set; }

        public DbSet<LocationClosure> LocationsClosures { get; set; }

        public DbSet<LocationTag> LocationsTags { get; set; }

        public DbSet<Tag> Tags { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            LocationClosure.OnModelCreating(modelBuilder);
            Tag.OnModelCreating(modelBuilder);
            Location.OnModelCreating(modelBuilder);
            Photo.OnModelCreating(modelBuilder);
        }
    }


}