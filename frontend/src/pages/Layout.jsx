import { ThemeProvider } from '@/components/theme/ThemeProvider'
import NavBar from '@/components/NavBar'
import { Outlet } from 'react-router-dom'


function Layout() {

    return (
        <ThemeProvider defaultTheme='dark' storageKey='ui-theme'>
            <NavBar />
            <div className='flex justify-center items-center text-2xl min-h-screen'>
                <div id='main'>
                    <Outlet />
                </div>
            </div>
        </ThemeProvider>
    )
}

export default Layout
