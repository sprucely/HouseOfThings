using System.Net.Http.Headers;
using System.Net.Http;
using System.Net.Mime;
using System.IO;
using System.Diagnostics;
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
    public class PhotosController : ControllerBase
    {
        private readonly ILogger<PhotosController> _logger;
        private readonly AppDbContext _dbContext;

        public PhotosController(ILogger<PhotosController> logger, AppDbContext dbContext)
        {
            _logger = logger;
            _dbContext = dbContext;
        }

        [HttpGet("image/{id}")]
        public async Task<ActionResult> GetImage(int id)
        {
            var image = await _dbContext.Photos.Where(p => p.Id == id).Select(p => p.Image).SingleAsync();
            return File(image, "image/jpeg");
        }

        [HttpGet("thumbnail/{id}")]
        public async Task<ActionResult> GetThumbnail(int id)
        {
            var image = await _dbContext.Photos.Where(p => p.Id == id).Select(p => p.Thumbnail).SingleAsync();
            return File(image, "image/jpeg");
        }

        [HttpPost]
        [Route("create")]
        public async Task<ActionResult<IEnumerable<PhotoModel>>> Create([FromForm] UpdatePhotosModel photosModel)
        {
            var count = photosModel.Names?.Count ?? 0;
            if (count == 0
                || photosModel.Images.Count != count
                || photosModel.Thumbnails.Count != count
                || photosModel.Images.Concat(photosModel.Thumbnails).Any(p => p == null || p.Length == 0))
            {
                return BadRequest();
            }

            var result = new List<PhotoModel>(count);

            for (var i = 0; i < count; i++)
            {
                var image = photosModel.Images[i];
                var thumbnail = photosModel.Thumbnails[i];

                var photo = new Photo
                {
                    Name = photosModel.Names[i],
                };

                using (var ms = new MemoryStream())
                {
                    image.CopyTo(ms);
                    photo.Image = ms.ToArray();
                }

                using (var ms = new MemoryStream())
                {
                    thumbnail.CopyTo(ms);
                    photo.Thumbnail = ms.ToArray();
                }

                _dbContext.Photos.Add(photo);
                await _dbContext.SaveChangesAsync();

                result.Add(new PhotoModel { Id = photo.Id, Name = photo.Name });
            }

            return Ok(result);
        }

        [HttpPost]
        [Route("update")]
        public async Task<ActionResult> Update([FromForm] UpdatePhotosModel photosModel)
        {
            var count = photosModel.Names?.Count ?? 0;
            if (count == 0
                || photosModel.Ids.Count != count
                || photosModel.Images.Count != count
                || photosModel.Thumbnails.Count != count
                || photosModel.Images.Concat(photosModel.Thumbnails).Any(p => p == null || p.Length == 0))
            {
                return BadRequest();
            }

            for (var i = 0; i < count; i++)
            {
                var image = photosModel.Images[i];
                var thumbnail = photosModel.Thumbnails[i];

                var photo = new Photo
                {
                    Id = photosModel.Ids[i],
                    Name = photosModel.Names[i],
                };

                using (var ms = new MemoryStream())
                {
                    image.CopyTo(ms);
                    photo.Image = ms.ToArray();
                }

                using (var ms = new MemoryStream())
                {
                    thumbnail.CopyTo(ms);
                    photo.Thumbnail = ms.ToArray();
                }

                _dbContext.Photos.Attach(photo);
                await _dbContext.SaveChangesAsync();
            }

            return Ok();
        }
    }
}
