using System.Collections.Generic;

namespace HoT.Core.Data.Models
{
    public class MoveItemsModel
    {
        public List<int> ItemIds { get; set; }

        public int ToLocationId { get; set; }
    }
}