using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace MyHoT.Core.Data.Domain
{
    public class Location
    {
        public int Id { get; set; }

        public int ParentId { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public bool Moveable { get; set; }

        public Location Parent { get; set; }

        public ICollection<Tag> Tags { get; set; }

        internal static void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Location>()
                .HasOne(l => l.Parent)
                .WithMany()
                .HasForeignKey(l => l.ParentId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}