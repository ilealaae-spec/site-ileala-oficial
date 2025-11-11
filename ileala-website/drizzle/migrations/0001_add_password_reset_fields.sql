-- Add password reset fields to users table
ALTER TABLE `users` 
ADD COLUMN `passwordResetToken` VARCHAR(255),
ADD COLUMN `passwordResetExpires` TIMESTAMP;
