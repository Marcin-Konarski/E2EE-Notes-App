import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';

import useAuth from '@/hooks/useAuth';
import { RegisterFormSchema } from '@/lib/ValidationSchema';
import LoginRegisterForm from '@/components/LoginRegisterForm';
import AlertLoadingError from '@/components/AlertLoadingError';


const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuth();


  const onSubmit = async (data) => { // data has following structure: { data.email, data.username, data.password, data.confirm }
    const {confirm, ...registerData} = data; // Remove confirm password as backend doesn't require it
    const status = await register(registerData);
    if (status.success)
      navigate('/login', { state: { createdAccount: "successful" } } );
  }

  const form = useForm({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirm: ''
    }
  });

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
    <div className='flex flex-col items-center justify-center h-full'>
      <AlertLoadingError isLoading={isLoading} error={error}>Registering...</AlertLoadingError>
      <LoginRegisterForm title='Create an account' redirect={redirect} inputs={inputs} form={form} button='Sign Up' onSubmit={onSubmit}/>
    </div>
  );
}

export default Register
