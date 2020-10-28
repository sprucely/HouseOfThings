

using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using HoT.Core.Data.Domain;
using System.Data;

namespace HoT.Core.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options): base(options)
        {
            
        }

        public DbSet<Item> Items { get; set; }  

        public DbSet<ItemTag> ItemsTags { get; set; }

        public DbSet<Location> Locations { get; set; }

        public DbSet<LocationClosure> LocationsClosures { get; set; }

        public DbSet<LocationTag> LocationsTags { get; set; }

        public DbSet<Tag> Tags { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // SQLite specific: Default to always using NOCASE collation
            modelBuilder.UseCollation("NOCASE");

            LocationClosure.OnModelCreating(modelBuilder);
            Tag.OnModelCreating(modelBuilder);
            Location.OnModelCreating(modelBuilder);
            Photo.OnModelCreating(modelBuilder);
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
 
            // SQLite specific: Make sure NOCASE collation is overridden
            var connection = (SqliteConnection)Database.GetDbConnection();
            var closeConnection = false;

            if (connection.State != ConnectionState.Open)
            {
                connection.Open();
                closeConnection = true;
            }

            connection.CreateCollation("NOCASE", (x, y) => string.Compare(x, y, ignoreCase: true));

            if (closeConnection)
            {
                connection.Close();
            }
       }
    }


}