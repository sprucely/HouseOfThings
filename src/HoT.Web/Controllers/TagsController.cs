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
    [Route("api/[controller]")]
    public class TagsController : ControllerBase
    {
        private readonly ILogger<TagsController> _logger;
        private readonly AppDbContext _dbContext;

        public TagsController(ILogger<TagsController> logger, AppDbContext dbContext)
        {
            _logger = logger;
            _dbContext = dbContext;
        }

        [HttpGet]
        [Route("search")]
        public async Task<ActionResult<IEnumerable<TagModel>>> Search([FromQuery]string q) {
            if (string.IsNullOrWhiteSpace(q))
                return new TagModel[]{};

            var tags = await _dbContext.Tags
                .Where(t => EF.Functions.Collate(t.Name, "NOCASE").StartsWith(q))
                .Select(t => new TagModel{ Id = t.Id, Name = t.Name })
                .AsNoTracking()
                .ToListAsync();

            return tags;
        }
    }
}
