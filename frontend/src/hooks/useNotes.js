import { useCallback, useState } from 'react'
import { useNotesContext } from '@/hooks/useNotesContext';
import NotesService from '@/services/NotesService';
import UserService from '@/services/UserService';
import { useNavigate } from 'react-router-dom';
import useSymmetric from '@/cryptography/symmetric/useSymmetric';

const useNotes = () => {
    const navigate = useNavigate();
    const { createSymmetricKey, exportSymmetricKey, manageEncryptedSymmetricKey, decryptAllNotes } = useSymmetric();
    const { updateNotes, updateNote, addNote } = useNotesContext();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchNotes = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await NotesService.fetchNotes();
            // console.log(response.data);
            const notesWithCorrectKey = await manageEncryptedSymmetricKey(response.data) //* response.data is a list of notes. Each note comes with symmetric encrypted key. In order to use this key (decrypt notes) first one must decrypt and import those symmetric keys 
            decryptAllNotes(notesWithCorrectKey)
            // console.log(notesWithCorrectKey);
            updateNotes(notesWithCorrectKey);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch notes';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createNote = useCallback(async (data) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await NotesService.createNote(data);
            addNote({...response.data, permission: 'O'});
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data?.non_field_errors || err.response?.data || 'Failed to create note';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createEncryptedNote = useCallback(async (data, encryptionKey) => {
        setIsLoading(true);
        setError(null);

        const encryptionKeyString = await exportSymmetricKey(encryptionKey);
        const newData = {
            ...data,
            is_encrypted: true,
            encryption_key: encryptionKeyString,
        }

        try {
            const response = await NotesService.createNote(newData);
            addNote({...response.data, permission: 'O', encryption_key: encryptionKey}); // Add owner permission here as well in order to render newly created notes in the `My notes` section
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data?.non_field_errors || err.response?.data || 'Failed to create note';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const saveUpdateNote = useCallback(async (noteId, json) => {
        setIsLoading(true);
        setError(null);

        try {
            updateNote(noteId, json); // Update note in memory regardless of whether saving to backend was successful or not
            const response = await NotesService.updateNote(noteId, json);
            return {success: true }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update note';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    }, []);

    const deleteNote = useCallback(async (id) => {
        setIsLoading(true);
        setError(null);

        try {
            await NotesService.deleteNote(id);
            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to delete note';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const removeAccess = useCallback(async (noteId, userId) => {
        setIsLoading(true);
        setError(null);

        try {
            await NotesService.removeAccess({note: noteId, user: userId});
            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to delete note';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // This is used to retrieve list of users to whom note may be shared to. Thus this function should be in useNotes.jsx and not in useAuth.jsx
    const listUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await UserService.getUsersList();
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to obtain list of users';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const shareNote = useCallback(async (noteId, encryption_key, user, permission) => {
        setIsLoading(true);
        setError(null);

        const data = {
            'user': user.id,
            'encryption_key': await exportSymmetricKey(encryption_key), // manageEncryptedSymmetricKey takes a list of notes
            'permission': permission
        }

        try {
            const response = await NotesService.shareNote(noteId, data);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to obtain list of users';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleNewNoteCreation = async () => {
        const symmetricKey = await createSymmetricKey();
        const status = await createEncryptedNote({title: 'New Note', body: ''}, symmetricKey); // During creation send empty key in order to make UI faster
        if (status.success) {
            navigate(`/notes/${status.data.id}`);
        } else {
            // TODO: display Alert with error message
        }
    }

    return { fetchNotes, createNote, createEncryptedNote, saveUpdateNote, deleteNote, removeAccess, listUsers, shareNote, handleNewNoteCreation, isLoading, error }
}

export default useNotes