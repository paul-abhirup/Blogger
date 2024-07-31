import { z } from "zod";

export const signupInput = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export const signinInput = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const createBlogInput = z.object({
  title: z.string(),
  content: z.string(),
  // authorId: z.string() // u cant do that, if so then u you will have to provide with this input  
  //if not it giveees this input error
});

export const updateBlogInput = z.object({
  title: z.string(),
  content: z.string(),
  id: z.string()
});


//type inference in zod
export type SignupInput = z.infer<typeof signupInput>;
export type SigninInput = z.infer<typeof signinInput>;
export type CreateBlogInput = z.infer<typeof createBlogInput>;
export type UpdateBlogInput = z.infer<typeof updateBlogInput>;
