﻿using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace HoT.Core.Migrations
{
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Items",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: true),
                    Description = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Items", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Locations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ParentId = table.Column<int>(type: "INTEGER", nullable: true),
                    Name = table.Column<string>(type: "TEXT", nullable: true),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    Moveable = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Locations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Locations_Locations_ParentId",
                        column: x => x.ParentId,
                        principalTable: "Locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Tags",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tags", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Photo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ItemId = table.Column<int>(type: "INTEGER", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: true),
                    Thumbnail = table.Column<byte[]>(type: "BLOB", nullable: true),
                    Image = table.Column<byte[]>(type: "BLOB", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Photo", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Photo_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LocationsClosures",
                columns: table => new
                {
                    ParentId = table.Column<int>(type: "INTEGER", nullable: false),
                    ChildId = table.Column<int>(type: "INTEGER", nullable: false),
                    Depth = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LocationsClosures", x => new { x.ParentId, x.Depth, x.ChildId });
                    table.ForeignKey(
                        name: "FK_LocationsClosures_Locations_ChildId",
                        column: x => x.ChildId,
                        principalTable: "Locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LocationsClosures_Locations_ParentId",
                        column: x => x.ParentId,
                        principalTable: "Locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ItemsTags",
                columns: table => new
                {
                    ItemId = table.Column<int>(type: "INTEGER", nullable: false),
                    TagId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ItemsTags", x => new { x.ItemId, x.TagId });
                    table.ForeignKey(
                        name: "FK_ItemsTags_Items_ItemId",
                        column: x => x.ItemId,
                        principalTable: "Items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ItemsTags_Tags_TagId",
                        column: x => x.TagId,
                        principalTable: "Tags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LocationsTags",
                columns: table => new
                {
                    LocationId = table.Column<int>(type: "INTEGER", nullable: false),
                    TagId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LocationsTags", x => new { x.LocationId, x.TagId });
                    table.ForeignKey(
                        name: "FK_LocationsTags_Locations_LocationId",
                        column: x => x.LocationId,
                        principalTable: "Locations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LocationsTags_Tags_TagId",
                        column: x => x.TagId,
                        principalTable: "Tags",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ItemsTags_TagId",
                table: "ItemsTags",
                column: "TagId");

            migrationBuilder.CreateIndex(
                name: "IX_Locations_ParentId",
                table: "Locations",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_LocationsClosures_ChildId_ParentId_Depth",
                table: "LocationsClosures",
                columns: new[] { "ChildId", "ParentId", "Depth" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LocationsTags_TagId",
                table: "LocationsTags",
                column: "TagId");

            migrationBuilder.CreateIndex(
                name: "IX_Photo_ItemId",
                table: "Photo",
                column: "ItemId");

            migrationBuilder.Sql(@"
                CREATE TRIGGER Locations_closures_after_update
                AFTER UPDATE ON Locations
                WHEN ifnull(old.ParentId, 0) <> ifnull(new.ParentId, 0)
                BEGIN
                    DELETE FROM LocationsClosures
                    WHERE ROWID in (
                    SELECT link.ROWID
                    FROM LocationsClosures p, LocationsClosures link, LocationsClosures c
                    WHERE
                        old.ParentId IS NOT NULL --nothing to delete if no parent exists
                        AND p.ParentId = link.ParentId AND c.ChildId = link.ChildId
                        AND p.ChildId=old.ParentId AND c.ParentId=old.Id);

                    INSERT INTO LocationsClosures(ParentId, ChildId, Depth)
                    SELECT p.ParentId, c.ChildId, p.Depth + c.Depth + 1
                    FROM LocationsClosures p, LocationsClosures c
                    WHERE 
                        new.ParentId IS NOT NULL --nothing to add if no parent exists
                        AND p.ChildId=new.ParentId AND c.ParentId=new.Id;
                END");

            migrationBuilder.Sql(@"
                CREATE TRIGGER Locations_closures_after_insert
                AFTER INSERT ON Locations
                BEGIN
                    INSERT INTO LocationsClosures(ParentId, ChildId, Depth)
                    VALUES (new.Id, new.Id, 0);

                    INSERT INTO LocationsClosures(ParentId, ChildId, Depth)
                    SELECT p.ParentId, c.ChildId, p.Depth + c.Depth + 1
                    FROM LocationsClosures p, LocationsClosures c
                    WHERE 
                        new.ParentId IS NOT NULL --nothing to add if no parent exists
                        AND p.ChildId=new.ParentId AND c.ParentId=new.Id;
                END");

            migrationBuilder.Sql(@"
                CREATE TRIGGER Locations_closures_after_delete
                AFTER DELETE ON Locations
                WHEN old.ParentId IS NOT NULL
                BEGIN
                    DELETE FROM LocationsClosures
                    WHERE ROWID in (
                    SELECT link.ROWID
                    FROM LocationsClosures p, LocationsClosures link, LocationsClosures c
                    WHERE
                        p.ParentId = link.ParentId AND c.ChildId = link.ChildId
                        AND p.ChildId=old.ParentId AND c.ParentId=old.Id);
                END");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ItemsTags");

            migrationBuilder.DropTable(
                name: "LocationsClosures");

            migrationBuilder.DropTable(
                name: "LocationsTags");

            migrationBuilder.DropTable(
                name: "Photo");

            migrationBuilder.DropTable(
                name: "Locations");

            migrationBuilder.DropTable(
                name: "Tags");

            migrationBuilder.DropTable(
                name: "Items");
        }
    }
}