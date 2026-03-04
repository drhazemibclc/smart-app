import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react'; // From your package list
import { useRouter } from 'next/navigation';
import { useState } from 'react'; // Added for password toggle
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

import { authClient } from '@/lib/auth-client';

import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid clinic email'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

type SignInValues = z.infer<typeof signInSchema>;

export default function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  // session pending for initial load
  const { isPending: sessionLoading } = authClient.useSession();

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
          router.refresh(); // Ensure the layout sees the new session
          toast.success('Welcome back!');
        },
        onError: (ctx: { error: { message: string } }) => {
          toast.error(ctx.error.message || 'Login failed');
        }
      }
    );
  };

  return (
    <div className='fade-in mx-auto mt-10 w-full max-w-md animate-in p-6 duration-500'>
      <div className='mb-8 flex flex-col space-y-2 text-center'>
        <h1 className='font-bold text-3xl tracking-tight'>Sign In</h1>
        <p className='text-muted-foreground text-sm'>Enter your credentials to access your clinic dashboard</p>
      </div>

      <form
        className='space-y-4'
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className='space-y-2'>
          <Label htmlFor='email'>Email</Label>
          <Input
            disabled={isSubmitting || sessionLoading}
            id='email'
            placeholder='dr.ali@smartclinic.com'
            type='email'
            {...register('email')}
          />
          {errors.email && <p className='font-medium text-destructive text-xs'>{errors.email.message}</p>}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='password'>Password</Label>
          <div className='relative'>
            <Input
              disabled={isSubmitting || sessionLoading}
              id='password'
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
            />
            <Button
              className='absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent'
              onClick={() => setShowPassword(!showPassword)}
              size='sm'
              type='button'
              variant='ghost'
            >
              {showPassword ? (
                <EyeOff className='h-4 w-4 text-muted-foreground' />
              ) : (
                <Eye className='h-4 w-4 text-muted-foreground' />
              )}
            </Button>
          </div>
          {errors.password && <p className='font-medium text-destructive text-xs'>{errors.password.message}</p>}
        </div>

        <Button
          className='w-full'
          disabled={isSubmitting || sessionLoading}
          type='submit'
        >
          {isSubmitting ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Authenticating...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className='mt-6 text-center'>
        <p className='text-muted-foreground text-sm'>
          Don&apos;t have an account?{' '}
          <Button
            className='h-auto p-0 font-semibold text-primary'
            onClick={onSwitchToSignUp}
            variant='link'
          >
            Create Clinic Account
          </Button>
        </p>
      </div>
    </div>
  );
}
