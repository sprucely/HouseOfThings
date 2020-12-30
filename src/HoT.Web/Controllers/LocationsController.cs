using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using HoT.Core.Data;
using HoT.Core.Data.Models;
using HoT.Core.Data.Domain;
using HoT.Core.Utilities;

namespace HoT.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LocationsController : ControllerBase
    {
        private readonly ILogger<LocationsController> _logger;
        private readonly AppDbContext _dbContext;

        public LocationsController(ILogger<LocationsController> logger, AppDbContext dbContext)
        {
            _logger = logger;
            _dbContext = dbContext;
        }

        [HttpGet]
        [Route("locationtypes")]
        public async Task<ActionResult<IEnumerable<LocationType>>> LocationTypes()
        {
            return await _dbContext.LocationTypes.OrderBy(lt => lt.Name).ToArrayAsync();
        }

        [HttpPost]
        [Route("create")]
        public async Task<ActionResult<LocationModel>> Create([FromBody] LocationModel locationModel)
        {
            var nextSiblingSort = (await _dbContext.Locations
                .Where(l => l.ParentId == locationModel.ParentId)
                .OrderBy(l => l.Sort)
                .Select(l => l.Sort)
                .FirstOrDefaultAsync())
                ?? "";

            var locationTypeId = await _dbContext.LocationTypes
                .Where(l => l.Name == locationModel.LocationType)
                .Select(l => l.Id)
                .SingleAsync();




            var location = new Location
            {
                Name = locationModel.Name,
                Description = locationModel.Description,
                ParentId = locationModel.ParentId,
                Tags = new List<Tag>(),
                Sort = nextSiblingSort.GetPreviousMidstring(""),
                LocationTypeId = locationTypeId
            };

            _dbContext.Locations.Add(location);

            var allTagNames = locationModel.GetTagNames();

            if (allTagNames.Any())
            {
                var tags = await _dbContext.CreateOrFindTags(allTagNames);
                tags.ForEach(location.Tags.Add);
            }

            await _dbContext.SaveChangesAsync();

            locationModel.Id = location.Id;

            return locationModel;
        }

        [HttpPost]
        [Route("update")]
        public async Task<ActionResult<LocationModel>> Update([FromBody] LocationModel locationModel)
        {
            var locationTypeId = await _dbContext.LocationTypes
                .Where(lt => lt.Name == locationModel.LocationType)
                .Select(lt => lt.Id)
                .SingleAsync();

            var location = await _dbContext.Locations
                .Where(l => l.Id == locationModel.Id)
                .Include(l => l.Tags)
                .SingleAsync();

            location.Name = locationModel.Name;
            location.Description = locationModel.Description;
            location.LocationTypeId = locationTypeId;

            // reconcile current and wanted tags....
            var allTagNames = locationModel.GetTagNames();

            var wantedTags = (await _dbContext.CreateOrFindTags(allTagNames)).ToHashSet();
            var currentTags = location.Tags.ToHashSet();

            foreach (var removeTag in currentTags.Except(wantedTags))
            {
                location.Tags.Remove(removeTag);
            }

            foreach (var addTag in wantedTags.Except(currentTags))
            {
                location.Tags.Add(addTag);
            }

            await _dbContext.SaveChangesAsync();

            return locationModel;
        }

        [HttpPost]
        [Route("move")]
        public async Task<ActionResult<IEnumerable<LocationModel>>> Move([FromBody] MoveLocationModel moveLocationModel)
        {
            if (!moveLocationModel.ToChildOfLocationId.HasValue && !moveLocationModel.ToSiblingOfLocationId.HasValue)
                return BadRequest();

            var moveLocation = await _dbContext.Locations.SingleAsync(l => l.Id == moveLocationModel.MoveLocationId);

            if (moveLocationModel.ToChildOfLocationId.HasValue)
            {
                // get Sort value of new parent location's first child
                var firstChildSort = (await _dbContext.Locations
                    .Where(l => l.ParentId == moveLocationModel.ToChildOfLocationId)
                    .OrderBy(l => l.Sort)
                    .Select(l => l.Sort)
                    .FirstOrDefaultAsync())
                    ?? "";

                moveLocation.ParentId = moveLocationModel.ToChildOfLocationId;
                moveLocation.Sort = "".GetNextMidstring(firstChildSort);

            }
            else
            {
                var siblingParentIdAndSorts = await (
                    from sibling in _dbContext.Locations.Where(l => l.Id == moveLocationModel.ToSiblingOfLocationId)
                    from location in _dbContext.Locations
                    where string.Compare(location.Sort, sibling.Sort) >= 0 && location.ParentId == sibling.ParentId
                    orderby location.Sort
                    select new { location.ParentId, location.Sort })
                    .Take(2)
                    .ToArrayAsync();

                moveLocation.ParentId = siblingParentIdAndSorts[0].ParentId;
                moveLocation.Sort = siblingParentIdAndSorts[0].Sort.GetNextMidstring(
                    siblingParentIdAndSorts.Length == 2
                    ? siblingParentIdAndSorts[1].Sort
                    : "");
            }

            await _dbContext.SaveChangesAsync();

            return await Search(moveLocationModel.LocationFilter);
        }

        [HttpPost]
        [Route("search")]
        public async Task<ActionResult<IEnumerable<LocationModel>>> Search([FromBody] LocationFilterModel locationFilter)
        {
            var filteredLocations = locationFilter switch
            {
                { TagFilter: { Tags: { Count: > 0 } } } => GetLocationsByTagFilter(locationFilter.TagFilter),
                { LocationId: not null } => GetLocationsByLocationId(locationFilter.LocationId),
                _ => GetLocationsByParentId(locationFilter.ParentId)
            };

            var models = await filteredLocations
                .OrderBy(l => l.ParentId)
                .ThenBy(l => l.Sort)
                .Select(l => new LocationModel
                {
                    Id = l.Id,
                    ParentId = l.ParentId,
                    Name = l.Name,
                    Description = l.Description,
                    Moveable = l.Moveable,
                    Expanded = true,
                    LocationType = l.LocationType.Name,
                })
                .ToListAsync();

            // get depth and path from effective root locations
            // TODO: try to incorporate this logic into above query
            var modelsById = models.ToDictionary(m => m.Id);
            var rootModelIds = models
                .Where(m => m.ParentId == null || !modelsById.ContainsKey(m.ParentId.Value))
                .Select(m => m.Id);
            foreach (var closure in _dbContext.LocationsClosures
                .Where(c => rootModelIds.Contains(c.ParentId) && modelsById.Keys.Contains(c.ChildId)))
            {
                var model = modelsById[closure.ChildId];
                model.RootId = closure.ParentId;
                model.Depth = closure.Depth;
                model.Path = closure.Path;
            }

            return models.OrderBy(m => m.Path).ToArray();
        }

        private IQueryable<Location> GetLocationsByParentId(int? parentId)
        {
            var locationIds = _dbContext.Locations
                .Where(l => l.ParentId == parentId)
                .Select(l => l.Id);

            var descendantLocationIds = _dbContext.LocationsClosures
                .Where(lc => locationIds.Contains(lc.ParentId))
                .Select(lc => lc.ChildId);

            return _dbContext.Locations
                .Where(l => descendantLocationIds.Contains(l.Id));
        }

        private IQueryable<Location> GetLocationsByLocationId(int? locationId)
        {
            var descendantLocationIds = _dbContext.LocationsClosures
                .Where(lc => lc.ParentId == locationId)
                .Select(lc => lc.ChildId);

            return _dbContext.Locations
                .Where(l => descendantLocationIds.Contains(l.Id));
        }

        private IQueryable<Location> GetLocationsByTagFilter(TagFilterModel tagFilter)
        {
            IQueryable<Location> filteredLocations = null;

            var tagIds = tagFilter.Tags.Select(t => t.Id).Distinct().ToArray();

            if (tagFilter.IncludeAllTags)
            {
                // return locations whose selves or ancestors are tagged with ALL given tags
                var taggedLocationChildren =
                    from lt in _dbContext.LocationsTags.Where(lt => tagIds.Contains(lt.TagId))
                    join lc in _dbContext.LocationsClosures on lt.LocationId equals lc.ParentId
                    select new { lt.TagId, lc.ChildId };

                var locationChildrenWithAllTags =
                    from tc in taggedLocationChildren.Distinct()
                    group tc by tc.ChildId into g
                    where g.Count() == tagIds.Length
                    select g.Key;

                filteredLocations = _dbContext.Locations
                    .Where(l => locationChildrenWithAllTags.Contains(l.Id));
            }
            else
            {
                // return locations whose selves or ancestors are tagged with ANY given tags
                var ancestorLocationIds = _dbContext.Locations
                    .Where(l => l.Tags.Any(t => tagIds.Contains(t.Id)))
                    .Select(l => l.Id);

                var descendantLocationIds = _dbContext.LocationsClosures
                    .Where(lc => ancestorLocationIds.Contains(lc.ParentId))
                    .Select(lc => lc.ChildId);


                filteredLocations = _dbContext.Locations
                    .Where(l => descendantLocationIds.Contains(l.Id));
            }

            return filteredLocations;
        }
    }
}
