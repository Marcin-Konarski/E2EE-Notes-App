import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'

import useAuth from '@/hooks/useAuth';
import AlertError from '@/components/ui/AlertError';
import AlertSuccess from '@/components/ui/AlertSuccess';
import EmailVerificationForm from '@/components/EmailVerificationForm';
import useKeyPair from '@/cryptography/asymetric/useAsymmetric';
import { useUserContext } from '@/hooks/useUserContext';
import useWrapingKey from '@/cryptography/useWrapingKey';


const EmailVerification = () => {
  const navigate = useNavigate();
  const createdAccount = useLocation().state?.createdAccount;
  const email = useLocation().state?.email;
  const username = useLocation().state?.username;
  let password = useLocation().state?.password;
  const { createRSAKeyPair } = useKeyPair();
  const { deriveKeyFromPassword } = useWrapingKey();
  const { userWrappingKey, userKeyPair} = useUserContext();
  const { loginUser, verifyEmail, uploadKeys, error, setError } = useAuth();
  const [status, setStatus] = useState('pending');
  const [validating, setValidating] = useState(false)

  //! Very bad code. Don't look at it (although it should be secure. I think)
  const handleValidate = async (username, otp) => {
    setValidating(true);
    setError(null);

    try {
      const backendStatus = await verifyEmail(email, otp);

        if (createdAccount) {
          const salt = window.crypto.getRandomValues(new Uint8Array(16));
          const deriveKeyStatus = await deriveKeyFromPassword(password, salt);
          console.log(deriveKeyStatus);
          if (deriveKeyStatus?.success) {
            userWrappingKey.current = deriveKeyStatus.key;
            console.log('userWrappingKey.current', userWrappingKey.current);

            const createRSAKeyStatus = await createRSAKeyPair(userWrappingKey.current);
            if (createRSAKeyStatus?.success) {
              userKeyPair.current = createRSAKeyStatus.keyPair;
              console.log('userKeyPair', userKeyPair.current);
              console.log('RSA Key Pair', createRSAKeyStatus);
              await uploadKeys(JSON.stringify(createRSAKeyStatus.publicKey), JSON.stringify(createRSAKeyStatus.privateKey), JSON.stringify(salt)); // TODO: Here also upload private key and salt for this password
            }
          }
        }

        await loginUser({username: username, password: password}, false)
        password = ''

        setStatus('success');
        navigate('/');

    } catch (err) {
      password = ''
      setError(err.message || 'Invalid verification code. Please try again.');
      setStatus('error');
    } finally {
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
                Account was created successfully. Please check your email to verify your account. 
                Did not receive your email? Check spam or click below to resend.
              </p>
            </div>
          </AlertSuccess>
        )}

        <EmailVerificationForm username={username} onValidate={handleValidate} isValidating={validating}/>

      </div>
    </div>
  );

}

export default EmailVerification