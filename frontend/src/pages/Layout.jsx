import { ThemeProvider } from '@/components/theme/ThemeProvider'
import NavBar from '@/components/NavBar'
import { Outlet } from 'react-router-dom'


const Layout = () => {

    return (
        <ThemeProvider defaultTheme='dark' storageKey='ui-theme'>
            <div className='h-screen flex flex-col'>
                <NavBar />
                <div className='flex-1 flex justify-center items-center'>
                    <div id='main'>
                        <Outlet />
                    </div>
                </div>
            </div>
        </ThemeProvider>
    )
}

export default Layout
