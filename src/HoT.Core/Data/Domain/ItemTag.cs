using Microsoft.EntityFrameworkCore;

namespace HoT.Core.Data.Domain
{
    public class ItemTag
    {
        public int ItemId { get; set; }

        public int TagId { get; set; }

        public Item Item { get; set; }

        public Tag Tag { get; set; }

        internal static void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ItemTag>()
                .HasKey(it => new { it.ItemId, it.TagId });
            modelBuilder.Entity<ItemTag>()
                .HasIndex(it => it.TagId);
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
        }
    }
}