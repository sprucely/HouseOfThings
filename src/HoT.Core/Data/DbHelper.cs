using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HoT.Core.Data.Domain;
using HoT.Core.Utilities;
using Microsoft.EntityFrameworkCore;

namespace HoT.Core.Data
{
    public interface IDbHelper
    {
        Task<Location> CreateOrFindLocation(string name, LocationType locationType = null, int? parentId = null, params string[] tagNames);
        Task<List<Tag>> CreateOrFindTags(IEnumerable<string> tagNames);
        Task<LocationType> CreateOrFindLocationType(string Name, string iconClass);
    }

    public class DbHelper: IDbHelper
    {
        private AppDbContext _dbContext;

        private Lazy<LocationType> _defaultLocationType;

        public DbHelper(AppDbContext dbContext)
        {
            _dbContext = dbContext;
            _defaultLocationType = new Lazy<LocationType>(() => _dbContext.LocationTypes.Single(lt => lt.Name == "Default"));
        }

        public async Task<Location> CreateOrFindLocation(string name, LocationType locationType = null, int? parentId = null, params string[] tagNames)
        {
            var location = await _dbContext.Locations.FirstOrDefaultAsync(l => l.Name == name);

            if (location != null)
                return location;

            locationType ??= _defaultLocationType.Value;
            
            var previousSiblingSort = (await _dbContext.Locations
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

            _dbContext.Locations.Add(location);

            var allTagNames = name.Split(" ", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Concat(tagNames)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .RemoveStopWords();

            if (allTagNames.Any())
            {
                var tags = await CreateOrFindTags(allTagNames);
                tags.ForEach(location.Tags.Add);
            }

            _dbContext.SaveChanges();

            return location;
        }

        public async Task<LocationType> CreateOrFindLocationType(string name, string iconClass = "folder")
        {
            var locationType = await _dbContext.LocationTypes.FirstOrDefaultAsync(l => l.Name == name);

            if (locationType != null)
                return locationType;

            locationType = new LocationType
            {
                Name = name,
                IconClass = iconClass
            };

            _dbContext.LocationTypes.Add(locationType);

            await _dbContext.SaveChangesAsync();

            return locationType;
        }

        public async Task<List<Tag>> CreateOrFindTags(IEnumerable<string> tagNames)
        {
            var existingTags = await _dbContext.Tags.Where(t => tagNames.Contains(t.Name)).ToListAsync();
            var createTagNames = tagNames.Except(existingTags.Select(t => t.Name), StringComparer.OrdinalIgnoreCase).ToArray();

            if (createTagNames.Length > 0)
            {
                foreach (var tagName in createTagNames)
                {
                    var tag = new Tag { Name = tagName };
                    _dbContext.Tags.Add(tag);
                    existingTags.Add(tag);
                }

                await _dbContext.SaveChangesAsync();
            }

            return existingTags;
        }

    }
}