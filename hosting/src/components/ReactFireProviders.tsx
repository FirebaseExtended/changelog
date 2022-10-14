import type { ReactNode } from 'react'

import type { AppProps } from 'next/app'

import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import {
	AuthProvider,
	FirebaseAppProvider,
	FirestoreProvider,
	StorageProvider,
	useFirebaseApp
} from 'reactfire'

import { firebaseConfig } from '@lib/firebase'

type Props = {
	children: ReactNode
}

export function ReactFireProviders({ children }: Props) {
	const app = useFirebaseApp()

	const firestoreInstance = getFirestore(app)
	const auth = getAuth(app)
	const storage = getStorage(app)

	return (
		<AuthProvider sdk={auth}>
			<StorageProvider sdk={storage}>
				<FirestoreProvider sdk={firestoreInstance}>{children}</FirestoreProvider>
			</StorageProvider>
		</AuthProvider>
	)
}

export function withFirebaseProvider(
	PageComponent: ({ Component, pageProps }: AppProps) => JSX.Element
) {
	return function WithFirebaseProvider(props: AppProps) {
		return (
			<FirebaseAppProvider firebaseConfig={firebaseConfig}>
				<ReactFireProviders>
					<PageComponent {...props} />
				</ReactFireProviders>
			</FirebaseAppProvider>
		)
	}
}
