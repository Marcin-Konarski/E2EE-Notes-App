import { useState } from "react";
import { argon2id } from "hash-wasm";

const useWrapingKey = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const deriveKeyFromPassword = async (passphrase, salt) => {
        setIsLoading(true);
        setError(null);

        try {
            const rawKey = await argon2id({
                outputType: 'binary',
                password: passphrase,
                salt: salt,
                hashLength: 32,
                parallelism: 1,
                iterations: 3,
                memorySize: 4096,
            });

            const key = await window.crypto.subtle.importKey(
                'raw',
                rawKey,
                'AES-GCM',
                false,
                ['wrapKey', 'unwrapKey'],
            );

            return {success: true, key: key};
        } catch (err) {
            setError(err);
            return { success: false, error: err};
        } finally {
            setIsLoading(false);
        }
    };

    const wrapPrivateKey = async (wrappingKey, privateKey) => {
        setIsLoading(true);
        setError(null);

        try {
            // console.log('wrappingKey', wrappingKey);
            // console.log('privateKey', privateKey);
            const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Why 12 here?? (I mean why not 16?)
            const wrappedKey = await window.crypto.subtle.wrapKey(
                'pkcs8',
                privateKey,
                wrappingKey,
                {
                    name: 'AES-GCM',
                    iv: iv,
                },
            );
            // console.log('wrappedKey', wrappedKey);

            const encryptedPrivateKeyStorage = new Uint8Array([...iv, ...new Uint8Array(wrappedKey)]);

            // console.log('encryptedPrivateKeyStorage', encryptedPrivateKeyStorage);
            return {success: true, encryptedPrivateKeyStorage: encryptedPrivateKeyStorage};
        } catch (err) {
            setError(err);
            return { success: false, error: err};
        } finally {
            setIsLoading(false);
        }
    };

    const unwrapPrivateKey = async (wrappingKey, wrappedPrivateKey, algorithm) => {
        setIsLoading(true);
        setError(null);

        try {
            const iv = wrappedPrivateKey.slice(0, 12);
            const encryptedPrivateKey = wrappedPrivateKey.slice(12);

            const privateKey = await window.crypto.subtle.unwrapKey(
                'pkcs8',
                encryptedPrivateKey,
                wrappingKey,
                {
                    name: 'AES-GCM',
                    iv: iv,
                },
                algorithm,
                false,
                ["wrapKey", "unwrapKey"],
            );

            // console.log(privateKey);
            return privateKey;
        } catch (err) {
            setError(err);
            return { success: false, error: err};
        } finally {
            setIsLoading(false);
        }
    };

    return { deriveKeyFromPassword, wrapPrivateKey, unwrapPrivateKey, isLoading, error }
}

export default useWrapingKey