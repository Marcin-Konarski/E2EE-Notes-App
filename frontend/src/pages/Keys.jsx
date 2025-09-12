import { ThemeProvider } from '@/components/theme/ThemeProvider'
import NavBar from '@/components/NavBar'




function Keys() {

  return (
    <ThemeProvider defaultTheme='dark' storageKey='ui-theme'>

      <NavBar />

      <div className='flex justify-center items-center text-2xl min-h-screen'>

        <div>Encryption Keys Page Or Summat</div>

      </div>

    </ThemeProvider>
  )
}

export default Keys
