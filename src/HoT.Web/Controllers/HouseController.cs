using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using HoT.Core.Data;
using HoT.Core.Data.Domain;
using HoT.Core.Data.Models;

namespace HoT.Web.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HouseController : ControllerBase
    {
        private readonly ILogger<HouseController> _logger;
        private readonly AppDbContext _dbContext;

        public HouseController(ILogger<HouseController> logger, AppDbContext dbContext)
        {
            _logger = logger;
            _dbContext = dbContext;
        }

        [HttpGet("api/locations")]
        public async Task<ActionResult<IEnumerable<Location>>> Locations(TagFilterModel filter)
        {
            var ids = filter.Tags.Select(t => t.Id).ToArray();

            var locations = await _dbContext.Locations
                .Where(l => ids.All(i => l.Tags.Any(t => t.Id == i)))
                .ToListAsync();

            return locations;
        }
    }
}
