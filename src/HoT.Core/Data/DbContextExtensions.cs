using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HoT.Core.Data.Domain;
using HoT.Core.Utilities;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace HoT.Core.Data
{
    public static class DbContextExtensions
    {
        public static void OverrideNoCaseCollation(this AppDbContext db)
        {
            if (db.Database.GetDbConnection() is SqliteConnection connection)
            {
                connection.Open();
                connection.CreateCollation("NOCASE", (x, y) =>
                {
                    return string.Compare(x, y, ignoreCase: true);
                });
                connection.Close();
            }

        }

        public static async Task<Location> CreateOrFindLocation(this AppDbContext dbContext, string name, LocationType locationType = null, int? parentId = null, params string[] tagNames)
        {
            var location = await dbContext.Locations.FirstOrDefaultAsync(l => l.Name == name);

            if (location != null)
                return location;

            locationType ??= dbContext.LocationTypes.Single(lt => lt.Name == "Default");

            var previousSiblingSort = (await dbContext.Locations
                .Where(l => l.ParentId == parentId)
                .OrderByDescending(l => l.Sort)
                .Select(l => l.Sort)
                .FirstOrDefaultAsync())
                ?? "";

            location = new Location
            {
                Name = name,
                ParentId = parentId,
                Tags = new List<Tag>(),
                Sort = previousSiblingSort.GetNextMidstring(""),
                LocationTypeId = locationType.Id
            };

            dbContext.Locations.Add(location);

            var allTagNames = name.Split(" ", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Concat(tagNames)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .RemoveStopWords();

            if (allTagNames.Any())
            {
                var tags = await CreateOrFindTags(dbContext, allTagNames);
                tags.ForEach(location.Tags.Add);
            }

            dbContext.SaveChanges();

            return location;
        }

        public static async Task<LocationType> CreateOrFindLocationType(this AppDbContext dbContext, string name, string iconClass = "folder")
        {
            var locationType = await dbContext.LocationTypes.FirstOrDefaultAsync(l => l.Name == name);

            if (locationType != null)
                return locationType;

            locationType = new LocationType
            {
                Name = name,
                IconClass = iconClass
            };

            dbContext.LocationTypes.Add(locationType);

            await dbContext.SaveChangesAsync();

            return locationType;
        }

        public static async Task<List<Tag>> CreateOrFindTags(this AppDbContext dbContext, IEnumerable<string> tagNames)
        {
            var existingTags = await dbContext.Tags.Where(t => tagNames.Contains(t.Name)).ToListAsync();
            var createTagNames = tagNames.Except(existingTags.Select(t => t.Name), StringComparer.OrdinalIgnoreCase).ToArray();

            if (createTagNames.Length > 0)
            {
                foreach (var tagName in createTagNames)
                {
                    var tag = new Tag { Name = tagName };
                    dbContext.Tags.Add(tag);
                    existingTags.Add(tag);
                }

                await dbContext.SaveChangesAsync();
            }

            return existingTags;
        }

    }
}