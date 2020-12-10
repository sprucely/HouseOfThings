using Microsoft.EntityFrameworkCore.Migrations;

namespace HoT.Core.Migrations
{
    public partial class MaterializedPath : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Path",
                table: "LocationsClosures",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_LocationsClosures_Path",
                table: "LocationsClosures",
                column: "Path");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_LocationsClosures_Path",
                table: "LocationsClosures");

            migrationBuilder.DropColumn(
                name: "Path",
                table: "LocationsClosures");
        }
    }
}
