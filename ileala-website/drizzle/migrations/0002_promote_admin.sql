-- Promote ceo@ileala.ae to admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'ceo@ileala.ae';
