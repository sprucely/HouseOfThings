using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace HoT.Core.Data.Domain
{
    public class LocationType
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string IconClass { get; set; }

        internal static void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<LocationType>()
                .HasIndex(lt => new { lt.Name })
                .IsUnique();
        }
    }
}