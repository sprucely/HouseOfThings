using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace HoT.Core.Data.Domain
{
    public class Tag
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public ICollection<Item> Items { get; set; }

        public ICollection<Location> Locations { get; set; }
 }
}