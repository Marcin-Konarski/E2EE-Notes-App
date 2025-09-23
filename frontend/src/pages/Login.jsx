import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'

import useAuth from '@/hooks/useAuth'
import { LoginFormSchema } from '@/lib/ValidationSchema'
import LoginRegisterForm from '@/components/LoginRegisterForm'
import AlertSuccess from '@/components/ui/AlertSuccess'
import AlertLoadingError from '@/components/AlertLoadingError'
import { Button } from '@/components/ui/Button'


const Login = () => {
  const { loginUser, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const createdAccount = useLocation().state?.createdAccount;

  const onSubmit = async (data) => {
    const result = await loginUser(data);
    if (result.success)
      navigate('/');
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

  return (<div className='flex flex-col justify-center items-center h-full' style={{ width: 'clamp(300px, 20vw, 800px)' }}>

    {createdAccount === 'successful' && //! This is displayed only after redirection from Register page
      <AlertSuccess title='Success' className={'!block !p-4 mx-auto max-w-md mb-5'} green={true}>
        <span>
          Account was created successfully. Please check your email to verify your account. Did not receive your email? Check spam or
        </span>
        <div className="flex justify-end w-full -mt-3">
          <Button variant='ghost' asChild>
            <Link>Resend Email TODO TODO TODO</Link>
          </Button>
        </div>
      </AlertSuccess>
    }

    <AlertLoadingError isLoading={isLoading} error={error}>Logging in...</AlertLoadingError>
    <LoginRegisterForm title='Login to your account' redirect={redirect} inputs={inputs} form={form} button='Login' reset={true} onSubmit={onSubmit} />
  </div>);
}

export default Login