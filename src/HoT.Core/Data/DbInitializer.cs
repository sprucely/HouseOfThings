using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HoT.Core.Data.Domain;
using HoT.Core.Utilities;
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
            var locationTypeDefault = await _dbContext.CreateOrFindLocationType("Default", "flaticon-folder");
            var locationTypeHouse = await _dbContext.CreateOrFindLocationType("House", "flaticon-house");
            var locationTypeRoom = await _dbContext.CreateOrFindLocationType("Room", "flaticon-room");
            var locationTypeCloset = await _dbContext.CreateOrFindLocationType("Closet", "flaticon-closet");
            var locationTypeCabinet = await _dbContext.CreateOrFindLocationType("Cabinet", "flaticon-cabinet");
            var locationTypeShelf = await _dbContext.CreateOrFindLocationType("Shelf", "flaticon-shelf2");
            var locationTypeDrawer = await _dbContext.CreateOrFindLocationType("Drawer", "flaticon-drawer");
            var locationTypeBox = await _dbContext.CreateOrFindLocationType("Box", "flaticon-box");
            var locationTypeBin = await _dbContext.CreateOrFindLocationType("Bin", "flaticon-bin");
            var locationTypeFreezer = await _dbContext.CreateOrFindLocationType("Freezer", "flaticon-freezer");
            var locationTypeFridge = await _dbContext.CreateOrFindLocationType("Fridge", "flaticon-fridge");
            var locationTypeSurface = await _dbContext.CreateOrFindLocationType("Surface", "flaticon-surface");
            var locationTypeFloor = await _dbContext.CreateOrFindLocationType("Floor", "flaticon-stairs");

            var house = await _dbContext.CreateOrFindLocation("House", locationTypeHouse);
            var upstairs = await _dbContext.CreateOrFindLocation("Upstairs", locationTypeFloor, house.Id);
            var downstairs = await _dbContext.CreateOrFindLocation("Downstairs", locationTypeFloor, house.Id);
            var masterBedroom = await _dbContext.CreateOrFindLocation("Master Bedroom", locationTypeRoom, upstairs.Id, "Room");
            var northBedroom = await _dbContext.CreateOrFindLocation("North Bedroom", locationTypeRoom, upstairs.Id, "Room");
            var southBedroom = await _dbContext.CreateOrFindLocation("South Bedroom", locationTypeRoom, upstairs.Id, "Room");
            var upstairsHallway = await _dbContext.CreateOrFindLocation("Upstairs Hallway", locationTypeDefault, upstairs.Id);
            var downstairsHallway = await _dbContext.CreateOrFindLocation("Downstairs Hallway", locationTypeDefault, downstairs.Id);
            var kitchen = await _dbContext.CreateOrFindLocation("Kitchen", locationTypeRoom, downstairs.Id);
            var upstairsBath = await _dbContext.CreateOrFindLocation("Upstairs Bathroom", locationTypeRoom, upstairs.Id);
            var masterBath = await _dbContext.CreateOrFindLocation("Master Bathroom", locationTypeRoom, masterBedroom.Id);
            var downstairsBath = await _dbContext.CreateOrFindLocation("Downstairs Bathroom", locationTypeRoom, downstairs.Id);
            var livingRoom = await _dbContext.CreateOrFindLocation("Living Room", locationTypeRoom, downstairs.Id, "TV");
            var familyRoom = await _dbContext.CreateOrFindLocation("Family Room", locationTypeRoom, downstairs.Id, "Fireplace");
            var laundryRoom = await _dbContext.CreateOrFindLocation("Laundry Room", locationTypeRoom, downstairs.Id);
            var garage = await _dbContext.CreateOrFindLocation("Garage", locationTypeRoom, downstairs.Id);
        }
    }
}