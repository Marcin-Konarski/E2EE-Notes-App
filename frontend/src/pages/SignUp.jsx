import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { RegisterFormSchema } from '@/lib/ValidationSchema';
import LoginRegisterForm from '@/components/LoginRegisterForm';
import useRegister from '@/hooks/useRegister';



const SignUp = () => {
  const { register, user, setUser, error } = useRegister();

  const form = useForm({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirm: ''
    }
  });

  useEffect(() => { // UseEffect to accurately display current user and error
    console.log(error);
    console.log(user);
  }, [user, error])

  const onSubmit = (data) => { // { data.email, data.username, data.password, data.confirm }
    const {confirm, ...registerData} = data; // Do not send password confirmation as backend doesn't require it
    register(registerData); // register function defined in custom hook
  }

  // Define fields, labes and values etc. ( - building blocks) for LoginRegisterForm
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
