import NotesListScrollMobile from '@/components/NotesListScrollMobile'
import { useNotesContext } from '@/hooks/useNotesContext';
import React from 'react'

const Blank = () => {
    const { notes } = useNotesContext();

    // On desktop this is empty page but on mobile it's notes list
    return (
        <div className='lg:hidden'>
            <NotesListScrollMobile notesList={notes} />
        </div>
    )
}

export default Blank