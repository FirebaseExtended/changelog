import Head from 'next/head'

import {
	collection,
	collectionGroup,
	getCountFromServer,
	getDocs,
	getFirestore,
	orderBy,
	query
} from 'firebase/firestore'
import { useFirestore, useFirestoreCollectionData } from 'reactfire'

import { releaseConverter } from '@lib/releases'
import type { Releases } from '@lib/types'

import { ChangelogEntrySnippet } from '@components/releases'

type HomePageProps = {
	releases: Releases
	totalFeaturesCount: number
}

export default function Home({ releases: releasesSSR, totalFeaturesCount = 0 }: HomePageProps) {
	const releasesCollectionRef = collection(useFirestore(), 'releases').withConverter(
		releaseConverter
	)
	const releasesRef = query(releasesCollectionRef, orderBy('timestamp', 'desc'))

	const { data: releases } = useFirestoreCollectionData(releasesRef, {
		initialData: releasesSSR
	})

	return (
		<>
			<Head>
				<title>Firebase Changelog</title>
				<meta name="description" content="Firebase changelog demo app for Firebase Summit 2022" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<header className="bg-fb-yellow-muted text-fb-gray pt-24 pb-8 min-h-[280px] flex flex-col items-end justify-end">
				<div id="changelog-marquee">
					<div className="moving-element">
						<span>Changelog</span>
						<span>Changelog</span>
						<span>Changelog</span>
					</div>
				</div>
			</header>

			<main className="section">
				<div className="container pt-12 pb-4 flex justify-end">
					<span className="font-semibold mr-2 text-white">{totalFeaturesCount.toLocaleString()}</span> total features
					shipped
				</div>
				<div className="container divide-y divide-[#867944] divide-opacity-20 pb-20">
					{releases.map((release) => (
						<ChangelogEntrySnippet key={release.id} release={release} />
					))}
				</div>
			</main>

			{/* Gridlines */}
			<div className="overlay-grid">
				<span className="overlay-grid-span mt-16" />
				<span className="overlay-grid-span lg:border-solid lg:border-r-2 lg:border-[#867944] lg:border-opacity-30" />
				<span className="overlay-grid-span" />
				<span className="overlay-grid-span" />
				<span className="overlay-grid-span" />
				<span className="overlay-grid-span hidden lg:block" />
				<span className="overlay-grid-span hidden lg:block mt-12" />
				<span className="overlay-grid-span hidden lg:block mt-12" />
			</div>
		</>
	)
}

export async function getServerSideProps() {
	const db = getFirestore()

	// releases
	const collectionRef = query(collection(db, 'releases'), orderBy('timestamp', 'desc'))
	const releasesSnapshot = await getDocs(collectionRef)
	const releases = releasesSnapshot.docs.map((releaseSnapshot) => ({
		...releaseSnapshot.data(),
		id: releaseSnapshot.id,

		// we need to convert timestamp into a JSON serializable value
		// to return it from getServerSideProps
		timestamp: releaseSnapshot.data().timestamp.toMillis()
	}))

	// count
	const featuresGroup = collectionGroup(db, 'features')
	const featuresCount = await getCountFromServer(featuresGroup)
	let { count: totalFeaturesCount } = featuresCount.data()

	totalFeaturesCount = 0; // Hard-coded to 0 for the demo...

	return {
		props: { releases, totalFeaturesCount }
	}
}
