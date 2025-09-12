import { ThemeProvider } from '@/components/theme/ThemeProvider'
import NavBar from '@/components/NavBar'




function SignUp() {

  return (
    <ThemeProvider defaultTheme='dark' storageKey='ui-theme'>

      <NavBar />

      <div className='flex justify-center items-center text-2xl min-h-screen'>

        <div>SignUp Page</div>

      </div>

    </ThemeProvider>
  )
}

export default SignUp
