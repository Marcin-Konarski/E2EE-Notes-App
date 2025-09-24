import { createBrowserRouter } from "react-router";
import Layout from "@/pages/Layout";
import Home from '@/pages/Home'
import Notes from '@/pages/Notes'
import Keys from '@/pages/Keys'
import Profile from '@/pages/Profile'
import Login from '@/pages/Login'
import Register from "@/pages/Register";
import EmailVerification from "./pages/EmailVerification";
import PageNotFound from "@/pages/PageNotFound";


const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <PageNotFound />,
    children: [
        { index: true, Component: Home },
        { path: "notes", Component: Notes },
        { path: "keys", Component: Keys },
        { path: "profile", Component: Profile },
        { path: "login", Component: Login },
        { path: "signup", Component: Register },
        { path: "verify/:activationKey", Component: EmailVerification},
    ]
  },
]);

export default router