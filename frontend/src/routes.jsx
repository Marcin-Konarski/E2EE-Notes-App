import { createBrowserRouter } from "react-router";
import Home from '@/pages/Home'
import Notes from '@/pages/Notes'
import Keys from '@/pages/Keys'
import Settings from '@/pages/Settings'
import Login from '@/pages/Login'
import SignUp from '@/pages/SignUp'



const router = createBrowserRouter([
  { path: "/", Component: Home },
  { path: "/notes", Component: Notes },
  { path: "/keys", Component: Keys },
  { path: "/settings", Component: Settings },
  { path: "/login", Component: Login },
  { path: "/signup", Component: SignUp },
]);

export default router