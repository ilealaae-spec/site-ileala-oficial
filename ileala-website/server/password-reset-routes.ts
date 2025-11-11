// Password reset routes to be added to auth router in routers.ts

export const passwordResetRoutes = `
    forgotPassword: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        const user = await db.getUserByEmail(input.email);
        if (!user) {
          // Don't reveal if email exists for security
          return { success: true, message: 'If an account exists with this email, you will receive a password reset link.' };
        }
        
        // Generate password reset token
        const token = await db.generatePasswordResetToken(user.id);
        
        // Send password reset email
        const { sendPasswordResetEmail } = await import('./email');
        await sendPasswordResetEmail(user.email, token, user.name || 'Customer');
        
        return { success: true, message: 'If an account exists with this email, you will receive a password reset link.' };
      }),
    resetPassword: publicProcedure
      .input(z.object({
        token: z.string(),
        newPassword: z.string().min(6),
      }))
      .mutation(async ({ input }) => {
        const user = await db.verifyPasswordResetToken(input.token);
        if (!user) {
          throw new Error('Invalid or expired reset token');
        }
        
        // Update password
        await db.updateUserPassword(user.id, input.newPassword);
        
        // Invalidate the token
        await db.invalidatePasswordResetToken(input.token);
        
        return { success: true, message: 'Password updated successfully' };
      }),
`;
