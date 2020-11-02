using System;
using Xunit;

using HoT.Web;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Threading.Tasks;
using System.Net.Http;
using Newtonsoft.Json;
using System.Text;
using HoT.Core.Data.Domain;
using HoT.Core.Data.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Collections.Generic;

namespace HoT.Test
{
    public class HouseControllertests : IClassFixture<WebApplicationFactory<Startup>>
    {
        private readonly WebApplicationFactory<Startup> _factory;

        public HouseControllertests(WebApplicationFactory<Startup> factory)
        {
            _factory = factory;
        }


        [Fact]
        public void GetAllLocations()
        {
            List<Location> locations = null;

            var client = _factory.GetHoTClient(db => {
                var location1 = new Location{ Name = "Location1" };

                db.Locations.Add(location1);
                db.Locations.Add(new Location{ Name = "Location2", Parent = location1 });
                db.Locations.Add(new Location{ Name = "Location3" });
                db.SaveChanges();
                
                locations = db.Locations
                    .Include(l => l.Tags)
                    .Where(l => l.Id == location1.Id)
                    .ToList();
            });

            // var filter = new TagFilterModel
            // {
            //     Tags = new List<TagModel> {  }
            // };

            // using (var request = new HttpRequestMessage(HttpMethod.Post, "/api/house/locations"))
            // {
            //     var json = JsonConvert.SerializeObject();
            //     using (var stringContent = new StringContent(json, Encoding.UTF8, "application/json"))
            //     {
            //         request.Content = stringContent;

            //         using (var response = await client
            //             .SendAsync(request, HttpCompletionOption.ResponseHeadersRead)
            //             .ConfigureAwait(false))
            //         {
            //             response.EnsureSuccessStatusCode();
            //         }
            //     }
            // }
        }
    }
}
