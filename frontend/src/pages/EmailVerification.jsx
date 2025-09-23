import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'

import { useUserContext } from '@/hooks/useUserContext';
import useAuth from '@/hooks/useAuth';
import AlertSuccess from '@/components/ui/AlertSuccess';
import AlertError from '@/components/ui/AlertError';
import { Button } from '@/components/ui/Button';



const EmailVerification = () => {
  const navigate = useNavigate();
  const { activationKey } = useParams();
  const [status, setStatus] = useState('loading');
  const { verifyEmail, isLoading, error } = useAuth();
  const { user } = useUserContext();


  useEffect(() => {
    const verify = async () => {
      try {
        const result = await verifyEmail(activationKey);

        if (result.success) {
          setStatus('success');
          navigate('/');
        } else {
          setStatus('error');
        }
      } catch (err) {
        setStatus('error');
      }
    }

    verify();
  }, [activationKey])



  if (isLoading || status === 'loading') {
    return <AlertSuccess title={'Hold On'} className={'!block !p-4 mx-auto max-w-md'} green={false}>Verifying your email...</AlertSuccess>;
  }

  if (status === 'success') {
    return <AlertSuccess title={`Welcome ${user?.username}!`} className={'!block !p-4 mx-auto max-w-md'} green={true}> Redirecting....</AlertSuccess>;
  }

  return (<div className='flex flex-col max-w-full space-y-5'>
    <AlertError title={'ERROR'} className={'!block !p-4 mx-auto max-w-md'}>{error}</AlertError>
    <Button variant='secondary'>Resend Email</Button>
  </div>);

}

export default EmailVerification