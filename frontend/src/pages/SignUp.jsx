import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import LoginRegisterForm from '@/components/LoginRegisterForm'
import { RegisterFormSchema } from '@/lib/ValidationSchema'

const SignUp = () => {

  const form = useForm({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirm: ''
    }
  });

  const onSubmit = (data) => {
    console.log(data)
  }

  const redirect = {
    message: 'Already have an account?',
    text: 'Log in',
    link: '/login'
  }
  const inputs = [
    {
      name: 'username',
      placeholder: 'username',
      type: 'string'
    },
    {
      name: 'email',
      placeholder: 'email',
      type: 'email'
    },
    {
      name: 'password',
      placeholder: 'password',
      type: 'password'
    },
    {
      name: 'confirm',
      placeholder: 'repeat password',
      type: 'password'
    }
  ]

  return (
    <LoginRegisterForm title='Create an account' redirect={redirect} inputs={inputs} form={form} button='Sign in' onSubmit={onSubmit} />
  )
}

export default SignUp
