using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HoT.Core.Data.Domain;
using Microsoft.EntityFrameworkCore;

namespace HoT.Core.Data
{
    public class DbInitializer
    {
        private readonly AppDbContext _dbContext;

        public DbInitializer(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task Initialize()
        {
            var house = await CreateOrFindLocation("House");
            var upstairs = await CreateOrFindLocation("Upstairs", house.Id);
            var downstairs = await CreateOrFindLocation("Downstairs", house.Id);
            var masterBedroom = await CreateOrFindLocation("Master Bedroom", upstairs.Id, "Room");
            var northBedroom = await CreateOrFindLocation("North Bedroom", upstairs.Id, "Room");
            var southBedroom = await CreateOrFindLocation("South Bedroom", upstairs.Id, "Room");
            var upstairsHallway = await CreateOrFindLocation("Upstairs Hallway", upstairs.Id);
            var downstairsHallway = await CreateOrFindLocation("Downstairs Hallway", downstairs.Id);
            var kitchen = await CreateOrFindLocation("Kitchen", downstairs.Id);
            var upstairsBath = await CreateOrFindLocation("Upstairs Bathroom", upstairs.Id);
            var masterBath = await CreateOrFindLocation("Master Bathroom", masterBedroom.Id);
            var downstairsBath = await CreateOrFindLocation("Downstairs Bathroom", downstairs.Id);
            var livingRoom = await CreateOrFindLocation("Living Room", downstairs.Id, "TV");
            var familyRoom = await CreateOrFindLocation("Family Room", downstairs.Id, "Fireplace");
            var laundryRoom = await CreateOrFindLocation("Laundry Room", downstairs.Id);
            var garage = await CreateOrFindLocation("Garage", downstairs.Id);
        }

        private async Task<Location> CreateOrFindLocation(string name, int? parentId = null, params string[] tagNames)
        {
            var location = _dbContext.Locations.FirstOrDefault(l => l.Name == name);

            if (location != null)
                return location;

            location = new Location{ Name = name, ParentId = parentId, Tags = new List<Tag>() };
            
            _dbContext.Locations.Add(location);

            var allTagNames = name.Split(" ", StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Concat(tagNames)
                .Distinct(StringComparer.OrdinalIgnoreCase);

            if (allTagNames.Any())
            {
                var tags = await CreateOrFindTags(allTagNames);
                tags.ForEach(location.Tags.Add);
            }

            _dbContext.SaveChanges();

            return location;
        }

        private async Task<List<Tag>> CreateOrFindTags(IEnumerable<string> tagNames)
        {
            var existingTags = await _dbContext.Tags.Where(t => tagNames.Contains(t.Name)).ToListAsync();
            var createTagNames = tagNames.Except(existingTags.Select(t => t.Name), StringComparer.OrdinalIgnoreCase).ToArray();
            
            if (createTagNames.Length > 0)
            {
                foreach (var tagName in createTagNames)
                {
                    var tag = new Tag{ Name = tagName };
                    _dbContext.Tags.Add(tag);
                    existingTags.Add(tag);
                }

                _dbContext.SaveChanges();
            }

            return existingTags;
        }
    }
}