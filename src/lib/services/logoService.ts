import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export const uploadLogo = async (file: File): Promise<string> => {
  try {
    const storageRef = ref(storage, 'logos/app-logo');
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading logo:', error);
    throw error;
  }
};