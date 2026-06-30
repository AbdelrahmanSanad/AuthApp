import { useMutation } from '@tanstack/react-query';
import { authApi } from './api';
import { useAuth } from './use-auth';
import type { SigninInput, SignupInput } from './schemas';

/** Signs the user up, then stores the returned session. */
export function useSignup() {
  const { login } = useAuth();
  return useMutation({
    mutationFn: (input: SignupInput) => authApi.signup(input),
    onSuccess: login,
  });
}

/** Signs the user in, then stores the returned session. */
export function useSignin() {
  const { login } = useAuth();
  return useMutation({
    mutationFn: (input: SigninInput) => authApi.signin(input),
    onSuccess: login,
  });
}
