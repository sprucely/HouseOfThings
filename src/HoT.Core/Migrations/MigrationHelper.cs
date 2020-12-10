using Microsoft.EntityFrameworkCore.Migrations;

namespace HoT.Core.Migrations
{
    public static class MigrationHelper
    {
        public static void CreateLocationTriggers(MigrationBuilder migrationBuilder)
        {
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
                    INSERT INTO LocationsClosures(ParentId, ChildId, Depth, Path)
                    VALUES (new.Id, new.Id, 0, new.Id);

                    INSERT INTO LocationsClosures(ParentId, ChildId, Depth, Path)
                    SELECT p.ParentId, c.ChildId, p.Depth + c.Depth + 1, p.Path || '.' || c.ChildId
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
    }
}