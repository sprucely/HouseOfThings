using System.Collections.Generic;

namespace HoT.Core.Data.Models
{
    public class ItemFilterModel
    {
        public TagFilterModel TagFilter { get; set; }
        
        public int? LocationId { get; set; }
    }
}