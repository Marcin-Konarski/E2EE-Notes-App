import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { REGEXP_ONLY_DIGITS } from "input-otp";

import useAuth from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/InputOTP";
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/Form';
import { EmailVerificationFormSchema } from '@/lib/ValidationSchema';
import DisappearingAlert from './DisappearingAlert';

const EmailVerificationForm = ({ email, onValidate, isValidating }) => {
  const [otp, setOtp] = useState("");
  const { resendVerificationEmail, error } = useAuth();
  const [status, setStatus] = useState(null);
  const emailRef = useRef('');

  const form = useForm({
    resolver: zodResolver(EmailVerificationFormSchema),
    mode: 'onChange',
    defaultValues: {
      email: email || '',
    },
  });

  const handleSubmit = (data) => {
    if (otp.length !== 6) return;
    onValidate(email || data.email, otp);
  };

  const handleResend = async (data) => {
    setStatus(null);
    emailRef.current = email || data.email;
    const result = await resendVerificationEmail(emailRef.current);
    setStatus(result.success);
  };

  const hasEmail = email && email.trim().length > 0;
  const isValid = otp.length === 6;

  return (<>
    {status !== null && (
      status
        ? <DisappearingAlert title='Success' color='primary'>{emailRef.current ? `Email sent: ${emailRef.current}` : `Email has been sent successfuly.`}</DisappearingAlert>
        : <DisappearingAlert title='Error' Error color='destructive'>Error sending email</DisappearingAlert>
    )}

    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col w-full max-w-md space-y-6">

        {!hasEmail && (
          <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Enter your email" type="email" disabled={isValidating} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex flex-col items-center space-y-4">
          <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} onChange={(value) => setOtp(value)} value={otp} disabled={isValidating}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          {otp === "" && (
            <p className="text-sm text-muted-foreground">
              Enter your one-time password.
            </p>
          )}
        </div>

        <div className="flex flex-row gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={form.handleSubmit(handleResend)} className="flex-1" disabled={isValidating}>
            Resend Email
          </Button>
          <Button type="submit" className="flex-1" disabled={!isValid || isValidating}>
            {isValidating ? 'Validating...' : 'Validate'}
          </Button>
        </div>

      </form>
    </Form>
  </>);
};

export default EmailVerificationForm;
