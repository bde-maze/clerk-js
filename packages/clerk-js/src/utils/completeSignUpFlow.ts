import type { SignUpResource } from '@clerk/types';

type CompleteSignUpFlowProps = {
  signUp: SignUpResource;
  verifyEmailPath?: string;
  verifyPhonePath?: string;
  continuePath?: string;
  navigate: (to: string) => Promise<unknown>;
  handleComplete?: () => Promise<void>;
  redirectUrl?: string;
  redirectUrlComplete?: string;
  oidcPrompt?: string;
};

export const completeSignUpFlow = ({
  signUp,
  verifyEmailPath,
  verifyPhonePath,
  continuePath,
  navigate,
  handleComplete,
  redirectUrl = '',
  redirectUrlComplete = '',
  oidcPrompt,
}: CompleteSignUpFlowProps): Promise<unknown> | undefined => {
  if (signUp.status === 'complete') {
    return handleComplete && handleComplete();
  } else if (signUp.status === 'missing_requirements') {
    if (signUp.missingFields.some(mf => mf === 'saml' || mf === 'enterprise_sso')) {
      return signUp.authenticateWithRedirect({
        strategy: 'enterprise_sso',
        redirectUrl,
        redirectUrlComplete,
        continueSignUp: true,
        oidcPrompt,
      });
    }

    if (signUp.unverifiedFields?.includes('email_address') && verifyEmailPath) {
      return navigate(verifyEmailPath);
    }
    if (signUp.unverifiedFields?.includes('phone_number') && verifyPhonePath) {
      return navigate(verifyPhonePath);
    }

    if (continuePath) {
      return navigate(continuePath);
    }
  }
  return;
};
