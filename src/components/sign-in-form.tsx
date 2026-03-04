import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

import { authClient } from '@/lib/auth-client';

import Loader from './loader';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

// 1. Define the schema using your existing Zod package
const signInSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

type SignInValues = z.infer<typeof signInSchema>;

export default function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const router = useRouter();
  const { isPending } = authClient.useSession();

  // 2. Switch to react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (value: SignInValues) => {
    await authClient.signIn.email(
      {
        email: value.email,
        password: value.password
      },
      {
        onSuccess: () => {
          router.push('/dashboard');
          toast.success('Sign in successful');
        },
        onError: (error: { error: { message: string; statusText: string } }) => {
          toast.error(error.error.message || error.error.statusText);
        }
      }
    );
  };

  if (isPending) return <Loader />;

  return (
    <div className='mx-auto mt-10 w-full max-w-md p-6'>
      <h1 className='mb-6 text-center font-bold text-3xl'>Welcome Back</h1>

      <form
        className='space-y-4'
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className='space-y-2'>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            placeholder='name@example.com'
            type='email'
            {...register('email')}
          />
          {errors.email && <p className='text-red-500 text-sm'>{errors.email.message}</p>}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='password'>Password</Label>
          <Input
            id='password'
            type='password'
            {...register('password')}
          />
          {errors.password && <p className='text-red-500 text-sm'>{errors.password.message}</p>}
        </div>

        <Button
          className='w-full'
          disabled={isSubmitting}
          type='submit'
        >
          {isSubmitting ? 'Submitting...' : 'Sign In'}
        </Button>
      </form>

      <div className='mt-4 text-center'>
        <Button
          className='text-indigo-600 hover:text-indigo-800'
          onClick={onSwitchToSignUp}
          variant='link'
        >
          Need an account? Sign Up
        </Button>
      </div>
    </div>
  );
}
