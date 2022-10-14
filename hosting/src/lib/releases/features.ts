import {
	collection,
	collectionGroup,
	getCountFromServer,
	getDocs,
	getFirestore
} from 'firebase/firestore'

import { database } from '@lib/firebase'
import type { Feature } from '@lib/types'

export const handleFeaturesString = (features: string) => {
	const featuresArrayByLine = features?.split('\n')

	// filter out empty lines
	const filteredFeatures = featuresArrayByLine.filter((feature) => feature.trim() !== '')

	// trim filtered features
	const trimmedFeatures = filteredFeatures.map((feature) => feature.trim())

	return trimmedFeatures
}

export const getTotalFeaturesCount = async () => {
	const db = getFirestore()

	const featuresGroup = collectionGroup(db, 'features')
	const featuresCount = await getCountFromServer(featuresGroup)

	const { count } = featuresCount.data()
	return count
}

export const getFeatures = async (releaseId: string) => {
	const collectionRef = collection(database, 'releases', releaseId, `features`)
	const featuresSnapshot = await getDocs(collectionRef)

	const features = featuresSnapshot.docs.map((featureSnapshot) => ({
		id: featureSnapshot.id,
		...featureSnapshot.data()
	}))

	return features as Feature[]
}
