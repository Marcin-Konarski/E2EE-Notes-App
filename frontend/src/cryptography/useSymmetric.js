import useAsymmetric from "@/cryptography/useAsymmetric";
import { useUserContext } from "@/hooks/useUserContext";
import { arrayBufferToBase64, base64ToArrayBuffer } from "@/lib/encoding";
// import { arrayBufferToBase64, base64ToArrayBuffer } from 


const useSymmetric = () => {
    const { userKeys } = useUserContext();
    const { unwrapSymmetricKey } = useAsymmetric();

    const AESGCM = {
        name: 'AES-GCM',
        length: 256,
    };

    const createSymmetricKey = async () => {
        const key = await window.crypto.subtle.generateKey(
            AESGCM,
            true,
            ['encrypt', 'decrypt'],
        );

        return key;
    };

    const encryptNote = async (notePlainText, key) => {
        const iv = window.crypto.getRandomValues(new Uint8Array(16));
        const plainText = (new TextEncoder()).encode(notePlainText);

        const encrypted = await window.crypto.subtle.encrypt(
            {
                name: AESGCM.name,
                iv: iv,
            },
            key,
            plainText
        );
        const encryptedStore = new Uint8Array([...iv, ...new Uint8Array(encrypted)]);

        return arrayBufferToBase64(encryptedStore);
    };

    const decryptNote = async (encryptedStoreObject, key) => {
        let encryptedStore;

        if (typeof encryptedStoreObject === 'string') {
            // base64 string -> Uint8Array
            encryptedStore = base64ToArrayBuffer(encryptedStoreObject);
        } else if (Array.isArray(encryptedStoreObject)) {
            encryptedStore = new Uint8Array(encryptedStoreObject);
        } else {
            // object / map-like e.g. {0: 48, 1: 130, ...}
            encryptedStore = new Uint8Array(Object.values(encryptedStoreObject));
        }

        // const encryptedStore = new window.Uint8Array(Object.values(encryptedStoreObject));

        const iv = encryptedStore.slice(0, 16);
        const encrypted = encryptedStore.slice(16);

        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: AESGCM.name,
                iv: iv,
            },
            key,
            encrypted
        );

        const plainText = (new TextDecoder('utf-8')).decode(decrypted);
        return plainText;
    };

    const manageEncryptedSymmetricKey = async (notes) => {
        console.log('notes', notes);

        const updatedNotes = await Promise.all(
            notes.map(async (note) => {
                if (note?.encryption_key) {
                    note.key = await unwrapSymmetricKey(note.encryption_key, userKeys.current.private_key);
                }
                return note;
            })
        );

        console.log(updatedNotes)
        return updatedNotes;
    };

    const decryptAllNotes = async (notes) => {

        const updatedNotes = await Promise.all(
            notes.map(async (note) => {
                note.body = await decryptNote(note.body, note.key);
                return note;
            })
        );

        return updatedNotes;
    };

    return { createSymmetricKey, encryptNote, decryptNote, manageEncryptedSymmetricKey, decryptAllNotes }
}

export default useSymmetric