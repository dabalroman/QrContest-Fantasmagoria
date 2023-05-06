import { ChangeEvent, useState } from 'react';
import Loader from '@/components/Loader';
import { auth, STATE_CHANGED, storage } from '../../fireapp/lib/firebase';
import { getDownloadURL, ref, uploadBytesResumable } from '@firebase/storage';

export default function ImageUploader () {
    const [uploading, setUploading] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [downloadURL, setDownloadURL] = useState<string|null>(null);

    //Upload image to firebase
    const uploadFile = async (e: ChangeEvent<HTMLInputElement>) => {
        // @ts-ignore
        const file = Array.from(e.target.files)[0];
        const extension = file.type.split('/')[1];

        //create ref to storage under path uploads/userId/currentDate.extension using
        const fileRef = ref(storage, `uploads/${auth.currentUser?.uid}/${Date.now()}.${extension}`);
        setUploading(true);

        //start upload
        const task = uploadBytesResumable(fileRef, file);

        task.on(STATE_CHANGED, (snapshot) => {
            const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(Math.round(pct));
        });

        task
            .then(() => getDownloadURL(fileRef))
            .then((url: any) => {
                setDownloadURL(url);
                setUploading(false);
            });
    };

    return (
        <div className="box">
            <Loader show={uploading}/>

            {uploading && <h3>{progress}%</h3>}

            {!uploading && (
                <>
                    <label className="btn">
                        📷 Upload Img
                        <input type="file" onChange={uploadFile} accept="image/x-png,image/gif,image/jpeg"/>
                    </label>
                </>
            )}

            {downloadURL && <code className="upload-snippet">{`![alt](${downloadURL})`}</code>}
        </div>
    );
}
