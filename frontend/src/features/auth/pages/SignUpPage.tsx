import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { getApiErrorMessage } from '@/lib/api';
import { paths } from '@/routes/paths';
import { AuthCard } from '../components/AuthCard';
import { useSignup } from '../hooks';
import { signupSchema, type SignupInput } from '../schemas';

export function SignUpPage() {
  const signup = useSignup();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    mode: 'onTouched', // validate on blur, then keep fields live as the user fixes them
  });

  const onSubmit = handleSubmit((values) => signup.mutate(values));
  const isBusy = isSubmitting || signup.isPending;

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start using EasyGenerator in seconds"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkTo={paths.signin}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {signup.isError && (
          <Alert message={getApiErrorMessage(signup.error, 'Could not create your account')} />
        )}
        <TextField
          label="Name"
          type="text"
          autoComplete="name"
          autoFocus
          error={errors.name?.message}
          {...register('name')}
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters with a letter, a number and a special character."
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" variant="primary" fullWidth loading={isBusy}>
          Create account
        </Button>
      </form>
    </AuthCard>
  );
}
