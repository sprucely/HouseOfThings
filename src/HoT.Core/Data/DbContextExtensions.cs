using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace HoT.Core.Data
{
    public static class DbContextExtensions
    {
        public static void OverrideNoCaseCollation(this AppDbContext db)
        {
            if (db.Database.GetDbConnection() is SqliteConnection connection)
            {
                connection.Open();
                connection.CreateCollation("NOCASE", (x, y) => 
                {
                    return string.Compare(x, y, ignoreCase: true);
                });
                connection.Close();
            }

        }
    }
}