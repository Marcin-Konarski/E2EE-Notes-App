import { createBrowserRouter } from "react-router";
import Home from '@/pages/Home'
import Notes from '@/pages/Notes'
import Keys from '@/pages/Keys'
import Settings from '@/pages/Settings'
import Login from '@/pages/Login'
import SignUp from '@/pages/SignUp'
import PageNotFound from "@/pages/PageNotFound";
import Layout from "@/pages/Layout";


const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <PageNotFound />,
    children: [
        { index: true, Component: Home },
        { path: "notes", Component: Notes },
        { path: "keys", Component: Keys },
        { path: "settings", Component: Settings },
        { path: "login", Component: Login },
        { path: "signup", Component: SignUp },
    ]
  },
]);

export default router