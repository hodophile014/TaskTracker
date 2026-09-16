using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskTrackerAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddRolePriorityAndAssignment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "role",
                table: "User",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Member");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "TaskItem",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AddColumn<int>(
                name: "AssignedToUserId",
                table: "TaskItem",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "priority",
                table: "TaskItem",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Medium");

            migrationBuilder.CreateIndex(
                name: "IX_TaskItem_AssignedToUserId_isActive",
                table: "TaskItem",
                columns: new[] { "AssignedToUserId", "isActive" });

            migrationBuilder.CreateIndex(
                name: "IX_TaskItem_Status",
                table: "TaskItem",
                column: "Status");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskItem_User_AssignedToUserId",
                table: "TaskItem",
                column: "AssignedToUserId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TaskItem_User_AssignedToUserId",
                table: "TaskItem");

            migrationBuilder.DropIndex(
                name: "IX_TaskItem_AssignedToUserId_isActive",
                table: "TaskItem");

            migrationBuilder.DropIndex(
                name: "IX_TaskItem_Status",
                table: "TaskItem");

            migrationBuilder.DropColumn(
                name: "role",
                table: "User");

            migrationBuilder.DropColumn(
                name: "AssignedToUserId",
                table: "TaskItem");

            migrationBuilder.DropColumn(
                name: "priority",
                table: "TaskItem");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "TaskItem",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);
        }
    }
}
