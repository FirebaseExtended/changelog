import type { GetServerSidePropsResult } from 'next'
import Head from 'next/head'
import Image from 'next/image'

import { collection, doc, getDoc, getDocs, getFirestore } from 'firebase/firestore'

import type { Feature, Release } from '@lib/types'

import { EntryHero, FeaturesList, Markdown } from '@components/releases'

type ReleasePageProps = {
	release: Release
	features: Feature[]
}

export default function ReleasePage({ release, features }: ReleasePageProps) {
	// prevent errors when release is deleted
	if (!release) {
		return null
	}

	return (
		<>
			{/* Meta/SEO */}
			<Head>
				<title>{release.title} | Firebase Changelog</title>
			</Head>

			{/* Hero */}
			<EntryHero release={release} />

			{/* Main body */}
			<main className="container py-24">
				{/* Intro */}
				<p className="text-white text-xl mb-12 max-w-screen-md">{release.summary}</p>

				{/* Image */}
				{release.image_url && (
					<div className="flex max-w-screen-md my-12 relative h-72">
						<Image
							src={release.image_url}
							layout="fill"
							objectFit="contain"
							objectPosition="left"
							alt='Image for release "{release.title}"'
						/>
					</div>
				)}

				{/* Features List */}
				<FeaturesList features={features} />

				<Markdown markdown={release.body} />
			</main>

			{/* Aesthetic grid */}
			<div className="overlay-grid">
				<span className="overlay-grid-span mt-16" />
				<span className="overlay-grid-span" />
				<span className="overlay-grid-span" />
				<span className="overlay-grid-span" />
				<span className="overlay-grid-span" />
				<span className="overlay-grid-span" />
				<span className="overlay-grid-span mt-12" />
				<span className="overlay-grid-span mt-12" />
			</div>
		</>
	)
}

type Context = {
	params: {
		id: Release['id']
	}
}

export async function getServerSideProps(
	context: Context
): Promise<GetServerSidePropsResult<ReleasePageProps>> {
	const { id: releaseId } = context.params

	const db = getFirestore()

	// release
	const documentRef = doc(db, 'releases', releaseId)
	const releaseSnapshot = await getDoc(documentRef)

	if (releaseSnapshot.exists() === false)
		return {
			notFound: true
		}

	const release = {
		...releaseSnapshot.data(),
		id: releaseSnapshot.id,
		timestamp: releaseSnapshot.get('timestamp').toMillis()
	} as Release

	// features
	const featuresRef = collection(db, 'releases', releaseId, `features`)
	const featuresSnapshot = await getDocs(featuresRef)

	const features = featuresSnapshot.docs.map((featureSnapshot) => ({
		id: featureSnapshot.id,
		feature: featureSnapshot.get('feature')
	}))

	return {
		props: {
			release,
			features
		}
	}
}
