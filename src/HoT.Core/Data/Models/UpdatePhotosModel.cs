using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace HoT.Core.Data.Models
{
    public class UpdatePhotosModel
    {
        public List<string> Names { get; set; }
        public List<int> Ids { get; set; }
        public List<IFormFile> Images { get; set; }
        public List<IFormFile> Thumbnails { get; set; }
    }
}