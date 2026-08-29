using Microsoft.EntityFrameworkCore;
using TaskTrackerAPI.Data;
using TaskTrackerAPI.DTOS;
using TaskTrackerAPI.Models;

namespace TaskTrackerAPI.Services
{
    public class UserService: IUservice
    {
        private readonly AppDbContext _context;
        public UserService (AppDbContext context)
        {
            _context = context;
        }
        public async Task<User> CreatUserAsync(CreateUserDto dto)
        {

            var existingUser = await _context.User.FirstOrDefaultAsync(u => u.email == dto.email);
            if(existingUser != null){ 
                throw new Exception("User with this email already exists.");
            }
             
                var user = new User
                {
                    username = dto.fname + " " + dto.mname + " " + dto.lname,
                    email = dto.email,
                    password = dto.password,
                    isActive = true

                };
            _context.User.Add(user);
            await _context.SaveChangesAsync();
            return user;

        }
        
    }
}
