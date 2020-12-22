using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using Microsoft.EntityFrameworkCore;

namespace HoT.Core.Data.Domain
{
    public class Tag: IEquatable<Tag>
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public ICollection<Item> Items { get; set; }

        public ICollection<Location> Locations { get; set; }
        
        internal static void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Tag>()
                .HasIndex(lt => new { lt.Name })
                .IsUnique();
        }

        public override bool Equals(object obj)
        {
            return Equals(obj as Tag);
        }

        public bool Equals(Tag other)
        {
            return other != null && other.Name == Name;
        }

        public override int GetHashCode()
        {
            var hashcode = 352033288;
            hashcode = hashcode * -1521134295 + Name.GetHashCode();
            return hashcode;
        }
    }
}