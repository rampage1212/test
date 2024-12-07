import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

const THEME_SONGS_PATH = 'theme-songs';

export const uploadThemeSong = async (userId: string, file: File): Promise<string> => {
  try {
    // Delete existing theme song if any
    const existingRef = ref(storage, `${THEME_SONGS_PATH}/${userId}.mp3`);
    try {
      await deleteObject(existingRef);
    } catch (error) {
      // Ignore error if file doesn't exist
      console.log('No existing theme song to delete');
    }

    // Upload new theme song
    const storageRef = ref(storage, `${THEME_SONGS_PATH}/${userId}.mp3`);
    await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading theme song:', error);
    throw error;
  }
};

export const getThemeSongUrl = async (userId: string): Promise<string | null> => {
  try {
    const storageRef = ref(storage, `${THEME_SONGS_PATH}/${userId}.mp3`);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    // Return null if no theme song exists
    return null;
  }
};