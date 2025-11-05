import { useState } from 'react'
import useWrapingKey from '@/cryptography/useWrapingKey';
import { arrayBufferToBase64, base64ToArrayBuffer } from '@/lib/encoding';

const useAsymmetric = () => {
    const { wrapPrivateKey } = useWrapingKey();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const RSAKey = {
        name: "RSA-OAEP",
        modulusLength: 4096,
        publicExponent: new window.Uint8Array([1, 0, 1]),
        hash: "SHA-256",
    };

    const createRSAKeyPair = async (wrappingKey) => {
        setIsLoading(false);
        setError(null);

        try {
            const keyPair = await window.crypto.subtle.generateKey(
                RSAKey,
                true,
                ["wrapKey", "unwrapKey"] // Used for encrypting symmetric keys
            );

            const publicKey = await window.crypto.subtle.exportKey('spki', keyPair.publicKey); // Export public
            const publicKeyStorage = new window.Uint8Array(publicKey)

            // During creation of keys (user creation process and session after this) user is logged in and won't need to decrypt
            // anything thus there is no need to export private key. Return only wrapped private key so that it can be uploaded to backend
            const wrappedPrivateKey = await wrapPrivateKey(wrappingKey, keyPair.privateKey);

            return { publicKey: keyPair.publicKey, wrappedPrivateKey: wrappedPrivateKey, publicKeyStorage: publicKeyStorage }

        } catch (err) {
            setError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const importPublicKey = async (publicKeyBuffer) => {
        setIsLoading(false);
        setError(null);

        try {
            const keyBuffer = publicKeyBuffer instanceof Uint8Array 
                ? publicKeyBuffer.buffer 
                : base64ToArrayBuffer(publicKeyBuffer).buffer;

            const publicKey = await window.crypto.subtle.importKey(
                'spki',
                keyBuffer,
                RSAKey,
                false,
                ["wrapKey"]
            );

            return publicKey;
        } catch (err) {
            console.error('Error importing public key:', err);
            setError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const wrapSymmetricKey = async (symmetricKey, wrappingKey) => {
        setIsLoading(true);
        setError(null);

        console.log('symmetricKey', symmetricKey, '\nwrappingKey', wrappingKey);
        try {
            const wrappedKey = await window.crypto.subtle.wrapKey(
                'raw',
                symmetricKey,
                wrappingKey,
                { name: 'RSA-OAEP' }
            );

            const wrappedKeyBase64 = arrayBufferToBase64(wrappedKey);
            return wrappedKeyBase64;
        } catch (err) {
            console.error('Error wrapping symmetric key:', err);
            setError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const unwrapSymmetricKey = async (wrappedKey, privateKey) => {
        setIsLoading(false);
        setError(null);

        try {
            const wrappedKeyBuffer = base64ToArrayBuffer(wrappedKey).buffer;

            const unwrappedKey = await window.crypto.subtle.unwrapKey(
                'raw',
                wrappedKeyBuffer,
                privateKey,
                { name: 'RSA-OAEP' },
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt', 'decrypt']
            );

            return unwrappedKey;
        } catch (err) {
            console.error('Error unwrapping symmetric key:', err);
            setError(err);
            return null;
        }
    };


    return { createRSAKeyPair, importPublicKey, wrapSymmetricKey, unwrapSymmetricKey, isLoading, error }

}

export default useAsymmetric