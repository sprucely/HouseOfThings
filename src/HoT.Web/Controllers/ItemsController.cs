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
using EFCore.BulkExtensions;

namespace HoT.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItemsController : ControllerBase
    {
        private readonly ILogger<ItemsController> _logger;
        private readonly AppDbContext _dbContext;

        public ItemsController(ILogger<ItemsController> logger, AppDbContext dbContext)
        {
            _logger = logger;
            _dbContext = dbContext;
        }

        [HttpPost]
        [Route("create")]
        public async Task<ActionResult<ItemModel>> Create([FromBody] ItemModel itemModel)
        {
            var item = new Item
            {
                Name = itemModel.Name,
                Description = itemModel.Description,
                LocationId = itemModel.LocationId,
                Tags = new List<Tag>(),
            };

            _dbContext.Items.Add(item);

            var allTagNames = itemModel.GetTagNames();

            if (allTagNames.Any())
            {
                var tags = await _dbContext.CreateOrFindTags(allTagNames);
                tags.ForEach(item.Tags.Add);
            }

            await _dbContext.SaveChangesAsync();

            var photoIds = itemModel.Photos?.Where(p => p.Id > 0).Select(p => p.Id) ?? Enumerable.Empty<int>();

            if (photoIds.Any())
                await _dbContext.Photos.Where(p => photoIds.Contains(p.Id)).BatchUpdateAsync(new Photo { ItemId = item.Id });

            itemModel.Id = item.Id;
            itemModel.LocationName = await _dbContext.Locations
                .Where(l => l.Id == itemModel.LocationId)
                .Select(l => l.Name)
                .SingleAsync();

            return itemModel;
        }

        [HttpPost]
        [Route("update")]
        public async Task<ActionResult<ItemModel>> Update([FromBody] ItemModel itemModel)
        {
            var item = await _dbContext.Items
                .Where(i => i.Id == itemModel.Id)
                .Include(i => i.Tags)
                .SingleAsync();

            item.Name = itemModel.Name;
            item.Description = itemModel.Description;

            // reconcile current and wanted tags....
            var allTagNames = itemModel.GetTagNames();

            var wantedTags = (await _dbContext.CreateOrFindTags(allTagNames)).ToHashSet();
            var currentTags = item.Tags.ToHashSet();

            foreach (var removeTag in currentTags.Except(wantedTags))
            {
                item.Tags.Remove(removeTag);
            }

            foreach (var addTag in wantedTags.Except(currentTags))
            {
                item.Tags.Add(addTag);
            }

            await _dbContext.SaveChangesAsync();

            // Trading round trips (cheap with Sqlite) for lighter memory load. We don't
            // want to load images into memory just to change a name or assign a key.
            var desiredPhotoIds = itemModel.Photos?.Where(p => p.Id > 0).Select(p => p.Id).ToArray() ?? new int[] { };
            var existingPhotoIds = await _dbContext.Photos.Where(p => p.ItemId == item.Id).Select(p => p.Id).ToArrayAsync();
            var addPhotos = desiredPhotoIds.Except(existingPhotoIds);
            var deletePhotos = existingPhotoIds.Except(desiredPhotoIds);

            if (addPhotos.Any())
                await _dbContext.Photos.Where(p => addPhotos.Contains(p.Id)).BatchUpdateAsync(new Photo { ItemId = item.Id });

            if (deletePhotos.Any())
                await _dbContext.Photos.Where(p => deletePhotos.Contains(p.Id)).BatchDeleteAsync();

            if (itemModel.Photos != null)
            {
                foreach (var photo in itemModel.Photos)
                {
                    await _dbContext.Photos.Where(p => p.Id == photo.Id && p.Name != photo.Name).BatchUpdateAsync(new Photo { Name = photo.Name });
                }
            }

            return itemModel;
        }

        [HttpPost]
        [Route("move")]
        public async Task<ActionResult> Move([FromBody] MoveItemsModel moveItemsModel)
        {
            var moveLocation = await _dbContext.Locations.SingleAsync(l => l.Id == moveItemsModel.ToLocationId);

            var items = await _dbContext.Items.Where(i =>
                i.LocationId != moveItemsModel.ToLocationId
                && moveItemsModel.ItemIds.Contains(i.Id))
                .ToArrayAsync();

            foreach (var item in items)
            {
                item.LocationId = moveItemsModel.ToLocationId;
            }

            await _dbContext.SaveChangesAsync();

            return Ok();
        }

        [HttpPost]
        [Route("search")]
        public async Task<ActionResult<IEnumerable<ItemModel>>> Search([FromBody] ItemFilterModel filter)
        {
            var filteredItems = filter switch
            {
                { TagFilter: { Tags: { Count: > 0 } } } => GetItemsByTagFilter(filter.TagFilter),
                { LocationId: not null } => GetItemsByLocationId(filter.LocationId.Value),
                _ => null
            };

            var models = filteredItems != null
                ? await filteredItems
                    .OrderBy(l => l.Name)
                    .Select(l => new ItemModel
                    {
                        Id = l.Id,
                        LocationId = l.LocationId,
                        LocationName = l.Location.Name,
                        Name = l.Name,
                        Description = l.Description,
                        Photos = l.Photos.Select(p => new PhotoModel { Id = p.Id, ItemId = p.ItemId, Name = p.Name }).ToList()
                    })
                    .ToArrayAsync()
                : new ItemModel[] { };

            return models;
        }

        private IQueryable<Item> GetItemsByLocationId(int locationId)
        {
            var filteredItems = _dbContext.Items
                .Where(i => i.LocationId == locationId);

            return filteredItems;
        }

        private IQueryable<Item> GetItemsByTagFilter(TagFilterModel tagFilter)
        {
            IQueryable<Item> filteredItems = null;
            var tagIds = tagFilter.Tags.Select(t => t.Id).Distinct().ToArray();

            if (tagFilter.IncludeAllTags)
            {
                // return items that are tagged with ALL given tags
                var itemIds = _dbContext.ItemsTags
                    .Where(it => tagIds.Contains(it.TagId))
                    .GroupBy(it => it.ItemId)
                    .Where(g => g.Count() == tagIds.Length)
                    .Select(g => g.Key);

                filteredItems = _dbContext.Items.Where(i => itemIds.Contains(i.Id));
            }
            else
            {
                // return items that are tagged with ANY of given tags
                var itemIds = _dbContext.ItemsTags
                    .Where(it => tagIds.Contains(it.TagId))
                    .GroupBy(it => it.ItemId)
                    .Select(g => g.Key);

                filteredItems = _dbContext.Items.Where(i => itemIds.Contains(i.Id));
            }

            return filteredItems;
        }
    }
}
