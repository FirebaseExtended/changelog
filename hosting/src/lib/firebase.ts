// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { connectStorageEmulator, getStorage } from 'firebase/storage'

export const firebaseConfig = {
	apiKey: 'AIzaSyD05qufwWwM__1JDgwEjqK3lH2OzojDY9g',
	authDomain: 'frameworkawareness-poc.firebaseapp.com',
	projectId: 'frameworkawareness-poc',
	storageBucket: 'frameworkawareness-poc.appspot.com',
	messagingSenderId: '2336730892',
	appId: '1:2336730892:web:8f0f54ba4294049eb3a329'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const database = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

if (process.env.NEXT_PUBLIC_RUN_IN_EMULATOR === 'true') {
	// @ts-ignore
	if (!global.initFirebaseEmulator) {
		// add a global flag to prevent the emulator connection to run
		// everytime this file is used
		// @ts-ignore
		global.initFirebaseEmulator = true

		connectAuthEmulator(auth, 'http://localhost:9099')
		connectFirestoreEmulator(database, 'localhost', 8080)
		connectStorageEmulator(storage, 'localhost', 9199)
	}
}
