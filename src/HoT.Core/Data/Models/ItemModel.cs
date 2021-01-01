using System.Collections.Generic;

namespace HoT.Core.Data.Models
{
    public class ItemModel
    {
        public int Id { get; set; }

        public int LocationId { get; set; }

        public string LocationName { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }
    }
}