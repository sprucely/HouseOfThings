using System.Collections.Generic;

namespace HoT.Core.Data.Models
{
    public class TagFilterModel
    {
        public bool IncludeAllTags { get; set; }
        public List<TagModel> Tags { get; set; }
    }
}