using System.Collections.Generic;

namespace HoT.Core.Data.Models
{
    public class LocationModel
    {
        public int Id { get; set; }

        public int? ParentId { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public bool Expanded { get; set; }

        public bool Moveable { get; set; }

        public List<LocationModel> Children { get; set; }
    }
}