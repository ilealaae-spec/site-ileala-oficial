    register: publicProcedure
      .input(z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        poBox: z.string().optional(),
        country: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          console.log('[Register] Starting registration for:', input.email);
          
          // Check if user already exists
          console.log('[Register] Checking if user exists...');
          const existingUser = await db.getUserByEmail(input.email);
          console.log('[Register] Existing user check result:', existingUser ? 'User exists' : 'User does not exist');
          
          if (existingUser) {
            console.log('[Register] User already exists, throwing error');
            throw new Error('User with this email already exists');
          }
          
          // Create user
          console.log('[Register] Creating new user...');
          const userId = await db.createUser({
            email: input.email,
            name: input.name,
            password: input.password, // Will be hashed in db.createUser
            phone: input.phone,
            address: input.address,
            city: input.city,
            state: input.state,
            poBox: input.poBox,
            country: input.country,
          });
          console.log('[Register] User created with ID:', userId);
          
          // Get created user
          console.log('[Register] Fetching created user...');
          const user = await db.getUserById(userId);
          console.log('[Register] User fetched:', user ? 'Success' : 'Failed');
          
          if (!user) {
            console.log('[Register] Failed to fetch created user');
            throw new Error('Failed to create user');
          }
          
          // Generate email verification token
          console.log('[Register] Generating email verification token...');
          const token = await db.generateEmailVerificationToken(user.id);
          console.log('[Register] Token generated');
          
          // Send verification email
          console.log('[Register] Sending verification email...');
          const { sendVerificationEmail } = await import('./email');
          await sendVerificationEmail(user.email, token, user.name || 'Customer');
          console.log('[Register] Verification email sent');
          
          // Set session cookie
          console.log('[Register] Setting session cookie...');
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, JSON.stringify({ id: user.id, email: user.email, name: user.name, role: user.role }), cookieOptions);
          console.log('[Register] Registration completed successfully!');
          
          return {
            success: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            },
          };
        } catch (error) {
          console.error('[Register] Error during registration:');
          console.error('[Register] Error message:', error instanceof Error ? error.message : 'Unknown error');
          console.error('[Register] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
          console.error('[Register] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
          throw error;
        }
      }),
