using System;
using Microsoft.EntityFrameworkCore;

namespace HoT.Core.Data.Domain
{
    public class Photo
    {
        public int Id { get; set; }

        public int ItemId { get; set; }

        public string Name { get; set; }

        public byte[] Thumbnail { get; set; }

        public byte[] Image { get; set; }

        public Item Item { get; set; }

        internal static void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Photo>()
                .HasOne(p => p.Item)
                .WithMany(i => i.Photos)
                .HasForeignKey(p => p.ItemId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}