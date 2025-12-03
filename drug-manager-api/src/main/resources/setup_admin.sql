-- Script to set up initial admin user
-- Run this SQL query after creating your database

-- Update an existing user to be admin (replace 'admin_username' with actual username)
UPDATE users SET role = 'admin' WHERE username = 'admin_username';

-- Or insert a new admin user (if your system allows direct insertion)
-- INSERT INTO users (full_name, username, password, role, auth_provider) 
-- VALUES ('Admin User', 'admin', 'hashed_password', 'admin', 'local');

-- Note: Make sure the password is properly hashed by your authentication service
-- The default is 'user' role for all new users
