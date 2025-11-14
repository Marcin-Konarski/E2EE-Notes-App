import { useState } from 'react'
import EmailService from '@/services/EmailService';
import UserService from '@/services/UserService';
import { setAccessToken } from '@/services/ApiClient';
import { useUserContext } from '@/hooks/useUserContext';
import useNotes from './useNotes';
import { arrayBufferToBase64, base64ToArrayBuffer } from '@/lib/encoding'
import useWrapingKey from '@/cryptography/useWrapingKey';
import useAsymmetric from '@/cryptography/useAsymmetric';
import useSymmetric from '@/cryptography/useSymmetric';
import { useNotesContext } from './useNotesContext';

const useAuth = () => {
    const { fetchNotes } = useNotes();
    const { updateNotes } = useNotesContext();
    const { user, login, logout, userKeys } = useUserContext();
    const { deriveKeyFromPassword, unwrapPrivateKey } = useWrapingKey();
    const { manageEncryptedSymmetricKey, decryptAllNotes } = useSymmetric();
    const { createRSAKeyPair, importPublicKey } = useAsymmetric();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const register = async (data) => {
        logout(); // If some user is logged in, log them out
        setIsLoading(true);
        setError(null);

        try {
            const response = await UserService.createUser(data);
            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Registration Failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const verifyEmail = async (email, otp, password, createdAccount=true) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await EmailService.confirmEmail({email: email, otp: otp});
            const token = response.data.access_token;

            setAccessToken(token);
	    if (!createdAccount) return {success: true};

            const salt = window.crypto.getRandomValues(new Uint8Array(16));
            const userWrappingArgon2Key = await deriveKeyFromPassword(password, salt);
            password = '';
            const { publicKey, wrappedPrivateKey, publicKeyStorage } = await createRSAKeyPair(userWrappingArgon2Key);

            // const uploadKeysResponse = await uploadKeys(publicKeyStorage, wrappedPrivateKey, salt);
            // const userResponse = await UserService.getUserDetails();

            const [userResponse, uploadKeysResponse] = await Promise.all([
                UserService.getUserDetails(),
                uploadKeys(publicKeyStorage, wrappedPrivateKey, salt),
            ])

            userKeys.current.userWrappingKey = userWrappingArgon2Key;
            userKeys.current.public_key = publicKey; // Remember public key in order to be able to encrypt notes (actually encrypt symmetric data keys used to encrypte notes in order to upload then to backend)
            login(userResponse.data);

            return {success: true};
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Verification failed';
            setError(errorMessage);
            return { success: false, error: errorMessage};
        } finally {
            setIsLoading(false);
        }
    };

    const loginUser = async (credentials) => {
        setIsLoading(true);
        setError(null);

        try {
            const tokenResponse = await UserService.getTokens(credentials);
            setAccessToken(tokenResponse.data.access);

            const [userResponse, notesResponse] = await Promise.all([
                UserService.getUserDetails(),
                fetchNotes(),
            ]);

            await manageKeysOnLogin(credentials.password, userResponse.data.public_key, userResponse.data.private_key, userResponse.data.salt);
            await manageNotesDecryption(notesResponse.data);

            login(userResponse.data);

            return { success: true }
        } catch (err) {
            let errorMessage = err.response?.data?.detail || err.response?.data?.message || err?.message || 'Login Failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const loginOnPageRefresh = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await UserService.refreshToken();
            setAccessToken(response.data.access);

            const [userResponse, notesResponse] = await Promise.all([ // Fetch user details and notes in parallel
                UserService.getUserDetails(),
                fetchNotes(),
            ]);

            login(userResponse.data);
            userKeys.current.responsePublicKey = userResponse.data.public_key; // Assign raw values from response to userKeys in order to remember them and be able to decrypt them
            userKeys.current.responsePrivateKey = userResponse.data.private_key; // when password is provided inside this Notes.jsx so that all notes can be decrypted
            userKeys.current.responseSalt = userResponse.data.salt;

            return {success: true}
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'User does not exist or email not confirmed';
            setError(errorMessage);
            return {success: false, error: errorMessage};
        } finally {
            setIsLoading(false);
        }
    };

    const manageNotesDecryption = async (encryptedNotes) => {
        try {
            const notesWithUnwrappedDataKey = await manageEncryptedSymmetricKey(encryptedNotes);
            const notesWithDecryptedBody = await decryptAllNotes(notesWithUnwrappedDataKey);
            updateNotes(notesWithDecryptedBody);

            return { success: true };
        } catch (err) {
            return { success: false, error: err };
        }
    };

    const manageKeysOnLogin = async (password, public_key, private_key, salt) => {
        const RSAAlgorithm = {
            name: "RSA-OAEP",
            modulusLength: 4096,
            publicExponent: new window.Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        };

        try {
            userKeys.current.salt = base64ToArrayBuffer(salt);
            const decodedPublicKey = base64ToArrayBuffer(public_key);
            const decodedPrivateKey = base64ToArrayBuffer(private_key);

            // userKeys.current.public_key = await importPublicKey(decodedPublicKey);
            // userKeys.current.userWrappingKey = await deriveKeyFromPassword(password, userKeys.current.salt);
            [userKeys.current.public_key, userKeys.current.userWrappingKey] = await Promise.all([
                importPublicKey(decodedPublicKey),
                deriveKeyFromPassword(password, userKeys.current.salt),
            ]);
            password = ''

            userKeys.current.private_key = await unwrapPrivateKey(userKeys.current.userWrappingKey, decodedPrivateKey, RSAAlgorithm);

            return { success: true };
        } catch (err) {
            return { success: false, error: err };
        }
    }

    const updateUser = async (data) => {
        setIsLoading(true);
        setError(null);

        const username = user.username
        const email = user.email
        if (username === data.username && email === data.email) {
            setIsLoading(false);
            return {success: true, response: 'Nothing to update'}
        }

        try {
            const response = await UserService.updateUser(data);
            if (response.status === 200){
                login({...user, username: response.data.username, email: response.data.email});

                if (email !== response.data.email)
                    return {success: true, response: 'Profile updated successfully! Verification email has been sent. Please verify you account by clicking a link in the email.'};
            }

            return {success: true, response: response.data};
        } catch (err) {
            const errorMessage = err.response?.data?.username || err.response?.data?.email || 'Failed updating user details';
            setError(errorMessage);
            return {success: false, error: errorMessage};
        } finally {
            setIsLoading(false);
        }
    };

    const changePassword = async (data) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await UserService.changePassword(data);
            return { success: true, response: response.data };
        } catch (err) {
            const errorMessage =
                err.response?.data?.currentPassword ||
                err.response?.data?.confirmPassword ||
                'Failed to update password';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const resendVerificationEmail = async (email) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await EmailService.resendEmail({email: email});
            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data || 'Failed to send email';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const uploadKeys = async (publicKey, privateKey, salt) => {
        setIsLoading(true);
        setError(null);

        try {
            const publicKeyBase64 = arrayBufferToBase64(publicKey);
            const privateKeyBase64 = arrayBufferToBase64(privateKey);
            const saltBase64 = arrayBufferToBase64(salt);

            const response = await UserService.sendKeys({ public_key: publicKeyBase64, private_key: privateKeyBase64, salt: saltBase64 });

            return { success: true, data: response.data};
        } catch (err) {
            const errorMessage = err.response?.data || 'Failed to upload keys';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const deleteUser = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await UserService.deleteUser();
            logout(); // Log out user after deletion
            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to delete account';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    return { register, verifyEmail, loginUser, loginOnPageRefresh, manageNotesDecryption, manageKeysOnLogin, updateUser, changePassword, resendVerificationEmail, uploadKeys, deleteUser, isLoading, error, setError };
}

export default useAuth
