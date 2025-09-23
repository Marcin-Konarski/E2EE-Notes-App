import { useEffect, useLayoutEffect } from 'react'
import { Outlet } from 'react-router-dom'

import { UserProvider } from '@/context/UserContext'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import NavBar from '@/components/NavBar'
import useAuth from '@/hooks/useAuth'


export const LayoutOutlet = () => {
    const { loginOnPageRefresh } = useAuth();

    useEffect(() => {
        loginOnPageRefresh();
    }, [])

    return (
        <div className='h-screen flex flex-col'>
            <NavBar />
            <div id='main' className='flex-1 flex justify-center items-center'>
                <Outlet />
            </div>
        </div>
    );
}


const Layout = () => {

    return (
        <ThemeProvider defaultTheme='dark' storageKey='ui-theme'>
            <UserProvider>
                <LayoutOutlet />
            </UserProvider>
        </ThemeProvider>
    );
}

export default Layout
