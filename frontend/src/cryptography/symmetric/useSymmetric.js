

const useSymmetric = () => {
    const AESGCM = {
        name: 'AES-GCM',
        length: 256,
    };

    const createSymmetricKey = async () => {
        // const array = new Uint8Array(16);
        // return window.crypto.getRandomValues(array); // This is bad for keys - not sufficient entropy as PRNG is optimized for speed instead.

        const key = await window.crypto.subtle.generateKey(
            AESGCM,
            true,
            ['encrypt', 'decrypt'],
        );
        console.log('AES key:', key);

        return key;
    };

    const importSymmetricKey = async (keyData) => {
        const keyDataObject = JSON.parse(keyData);
        const keyBuffer = Uint8Array.from(Object.values(keyDataObject)).buffer
        const key = await window.crypto.subtle.importKey(
            'raw',
            keyBuffer,
            AESGCM,
            true,
            ['encrypt', 'decrypt'],
        );
        return key; 
    };

    const exportSymmetricKey = async (keyObject) => {
        const key = await window.crypto.subtle.exportKey(
            'raw',
            keyObject,
        );
        console.log('export key: ', key);
        const keyString = JSON.stringify(new Uint8Array(key));
        console.log('string key: ', keyString);
        return keyString; // returns string
    };

    const encryptNote = async (notePlainText, key) => {
        const iv = new Uint8Array(16);
        const plainText = (new TextEncoder()).encode(notePlainText);
        console.log('encryptNote', notePlainText, '\niv', iv, '\nkey', key);
        window.crypto.getRandomValues(iv); // Modified in-place, and no copy is made

        const encrypted = await window.crypto.subtle.encrypt(
            {
                name: AESGCM.name,
                iv: iv,
            },
            key,
            plainText
        );
        console.log('xxx', encrypted);
        const encryptedStore = new Uint8Array([...iv, ...new Uint8Array(encrypted)]);
        console.log('encryptedStore', encryptedStore);

        return encryptedStore;
    };

    const decryptNote = async (encryptedStore, key) => {
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

        console.log('plainText', plainText);

        return plainText
    };

    const manageEncryptedSymmetricKey = async (notes) => {

        const updatedNotes = await Promise.all(
            notes.map(async (note) => {
                if (note?.encryption_key) {
                    note.encryption_key = await importSymmetricKey(note.encryption_key);
                }
                return note;
            })
        );

        // TODO: Here Decrypt all notes!

        return updatedNotes;
    };

    return { createSymmetricKey, importSymmetricKey, exportSymmetricKey, encryptNote, decryptNote, manageEncryptedSymmetricKey }
}

export default useSymmetric