import { useParams } from 'react-router-dom'
import { useEffect } from 'react'

import { useUserContext } from '@/hooks/useUserContext'
import useSendEmail from '@/hooks/useSendEmail'
import useGetToken from '@/hooks/useGetToken'

const EmailVerification = () => {
  const { id } = useParams();
  const { user } = useUserContext();
  const { verifyAccount, resendVerificationEmail, isEmailConfirmed, emailError } = useSendEmail();
  const { getToken, accessToken, refreshToken, tokenError } = useGetToken();

  useEffect(() => {
    if (!id) return

    verifyAccount({'activation_key': id});

    const data = {
      'username': user.username,
      'password': user.password
    }
    if (isEmailConfirmed) {
      getToken(data)
    }

    console.log(accessToken);


  }, [id, isEmailConfirmed, accessToken])

  useEffect(() => {
    console.log(emailError);
    console.log(tokenError);
  }, [emailError, tokenError])




  return <></>
}

export default EmailVerification