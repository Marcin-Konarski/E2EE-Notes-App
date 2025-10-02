import { createContext, useState } from 'react'


export const NotesContext = createContext(undefined);

export const NotesProvider = ({ children }) => {
    const [notes, setNotes] = useState([]);
    const [currentNoteId, setCurrentNoteId] = useState(null);

    const updateNotes = (notes) => {
        setNotes(notes);
    }

    const addNote = (note) => {
        setNotes(prev => [...prev, note]);
    }

    const removeNote = (noteId) => {
        setNotes(prev => prev.filter(n => n.id !== noteId));
    }

    const clearNotes = () => {
        setNotes([]);
    }

    const values = {notes, updateNotes, addNote, removeNote, clearNotes, currentNoteId, setCurrentNoteId};

    return (
        <NotesContext.Provider value={values}>
            {children}
        </NotesContext.Provider>
    );
};