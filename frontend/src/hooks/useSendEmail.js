import EmailService from '@/services/EmailService'
import React, { useState } from 'react'


const useSendEmail = () => {
    const [error, setError] = useState(null);
    const [isEmailConfirmed, setIsEmailConfirmed] = useState(false);

    const verifyAccount = (data) => {
        EmailService.confirmEmail(data)
            .then(res => {
                if (res.status === 200) setIsEmailConfirmed(true)
            })
            .catch(err => {
                setError(err.response?.data || 'Email Verification Failed');
            })
    }

    const resendVerificationEmail = (data) => {

    }

    return { verifyAccount, resendVerificationEmail, isEmailConfirmed, error }
}

export default useSendEmail