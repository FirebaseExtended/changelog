import type {
	FirestoreDataConverter,
	QueryDocumentSnapshot,
	SnapshotOptions
} from 'firebase/firestore'

import type { Release, ReleaseFromFirestore } from '@lib/types'

export const COVER_IMAGE_FILENAME = 'cover.jpg' as const
export const RELEASE_FORM_ID = 'releaseForm' as const

export const releaseConverter: FirestoreDataConverter<Release> = {
	toFirestore: (release: Release) => release,
	fromFirestore: (
		snapshot: QueryDocumentSnapshot<ReleaseFromFirestore>,
		options: SnapshotOptions
	) => {
		const queryDocData = snapshot.data(options)

		const convertedRelease: Release = {
			...queryDocData,
			id: snapshot.id,
			timestamp: queryDocData.timestamp?.toMillis()
		}

		return convertedRelease
	}
}
