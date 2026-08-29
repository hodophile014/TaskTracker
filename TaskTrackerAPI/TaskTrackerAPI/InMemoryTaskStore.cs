


using TaskTrackerAPI.Models;

namespace TaskTrackerAPI
{
    public class InMemoryTaskStore
    {
        private static readonly List<TaskItem> Tasks = new()
        {
            new TaskItem
            {
                Id = 1,
                Title = "Title 1",
                Description = "Description 1",
                Status =  "Pending"
                

                
                
            },
            new TaskItem
            {

                 Id = 2,
                Title = "Title 2",
                Description = "Description 2",
                Status =  "Pending"


            }

        };
    }
}
