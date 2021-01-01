

using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using HoT.Core.Data.Domain;
using System.Data;

namespace HoT.Core.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext()
        {
            this.OverrideNoCaseCollation();
        }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
            this.OverrideNoCaseCollation();
        }

        public DbSet<Item> Items { get; set; }

        public DbSet<ItemTag> ItemsTags { get; set; }

        public DbSet<Location> Locations { get; set; }

        public DbSet<LocationClosure> LocationsClosures { get; set; }

        public DbSet<LocationTag> LocationsTags { get; set; }

        public DbSet<LocationType> LocationTypes { get; set; }

        public DbSet<Tag> Tags { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // SQLite specific: Default to always using NOCASE collation
            modelBuilder.UseCollation("NOCASE");

            LocationClosure.OnModelCreating(modelBuilder);
            Location.OnModelCreating(modelBuilder);
            Photo.OnModelCreating(modelBuilder);
            ItemTag.OnModelCreating(modelBuilder);
            LocationTag.OnModelCreating(modelBuilder);
            Tag.OnModelCreating(modelBuilder);
            LocationType.OnModelCreating(modelBuilder);
            Item.OnModelCreating(modelBuilder);
        }
    }
}