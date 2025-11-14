import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useUserContext } from './useUserContext';
import { useNotesContext } from '@/hooks/useNotesContext';
import NotesService from '@/services/NotesService';
import UserService from '@/services/UserService';
import useAsymmetric from '@/cryptography/useAsymmetric';
import useSymmetric from '@/cryptography/useSymmetric';
import { base64ToArrayBuffer } from '@/lib/encoding';

const useNotes = () => {
    const navigate = useNavigate();
    const { userKeys } = useUserContext();
    const { storageNoteIdKey, setCurrentNote, updateNotes, updateNote, addNote } = useNotesContext();
    const { createSymmetricKey, encryptNote } = useSymmetric();
    const { importPublicKey, wrapSymmetricKey } = useAsymmetric();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchNotes = useCallback(async () => {
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

    const createEncryptedNote = useCallback(async (data, key) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await NotesService.createNote(data);
            addNote({...response.data, permission: 'O', key: key});
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.response?.data?.non_field_errors || err.response?.data || 'Failed to create note';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleNewNoteCreation = async () => {
        const key = await createSymmetricKey(); // Create random symmetric data key for encryping notes
        const wrappedKey = await wrapSymmetricKey(key, userKeys.current.public_key); // Encrypt this data key in order to store it securely in backend

        const status = await createEncryptedNote({title: 'New Note', body: '', is_encrypted: true, encryption_key: wrappedKey}, key);
        if (status.success) {
            localStorage.setItem(storageNoteIdKey, status.data.id);
            navigate(`/notes/${status.data.id}`);
        } else {
            // TODO: display Alert with error message
        }
    }

    const saveUpdateNote = useCallback(async (noteId, noteTitle, body, encryptionKey) => {
        setIsLoading(true);
        setError(null);

        try {
            const encryptedBody = await encryptNote(body, encryptionKey);
            updateNote(noteId, {title: noteTitle, body: body}); // Update note in memory regardless of whether saving to backend will be successful or not
            await NotesService.updateNote(noteId, {title: noteTitle, body: encryptedBody});
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

        const userKeyArrayBuffer = base64ToArrayBuffer(user.public_key);
        const shareUserPublicKey = await importPublicKey(userKeyArrayBuffer);
        const e = await wrapSymmetricKey(encryption_key, shareUserPublicKey);
        const data = {
            'user': user.id,
            'encryption_key': e,
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


    return { fetchNotes, createNote, createEncryptedNote, handleNewNoteCreation, saveUpdateNote, deleteNote, removeAccess, listUsers, shareNote, isLoading, error }
}

export default useNotes