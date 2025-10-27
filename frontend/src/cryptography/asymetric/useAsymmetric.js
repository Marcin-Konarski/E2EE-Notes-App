import { useState } from 'react'
import useWrapingKey from '@/cryptography/useWrapingKey';

const useKeyPair = () => {
    const { wrapPrivateKey } = useWrapingKey();
    const [isLoading, setIsLoadinng] = useState(false);
    const [error, setError] = useState(null);

    const RSAAlgorithm = {
        name: "RSA-OAEP",
        hash: "SHA-256",
    }

    const createRSAKeyPair = async (wrappingKey) => {
        setIsLoadinng(false);
        setError(null);

        // console.log('wrappingKey', wrappingKey)

        try {
            const RSAKey = {
                name: RSAAlgorithm.name,
                modulusLength: 4096,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: RSAAlgorithm.hash,
            };

            const keyPair = await window.crypto.subtle.generateKey(
                RSAKey,
                true,
                ["wrapKey", "unwrapKey"] // Used for encrypting symmetric keys
            );

            // console.log('keyPair', keyPair);

            const publicKey = await window.crypto.subtle.exportKey('spki', keyPair.publicKey); // Export public
            // console.log('publicKey', publicKey);
            const publicKeyStorage = new Uint8Array(publicKey)

            const status = await wrapPrivateKey(wrappingKey, keyPair.privateKey);
            if (status?.success) {
                return {success: true, publicKey: publicKeyStorage, privateKey: status.encryptedPrivateKeyStorage, keyPair: keyPair}
            } else {
                return { success: false}
            }
        } catch (err) {
            setError(err);
            return { success: false}
        } finally {
            setIsLoadinng(false);
        }
    };

    const wrapSymmetricKey = async (symmetricKey, rsaKeyPair) => { // TODO: Wrap symmetric key!!!!!!
         const wrappedKey = await window.crypto.subtle.wrapKey(
            'raw',
            symmetricKey,
            rsaKeyPair.publicKey,
            {name: 'RSA-OAEP'},
         );
        //  console.log(wrappedKey);
         return wrappedKey;
    };

    const unwrapSymmetricKey = async (wrappedKey, rsaKeyPair) => {
        const unwrappedKey = await window.crypto.subtle.unwrapKey(
            'raw',
            wrappedKey,
            rsaKeyPair.privateKey,
            {name: 'RSA-OAEP'},
            {name: 'AES-GCM'},
            false,
            ['decrypt'],
        );
        // console.log(unwrappedKey);
        return unwrappedKey; 
    };


    return { createRSAKeyPair, wrapSymmetricKey, unwrapSymmetricKey, isLoading, error }

}

export default useKeyPair