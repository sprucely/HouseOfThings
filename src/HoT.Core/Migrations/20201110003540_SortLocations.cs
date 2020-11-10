using Microsoft.EntityFrameworkCore.Migrations;

namespace HoT.Core.Migrations
{
    public partial class SortLocations : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Locations_ParentId",
                table: "Locations");

            migrationBuilder.AddColumn<string>(
                name: "Sort",
                table: "Locations",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Locations_ParentId_Sort",
                table: "Locations",
                columns: new[] { "ParentId", "Sort" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Locations_ParentId_Sort",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "Sort",
                table: "Locations");

            migrationBuilder.CreateIndex(
                name: "IX_Locations_ParentId",
                table: "Locations",
                column: "ParentId");
        }
    }
}
