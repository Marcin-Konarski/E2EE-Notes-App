import { useState } from 'react'
import { useNotesContext } from '@/hooks/useNotesContext';
import NotesService from '@/services/NotesService';

const useNotes = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { notes, updateNotes, addNote, removeNote } = useNotesContext();


    const fetchNotes = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await NotesService.fetchNotes();
            updateNotes(response.data);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch notes';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const createNote = async (data) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await NotesService.createNote(data);
            addNote(response.data);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to create note';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const saveUpdateNote = async (noteId, json) => {
        setError(null);

        try {
            const response = await NotesService.updateNote(noteId, json);
            console.log(response)
            if (response.status === 200) {
                const updatedNotes = notes.map(note => 
                    note.id === noteId ? {...note, body: response.data.body, title: response.data.title} : note
                );
                updateNotes(updatedNotes);
            }
            return {success: true }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update note';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }

    const deleteNote = async (id) => {
        setIsLoading(true);
        setError(null);

        try {
            await NotesService.deleteNote(id);
            removeNote(id);
            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to delete note';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };


    return { fetchNotes, createNote, saveUpdateNote, deleteNote, isLoading, error }
}

export default useNotes