import { createContext, useCallback, useState } from 'react'


export const NotesContext = createContext(undefined);

export const NotesProvider = ({ children }) => {
    const [notes, setNotes] = useState([]);
    const [currentNoteId, setCurrentNoteId] = useState(null);
    const [noteEdits, setNoteEdits] = useState({});
    // const [newNote, setNewNote] = useState({title: 'New Note', body: ''});
    const storageNoteIdKey = 'currentNoteId';

    const updateNotes = (notes) => {
        setNotes(notes);
    }

    const addNote = (note) => {
        setNotes(prev => [...prev, note]);
    }

    const removeNote = (noteId) => {
        setNotes(prev => prev.filter(n => n.id !== noteId));
        setNoteEdits(n => { // Also remove all note edits for this note
            const updated = {...n};
            delete updated[noteId];
            return updated;
        })
    }

    const updateNoteBody = useCallback((noteId, body) => {
        setNoteEdits(n => ({ ...n, [noteId]: body })); // Update the body of a specific note in memory
    }, [])

    // Get the current body for a note (edited version or original from backend)
    const getNoteBody = (noteId) => {
        if (noteEdits[noteId] !== undefined) {
            return noteEdits[noteId]; // Return the edited version if it exists, otherwise return the original
        }
        const note = notes.find(note => note.id === noteId);
        return note?. body || '';
    }

    const clearNotes = () => {
        setNotes([]);
        setNoteEdits({});
    }

    const values = {
        notes,
        updateNotes,
        addNote,
        removeNote,
        updateNoteBody,
        getNoteBody,
        clearNotes,
        noteEdits,
        setNoteEdits,
        currentNoteId,
        setCurrentNoteId,
        // newNote,
        // setNewNote,
        storageNoteIdKey
    };

    return (
        <NotesContext.Provider value={values}>
            {children}
        </NotesContext.Provider>
    );
};