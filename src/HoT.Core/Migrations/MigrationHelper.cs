using Microsoft.EntityFrameworkCore.Migrations;

namespace HoT.Core.Migrations
{
    public static class MigrationHelper
    {
        public static void CreateLocationTriggers(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                CREATE VIEW vLocationPaths AS
                WITH RECURSIVE nodes(AncestorId, DescendantId, Path) AS (
                    SELECT id, id, sort
                    FROM Locations
                UNION ALL
                    SELECT n.AncestorId, l.id, n.Path || '.' || l.Sort
                    FROM Locations l JOIN nodes n ON n.DescendantId = l.ParentId
                )
                SELECT AncestorId, DescendantId, Path FROM nodes
            ");

            migrationBuilder.Sql(@"
				CREATE TRIGGER Locations_closures_after_update
                AFTER UPDATE ON Locations
                WHEN ifnull(old.ParentId, 0) <> ifnull(new.ParentId, 0) OR old.Sort <> new.Sort
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
                    SELECT supertree.ParentId, subtree.ChildId, supertree.Depth + subtree.Depth + 1
                    FROM LocationsClosures supertree, LocationsClosures subtree
                    WHERE 
                        new.ParentId IS NOT NULL --nothing to add if no parent exists
                        AND supertree.ChildId=new.ParentId AND subtree.ParentId=new.Id;

                    UPDATE LocationsClosures 
                    SET Path =
                        (SELECT Path
                        FROM vLocationPaths
                        WHERE (LocationsClosures.ParentId, LocationsClosures.ChildId) = (vLocationPaths.AncestorId, vLocationPaths.DescendantId))
                    WHERE (ParentId, ChildId) IN (SELECT AncestorId, DescendantId FROM vLocationPaths);

                END");

            migrationBuilder.Sql(@"
                CREATE TRIGGER Locations_closures_after_insert
                AFTER INSERT ON Locations
                BEGIN
                    INSERT INTO LocationsClosures(ParentId, ChildId, Depth, Path)
                    VALUES (new.Id, new.Id, 0, new.Sort);

                    INSERT INTO LocationsClosures(ParentId, ChildId, Depth, Path)
                    SELECT supertree.ParentId, subtree.ChildId, supertree.Depth + subtree.Depth + 1, supertree.Path || '.' || new.Sort
                    FROM LocationsClosures supertree, LocationsClosures subtree
                    WHERE 
                        new.ParentId IS NOT NULL --nothing to add if no parent exists
                        AND supertree.ChildId=new.ParentId AND subtree.ParentId=new.Id;
                END");

            migrationBuilder.Sql(@"
                CREATE TRIGGER Locations_closures_after_delete
                AFTER DELETE ON Locations
                WHEN old.ParentId IS NOT NULL
                BEGIN
                    DELETE FROM LocationsClosures
                    WHERE ROWID in (
                    SELECT link.ROWID
                    FROM LocationsClosures supertree, LocationsClosures link, LocationsClosures subtree
                    WHERE
                        supertree.ParentId = link.ParentId AND subtree.ChildId = link.ChildId
                        AND supertree.ChildId=old.ParentId AND subtree.ParentId=old.Id);
                END");

        }
    }
}