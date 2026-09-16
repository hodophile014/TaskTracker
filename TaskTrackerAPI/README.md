# TaskTracker API

All task routes require `Authorization: Bearer <token>` from registration or login.

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account and receive a JWT |
| POST | `/api/auth/login` | Sign in and receive a JWT |
| GET | `/api/tasks?status=Pending` | List the current user's active tasks (status is optional) |
| GET | `/api/tasks/{id}` | Get one active task owned by the current user |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/{id}` | Update title, description, due date, and/or status |
| PATCH | `/api/tasks/{id}/complete` | Mark a task completed |
| DELETE | `/api/tasks/{id}` | Soft-delete a task by setting `isActive` to `false` |

Apply the generated migration once SQL Server accepts encrypted client connections:

```powershell
dotnet ef database update --project .\TaskTrackerAPI\TaskTrackerAPI.csproj --startup-project .\TaskTrackerAPI\TaskTrackerAPI.csproj
```

The API only returns tasks whose `UserId` matches the authenticated JWT and whose `isActive` value is true. A deleted task cannot be fetched, updated, or listed.
