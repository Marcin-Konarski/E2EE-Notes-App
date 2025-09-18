import { Outlet } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { UserProvider } from '@/context/UserContext'
import NavBar from '@/components/NavBar'


const Layout = () => {
    

    return (
        <ThemeProvider defaultTheme='dark' storageKey='ui-theme'>
            <UserProvider>
                <div className='h-screen flex flex-col'>
                    <NavBar />
                    <div id='main' className='flex-1 flex justify-center items-center'>
                        {/* <div id='main'> */}
                            <Outlet />
                        {/* </div> */}
                    </div>
                </div>
            </UserProvider>
        </ThemeProvider>
    )
}

export default Layout
