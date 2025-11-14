import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'

import useAuth from '@/hooks/useAuth';
import AlertError from '@/components/ui/AlertError';
import AlertSuccess from '@/components/ui/AlertSuccess';
import EmailVerificationForm from '@/components/EmailVerificationForm';


const EmailVerification = () => {
  const navigate = useNavigate();
  const createdAccount = useLocation().state?.createdAccount;
  const email = useLocation().state?.email;
  const username = useLocation().state?.username;
  let password = useLocation().state?.password;
  const { verifyEmail, error, setError } = useAuth();
  const [status, setStatus] = useState('pending');
  const [validating, setValidating] = useState(false)

  //! Very bad code. Don't look at it (although it should be secure. I think)
  const handleValidate = async (emailValue, otp) => {
    setValidating(true);
    setError(null);

    try {
      await verifyEmail(emailValue, otp, password, createdAccount === 'successful'); // Pass true/false here so that if account was not created but only email is being verified from `Profile` componenet then keys are not recreated as this triggers bugs and is unnecessary at all 

      setStatus('success');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid verification code. Please try again.');
      setStatus('error');
    } finally {
      password = '';
      setValidating(false);
    }
  }


  if (status === 'success') {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <AlertSuccess title={`Welcome ${username}!`} className="block p-4 w-full max-w-md" green={true}>
          Redirecting....
        </AlertSuccess>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[400px] px-4">
      <div className="flex flex-col w-full max-w-md space-y-6">

        {error && (
          <AlertError title="ERROR" className="block p-4 w-full">
            {error}
          </AlertError>
        )}

        {createdAccount === 'successful' && !error && (
          <AlertSuccess title="Success" className="block p-4 w-full" green={true}>
            <div className="space-y-3">
              <p>
                Account was created successfully. Please<br />
                check your email to verify your account.
              </p>
            </div>
          </AlertSuccess>
        )}

        <EmailVerificationForm email={email} onValidate={handleValidate} isValidating={validating}/>

      </div>
    </div>
  );

}

export default EmailVerification
