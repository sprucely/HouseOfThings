using System.Collections.Generic;

namespace HoT.Core.Data.Models
{
    public class LocationModel
    {
        public int Id { get; set; }

        public int? ParentId { get; set; }

        public int RootId { get; set; }

        public int Depth { get; set; }

        public string Path { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public bool Expanded { get; set; }

        public bool Moveable { get; set; }

        public string LocationType { get; set; }
    }
}