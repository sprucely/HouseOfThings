using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace MyHoT.Core.Data.Domain
{
    public class Tag
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public ICollection<Item> Items { get; set; }

        public ICollection<Location> Locations { get; set; }

        internal static void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Tag>()
                .HasMany(t => t.Items)
                .WithMany(i => i.Tags)
                .UsingEntity<ItemTag>(
                it => it
                    .HasOne(it => it.Item )
                    .WithMany()
                    .HasForeignKey(it => it.ItemId),
                it => it
                    .HasOne(it => it.Tag)
                    .WithMany()
                    .HasForeignKey(it => it.TagId))
                .ToTable("ItemsTags")
                .HasKey(it => new { it.ItemId, it.TagId });

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