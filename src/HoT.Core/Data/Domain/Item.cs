using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace HoT.Core.Data.Domain
{
    public class Item
    {
        public int Id { get; set; }

        public int LocationId { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public Location Location { get; set; }

        public ICollection<Tag> Tags { get; set; }

        public ICollection<Photo> Photos { get; set; }

        public override string ToString()
        {
            return $"Item: {Name}" + ((Tags?.Any() ?? false)
                ? $"(Tags: {string.Join(", ", Tags.Select(t => t.Name))})"
                : "");
        }

        internal static void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Item>()
                .HasIndex(i => i.Name);
            modelBuilder.Entity<Item>()
                .HasIndex(i => i.LocationId);
            modelBuilder.Entity<Item>()
                .HasOne(i => i.Location)
                .WithMany(l => l.Items)
                .HasForeignKey(l => l.LocationId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}