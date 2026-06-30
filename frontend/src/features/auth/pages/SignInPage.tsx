import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { getApiErrorMessage } from '@/lib/api';
import { paths } from '@/routes/paths';
import { AuthCard } from '../components/AuthCard';
import { useSignin } from '../hooks';
import { signinSchema, type SigninInput } from '../schemas';

export function SignInPage() {
  const signin = useSignin();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninInput>({ resolver: zodResolver(signinSchema) });

  const onSubmit = handleSubmit((values) => signin.mutate(values));
  const isBusy = isSubmitting || signin.isPending;

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your account"
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkTo={paths.signup}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {signin.isError && <Alert message={getApiErrorMessage(signin.error)} />}
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
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" variant="primary" fullWidth loading={isBusy}>
          Sign in
        </Button>
      </form>
    </AuthCard>
  );
}
