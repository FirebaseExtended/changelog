import {
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	orderBy,
	query,
	writeBatch
} from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'

import { database, storage } from '@lib/firebase'
import type { Release } from '@lib/types'

import { COVER_IMAGE_FILENAME, releaseConverter } from './utils'

export const getReleases = async () => {
	const collectionRef = query(
		collection(database, 'releases').withConverter(releaseConverter),
		orderBy('version', 'desc')
	)

	const releasesSnapshot = await getDocs(collectionRef)

	const releases = releasesSnapshot.docs.map((releaseSnapshot) => releaseSnapshot.data())

	return releases
}

export const getRelease = async (id: string) => {
	const docRef = doc(database, 'releases', id).withConverter(releaseConverter)
	const release = await getDoc(docRef)

	if (!release.exists()) return null

	return release.data()
}

export const deleteRelease = async (releaseId: Release['id']) => {
	const releaseRef = doc(database, 'releases', releaseId)
	const featuresRef = collection(database, 'releases', releaseId, 'features')

	const [releaseDoc, features] = await Promise.all([getDoc(releaseRef), getDocs(featuresRef)])

	if (releaseDoc.get('image_url') !== null) {
		await deleteObject(ref(storage, `releases/${releaseId}/${COVER_IMAGE_FILENAME}`))
	}

	if (features.empty) {
		await deleteDoc(releaseRef)
	} else {
		const batch = writeBatch(database)

		features.forEach(async (feature) => {
			batch.delete(feature.ref)
		})

		batch.delete(releaseRef)

		await batch.commit()
	}
}

export const uploadReleaseCover = async (
	releaseId: Release['id'],
	coverImage: File | undefined
) => {
	if (!coverImage) return null

	const storageRef = ref(storage, `releases/${releaseId}/${COVER_IMAGE_FILENAME}`)

	const uploadTask = uploadBytesResumable(storageRef, coverImage)

	const snapshot = await uploadTask

	const url = await getDownloadURL(snapshot.ref)

	return url
}
