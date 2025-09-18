import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { LoginFormSchema } from '@/lib/ValidationSchema'
import LoginRegisterForm from '@/components/LoginRegisterForm'

const Login = () => {

  const onSubmit = (data) => {
    console.log(data)
    console.log(location)
    console.log(params)
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
    <LoginRegisterForm title='Login to your account' redirect={redirect} inputs={inputs} form={form} button='Login' reset={true} onSubmit={onSubmit} />
  )
}

export default Login