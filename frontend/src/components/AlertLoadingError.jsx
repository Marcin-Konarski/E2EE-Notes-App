import React from 'react'
import AlertSuccess from '@/components/ui/AlertSuccess'
import AlertError from '@/components/ui/AlertError'

const AlertLoadingError = ({isLoading, error, children}) => {
  return (
    <div className='flex justify-center mb-10' style={{ width: 'clamp(300px, 20vw, 800px)' }}>
        {isLoading && (
            <AlertSuccess title={'Hold On'} className={'!block !py-4 w-full mb-5'} green={false}>{children}</AlertSuccess>
        )}

        {error && (
            <AlertError title={'Something Went Wrong'} className={'!block !py-4 w-full mb-5'}>{error}</AlertError>
        )}
    </div>
  )
}

export default AlertLoadingError