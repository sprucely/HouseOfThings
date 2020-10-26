using System;
using Microsoft.EntityFrameworkCore;

namespace MyHoT.Core.Data.Domain
{

    // Based on https://dirtsimple.org/2010/11/simplest-way-to-do-tree-based-queries.html
    //
    // insert into closure(parent, child, depth)
    // select p.parent, c.child, p.depth+c.depth+1
    // from closure p, closure c
    // where p.child=PARENT_ITEM and c.parent=CHILD_ITEM

    public class LocationClosure
    {
        public int ParentId { get; set; }

        public int ChildId { get; set; }

        public int Depth { get; set; }

        public Location Parent { get; set; }

        public Location Child { get; set; }

        internal static void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<LocationClosure>()
                .HasKey(lc => new { lc.ParentId, lc.Depth, lc.ChildId });
            modelBuilder.Entity<LocationClosure>()
                .HasIndex(lc => new { lc.ChildId, lc.ParentId, lc.Depth })
                .IsUnique();
            modelBuilder.Entity<LocationClosure>()
                .HasOne(lc => lc.Parent)
                .WithMany()
                .HasForeignKey(lc => lc.ParentId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<LocationClosure>()
                .HasOne(lc => lc.Child)
                .WithMany()
                .HasForeignKey(lc => lc.ChildId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}