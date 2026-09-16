using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskTrackerAPI.Migrations
{
    /// <inheritdoc />
    public partial class CompleteTaskOwnershipAndSoftDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "username",
                table: "User",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "email",
                table: "User",
                type: "nvarchar(320)",
                maxLength: 320,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "User",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "TaskItem",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<bool>(
                name: "isActive",
                table: "TaskItem",
                type: "bit",
                nullable: false,
                // Existing tasks predate soft deletion, so preserve them as active.
                defaultValue: true);

            migrationBuilder.CreateIndex(
                name: "IX_User_email",
                table: "User",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TaskItem_UserId_isActive",
                table: "TaskItem",
                columns: new[] { "UserId", "isActive" });

            // Earlier versions allowed tasks without an owning user. Preserve those
            // rows under a disabled system account before enforcing the relationship.
            migrationBuilder.Sql("""
                IF EXISTS (SELECT 1 FROM [TaskItem] t WHERE NOT EXISTS (SELECT 1 FROM [User] u WHERE u.[Id] = t.[UserId]))
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM [User] WHERE [email] = 'legacy-unassigned@local.invalid')
                    BEGIN
                        INSERT INTO [User] ([username], [email], [password], [isActive], [CreatedAt])
                        VALUES ('Legacy unassigned tasks', 'legacy-unassigned@local.invalid', 'MIGRATED_ORPHAN_TASKS_NO_LOGIN', 0, SYSUTCDATETIME());
                    END;

                    UPDATE t
                    SET [UserId] = (SELECT TOP (1) [Id] FROM [User] WHERE [email] = 'legacy-unassigned@local.invalid')
                    FROM [TaskItem] t
                    WHERE NOT EXISTS (SELECT 1 FROM [User] u WHERE u.[Id] = t.[UserId]);
                END;
                """);

            migrationBuilder.AddForeignKey(
                name: "FK_TaskItem_User_UserId",
                table: "TaskItem",
                column: "UserId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TaskItem_User_UserId",
                table: "TaskItem");

            migrationBuilder.DropIndex(
                name: "IX_User_email",
                table: "User");

            migrationBuilder.DropIndex(
                name: "IX_TaskItem_UserId_isActive",
                table: "TaskItem");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "User");

            migrationBuilder.DropColumn(
                name: "isActive",
                table: "TaskItem");

            migrationBuilder.AlterColumn<string>(
                name: "username",
                table: "User",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "email",
                table: "User",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(320)",
                oldMaxLength: 320);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "TaskItem",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);
        }
    }
}
