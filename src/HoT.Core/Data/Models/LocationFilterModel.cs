using System.Collections.Generic;

namespace HoT.Core.Data.Models
{
    public class LocationFilterModel
    {
        public TagFilterModel TagFilter { get; set; }
        public int? LocationId { get; set; }
    }
}