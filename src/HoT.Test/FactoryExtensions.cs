using System;
using System.Collections.Generic;
using System.Net.Http;
using HoT.Core.Data;
using HoT.Web;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HoT.Test
{
    public static class FactoryExtensions
    {
        public static HttpClient GetHoTClient(this WebApplicationFactory<Startup> factory, Action<AppDbContext> dbAction)
        {
            var client = factory.WithWebHostBuilder(builder =>
            {
                builder.UseSetting("Environment", "Testing"); // test env doesn't load user secrets or other `env.IsDevelopment()` stuff like webpack
                builder.ConfigureServices(services =>
                {
                    var sp = services.BuildServiceProvider();

                    using (var scope = sp.CreateScope())
                    {
                        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                        var dbHelper = scope.ServiceProvider.GetRequiredService<IDbHelper>();

                        db.Database.EnsureDeleted();
                        db.Database.Migrate();

                        // init db here
                        var dbinit = new DbInitializer(db, dbHelper);

                        dbinit.Initialize().GetAwaiter().GetResult();

                        dbAction(db);
                    }
                });
            })
            .CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false,
            });

            return client;
        }
    }
}