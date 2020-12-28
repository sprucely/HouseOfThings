namespace HoT.Core.Data.Models
{
    public class MoveLocationModel
    {
        public int MoveLocationId { get; set; }
        
        public int? ToChildOfLocationId { get; set; }

        public int? ToSiblingOfLocationId { get; set; }

        public LocationFilterModel LocationFilter { get; set; }
    }
}