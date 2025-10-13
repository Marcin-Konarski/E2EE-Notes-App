import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'

import useAuth from '@/hooks/useAuth'
import { LoginFormSchema } from '@/lib/ValidationSchema'
import LoginRegisterForm from '@/components/LoginRegisterForm'
import AlertSuccess from '@/components/ui/AlertSuccess'
import AlertLoadingError from '@/components/AlertLoadingError'
import { Button } from '@/components/ui/Button'
import { useEffect, useState } from 'react'


const Login = () => {
  const { loginUser, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (error && (error.includes('not confirmed') || error === 'User is not confirmed.')) {
      setShowButton(true);
      console.log('Error detected:', error);
    } else {
      setShowButton(false);
    }
  }, [error]);

  const onSubmit = async (data) => {
    setShowButton(false);
    const result = await loginUser(data);
    if (result.success) {
      navigate('/');
    }
  }

  const form = useForm({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const redirect = {
    message: 'Don\'t have an account?',
    text: 'Create an account',
    link: '/signup'
  }

  const inputs = [
    {
      name: 'username',
      placeholder: 'username',
      type: 'string'
    },
    {
      name: 'password',
      placeholder: 'password',
      type: 'password'
    },
  ]

  return (
    <div className='flex flex-col justify-center items-center h-full' style={{ width: 'clamp(300px, 20vw, 800px)' }}>

      <AlertLoadingError isLoading={isLoading} error={error} showButton={showButton}>
        Logging in...
      </AlertLoadingError>

      <LoginRegisterForm title='Login to your account' redirect={redirect} inputs={inputs} form={form} button='Login' reset={true} onSubmit={onSubmit} />
    </div>
  );
}

export default Login