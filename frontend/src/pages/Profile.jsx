import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import { useUserContext } from "@/hooks/useUserContext";
import AppearanceSection from "@/components/profileSections/AppearanceSection";
import PasswordSection from "@/components/profileSections/PasswordSection"
import PersonalSection from "@/components/profileSections/PersonalSection"
import DangerZoneSection from "@/components/profileSections/DangerZoneSection";
import { UpdatePasswordSchema, UpdateUserDataSchema } from "@/lib/ValidationSchema";


const Profile = () => {
  const navigate = useNavigate()
  const { user } = useUserContext()

  useEffect(() => { // If user is logged out move him out of the profile page - only logged in users have access to profile page
    if (!user)
      navigate(-1);
  }, [user])



  const onSubmit = (data) => {
    console.log(data);
  }

  const form = useForm({
    resolver: zodResolver(UpdateUserDataSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
    }
  });

  const inputs = [
    {
      name: 'username',
      type: 'string'
    },
    {
      name: 'email',
      type: 'email'
    },
  ]



  const onPasswordSubmit = (data) => {
    console.log("Password form data:", data);
  };

  const passwordForm = useForm({
    resolver: zodResolver(UpdatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  });

  const passwordInputs = [
    {
      name: "currentPassword",
      type: "password",
      label: "Current password",
      placeholder: "••••••••",
    },
    {
      name: "newPassword",
      type: "password",
      label: "New password",
      placeholder: "••••••••",
    },
    {
      name: "confirmPassword",
      type: "password",
      label: "Confirm new password",
      placeholder: "••••••••",
    },
  ];



  return (
    <div className='flex flex-col space-y-8 mb-20 md:mt-20'>
        <AppearanceSection />
        <PersonalSection form={form} inputs={inputs} onSubmit={onSubmit} button='Save' />
        <PasswordSection form={passwordForm} inputs={passwordInputs} onSubmit={onPasswordSubmit} button="Update" />
        <DangerZoneSection />
    </div>
  );
}

export default Profile
