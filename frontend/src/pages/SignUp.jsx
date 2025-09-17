import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import axios from 'axios';

import LoginRegisterForm from '@/components/LoginRegisterForm';
import { RegisterFormSchema } from '@/lib/ValidationSchema';

const SignUp = () => {

  const createAccount = (data) => axios.post('http://127.0.0.1:8000/users/users/', data).then(res => res.data)


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
    delete data.confirm
    console.log(data)
    axios.post('http://127.0.0.1:8000/users/users/', data).then(res => console.log('works:' + res)).catch(error => console.log('error:' + error))
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
