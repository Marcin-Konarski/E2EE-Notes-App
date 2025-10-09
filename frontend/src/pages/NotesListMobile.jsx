import NotesListScrollMobile from '@/components/NotesListScrollMobile'
import { useNotesContext } from '@/hooks/useNotesContext'
import React from 'react'

const NotesListMobile = () => {
    const { notes } = useNotesContext();
    return (
        <NotesListScrollMobile notesList={notes}/>
    )
}

export default NotesListMobile