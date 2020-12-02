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
        private readonly IDbHelper _dbHelper;

        public DbInitializer(AppDbContext dbContext, IDbHelper dbHelper)
        {
            _dbContext = dbContext;
            _dbHelper = dbHelper;
        }

        public async Task Initialize()
        {
            var locationTypeDefault = await _dbHelper.CreateOrFindLocationType("Default", "flaticon-folder");
            var locationTypeHouse = await _dbHelper.CreateOrFindLocationType("House", "flaticon-house");
            var locationTypeRoom = await _dbHelper.CreateOrFindLocationType("Room", "flaticon-room");
            var locationTypeCloset = await _dbHelper.CreateOrFindLocationType("Closet", "flaticon--closet");
            var locationTypeCabinet = await _dbHelper.CreateOrFindLocationType("Cabinet", "flaticon-cabinet");
            var locationTypeShelf = await _dbHelper.CreateOrFindLocationType("Shelf", "flaticon-shelf");
            var locationTypeDrawer = await _dbHelper.CreateOrFindLocationType("Drawer", "flaticon-drawer");
            var locationTypeBox = await _dbHelper.CreateOrFindLocationType("Box", "vbox");
            var locationTypeBin = await _dbHelper.CreateOrFindLocationType("Bin", "folder big icon");
            var locationTypeFreezer = await _dbHelper.CreateOrFindLocationType("Freezer", "flaticon-freezer");
            var locationTypeFridge = await _dbHelper.CreateOrFindLocationType("Fridge", "flaticon-fridge");
            var locationTypeSurface = await _dbHelper.CreateOrFindLocationType("Surface", "flaticon-surface");
            var locationTypeFloor = await _dbHelper.CreateOrFindLocationType("Floor", "flaticon-stairs");

            var house = await _dbHelper.CreateOrFindLocation("House", locationTypeHouse);
            var upstairs = await _dbHelper.CreateOrFindLocation("Upstairs", locationTypeFloor, house.Id);
            var downstairs = await _dbHelper.CreateOrFindLocation("Downstairs", locationTypeFloor, house.Id);
            var masterBedroom = await _dbHelper.CreateOrFindLocation("Master Bedroom", locationTypeRoom, upstairs.Id, "Room");
            var northBedroom = await _dbHelper.CreateOrFindLocation("North Bedroom", locationTypeRoom, upstairs.Id, "Room");
            var southBedroom = await _dbHelper.CreateOrFindLocation("South Bedroom", locationTypeRoom, upstairs.Id, "Room");
            var upstairsHallway = await _dbHelper.CreateOrFindLocation("Upstairs Hallway", locationTypeDefault, upstairs.Id);
            var downstairsHallway = await _dbHelper.CreateOrFindLocation("Downstairs Hallway", locationTypeDefault, downstairs.Id);
            var kitchen = await _dbHelper.CreateOrFindLocation("Kitchen", locationTypeRoom, downstairs.Id);
            var upstairsBath = await _dbHelper.CreateOrFindLocation("Upstairs Bathroom", locationTypeRoom, upstairs.Id);
            var masterBath = await _dbHelper.CreateOrFindLocation("Master Bathroom", locationTypeRoom, masterBedroom.Id);
            var downstairsBath = await _dbHelper.CreateOrFindLocation("Downstairs Bathroom", locationTypeRoom, downstairs.Id);
            var livingRoom = await _dbHelper.CreateOrFindLocation("Living Room", locationTypeRoom, downstairs.Id, "TV");
            var familyRoom = await _dbHelper.CreateOrFindLocation("Family Room", locationTypeRoom, downstairs.Id, "Fireplace");
            var laundryRoom = await _dbHelper.CreateOrFindLocation("Laundry Room", locationTypeRoom, downstairs.Id);
            var garage = await _dbHelper.CreateOrFindLocation("Garage", locationTypeRoom, downstairs.Id);
        }
    }
}