import {initializeApp} from 'firebase/app';
import {getFirestore} from 'firebase/firestore/lite';

import firebaseConfig from '../config/firebaseConfig.json';

export const firebaseApp = initializeApp(firebaseConfig);
export const firestore = getFirestore(firebaseApp);
