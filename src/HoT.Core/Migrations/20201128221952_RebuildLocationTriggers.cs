using Microsoft.EntityFrameworkCore.Migrations;

namespace HoT.Core.Migrations
{
    public partial class RebuildLocationTriggers : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // SQLite schema change resulted in table being dropped and recreated, so
            // triggers need to explicitly be recreated...
            MigrationHelper.CreateLocationTriggers(migrationBuilder);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
