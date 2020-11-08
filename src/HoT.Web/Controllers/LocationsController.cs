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

        [HttpPost]
        [Route("search")]
        public async Task<ActionResult<IEnumerable<LocationModel>>> Search([FromBody]TagFilterModel filter) {
            if (!filter?.Tags?.Any() ?? false)
                return new LocationModel[]{};

            IQueryable<Location> filteredLocations = null;

            var tagIds = filter.Tags.Select(t => t.Id).Distinct().ToArray();

            if (filter.IncludeAllTags)
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
                var parentLocationIds = _dbContext.Locations
                    .Where(l => l.Tags.Any(t => tagIds.Contains(t.Id)))
                    .Select(l => l.Id);

                var childLocationIds = _dbContext.LocationsClosures
                    .Where(lc => parentLocationIds.Contains(lc.ParentId))
                    .Select(lc => lc.ChildId);


                filteredLocations = _dbContext.Locations
                    .Where(l => childLocationIds.Contains(l.Id));
            }

            var results = await filteredLocations
                .Select(l => new LocationModel{ Id = l.Id, Name = l.Name, Description = l.Description, Moveable = l.Moveable})
                .ToListAsync();

            return results;
        }
    }
}
