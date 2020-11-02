using System.Collections.Generic;
using System.Linq;

namespace HoT.Core.Data.Domain
{
    public class Item
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public ICollection<Tag> Tags { get; set; }

        public ICollection<Photo> Photos { get; set; }

        public override string ToString()
        {
            return $"Item: {Name}" + ((Tags?.Any() ?? false) 
                ? $"(Tags: {string.Join(", ", Tags.Select(t => t.Name))})" 
                : "");
        }
    }
}