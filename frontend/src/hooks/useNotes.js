import { useState } from 'react'
import { useNotesContext } from '@/hooks/useNotesContext';
import NotesService from '@/services/NotesService';
import UserService from '@/services/UserService';

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
            console.log(response.data)
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
            console.log(response)
            addNote(response.data);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data?.non_field_errors || err.response?.data || 'Failed to create note';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const createEncryptedNote = async (data, encryption_key) => {
        setIsLoading(true);
        setError(null);

        const newData = {
            ...data,
            is_encrypted: true,
            encryption_key: encryption_key,
        }

        try {
            const response = await NotesService.createNote(newData);
            console.log(response)
            addNote({...response.data, permission: 'O'}); // Add owner permission here as well in order to render newly created notes in the `My notes` section
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data?.non_field_errors || err.response?.data || 'Failed to create note';
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

    // This is used to retrieve list of users to whom note may be shared to. Thus this function should be in useNotes.jsx and not in useAuth.jsx
    const listUsers = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await UserService.getUsersList();
            console.log(response.data)
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to obtain list of users';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }

    const shareNote = async (noteId, user, permission) => {
        setIsLoading(true);
        setError(null);

        console.log(user.id)
        const data = {
            'user': user.id,
            'encryption_key': 'random encryption key useNotes.jsx',
            'permission': permission
        }

        try {
            const response = await NotesService.shareNote(noteId, data);
            console.log(response.data)
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to obtain list of users';
            setError(errorMessage);
            console.log(err)
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }

    return { fetchNotes, createNote, createEncryptedNote, saveUpdateNote, deleteNote, listUsers, shareNote, isLoading, error }
}

export default useNotes