import { Settings } from '../types';

const useGoogleDrive = (props: any) => {
    return { 
        isSupported: false, 
        isSignedIn: false, 
        isAuthLoading: false, 
        isSyncing: false, 
        isLoading: false, 
        user: null, 
        lastSyncDate: null, 
        signIn: () => {}, 
        signOut: () => {}, 
        syncToDrive: () => {}, 
        loadFromDrive: () => {} 
    };
};

export default useGoogleDrive;