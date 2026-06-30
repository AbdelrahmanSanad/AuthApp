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
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

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
        {signup.isError && <Alert message={getApiErrorMessage(signup.error)} />}
        <TextField
          label="Name"
          type="text"
          autoComplete="name"
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
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" isLoading={isBusy}>
          Create account
        </Button>
      </form>
    </AuthCard>
  );
}
