import Metatags from '@/components/Metatags';
import ScreenTitle from '@/components/ScreenTitle';
import { useState } from 'react';
import { storage } from '@/utils/firebase';
import { getDownloadURL, ref, uploadBytesResumable } from '@firebase/storage';
import useUserData from '@/hooks/useUserData';

export default function StoragePage () {
    const { user } = useUserData();
    const [imageURL, setImageURL] = useState<string | null>(null);

    const onFileChange = async (fileChangeEvent: any) => {
        const file = fileChangeEvent.target?.files[0];
        const storageRef = ref(storage, user?.uid + '/' + file.name);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                // Calculate the upload progress
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            },
            (error) => {
                console.error('Upload failed:', error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref)
                    .then((downloadURL: string) => {
                        setImageURL(downloadURL);
                    });
            }
        );
    };

    return (
        <main className="grid grid-rows-layout items-center min-h-screen p-4">
            <Metatags title="Szukaj"/>
            <ScreenTitle>Szukaj</ScreenTitle>
            <input type="file" onChange={onFileChange}/>
            {imageURL && <img src={imageURL} alt="Uploaded content"/>}
        </main>
    );
}
