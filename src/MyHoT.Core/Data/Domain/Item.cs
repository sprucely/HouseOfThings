using System.Collections.Generic;

namespace MyHoT.Core.Data.Domain
{
    public class Item
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public ICollection<Tag> Tags { get; set; }

        public ICollection<Photo> Photos { get; set; }
    }
}