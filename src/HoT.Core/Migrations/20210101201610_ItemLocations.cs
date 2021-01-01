using Microsoft.EntityFrameworkCore.Migrations;

namespace HoT.Core.Migrations
{
    public partial class ItemLocations : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LocationId",
                table: "Items",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Items_LocationId",
                table: "Items",
                column: "LocationId");

            migrationBuilder.CreateIndex(
                name: "IX_Items_Name",
                table: "Items",
                column: "Name");

            migrationBuilder.AddForeignKey(
                name: "FK_Items_Locations_LocationId",
                table: "Items",
                column: "LocationId",
                principalTable: "Locations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Items_Locations_LocationId",
                table: "Items");

            migrationBuilder.DropIndex(
                name: "IX_Items_LocationId",
                table: "Items");

            migrationBuilder.DropIndex(
                name: "IX_Items_Name",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "LocationId",
                table: "Items");
        }
    }
}
