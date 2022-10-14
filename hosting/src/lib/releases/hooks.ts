import { collection, doc, orderBy, query } from 'firebase/firestore'
import type { ObservableStatus } from 'reactfire'
import { useFirestore, useFirestoreCollectionData, useFirestoreDocData } from 'reactfire'

import type { Release, Releases } from '@lib/types'

import { releaseConverter } from './utils'

type UseReleaseReturn = {
	status: ObservableStatus<Release>['status']
	release: ObservableStatus<Release>['data']
}
export const useRelease = (
	releaseId: Release['id'],
	{ initialData }: { initialData?: Release }
): UseReleaseReturn => {
	const docRef = doc(useFirestore(), 'releases', releaseId).withConverter(releaseConverter)

	const { status, data } = useFirestoreDocData(docRef, { initialData })

	return { status, release: data }
}

type UseReleasesReturn = {
	status: ObservableStatus<Releases>['status']
	releases: ObservableStatus<Releases>['data']
}
export const useReleases = (initialData: Releases): UseReleasesReturn => {
	const releasesCollectionRef = collection(useFirestore(), 'releases').withConverter(
		releaseConverter
	)
	const releasesRef = query(releasesCollectionRef, orderBy('version', 'desc'))

	const { status, data } = useFirestoreCollectionData(releasesRef, { initialData })

	return { status, releases: data }
}
