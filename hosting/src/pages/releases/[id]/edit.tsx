import type { ChangeEvent, Dispatch, FormEvent } from 'react'
import { useState } from 'react'

import type { GetServerSidePropsResult } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import {
	Timestamp,
	collection,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	updateDoc,
	writeBatch
} from 'firebase/firestore'
import { useFirestore } from 'reactfire'

import {
	RELEASE_FORM_ID,
	getFeatures,
	getRelease,
	handleFeaturesString,
	uploadReleaseCover
} from '@lib/releases'
import type { Feature, Release } from '@lib/types'

import { EntryHero } from '@components/releases'

type ReleasePageProps = {
	release: Release
	currentFeatures: Feature[]
}

export default function ReleaseEditPage({
	release: releaseSSR,
	currentFeatures
}: ReleasePageProps) {
	const currentFeaturesAsString = currentFeatures.reduce(
		(acc, current) => `${acc}${current.feature}\n`,
		''
	)

	const [title, setTitle] = useState<Release['title']>(releaseSSR.title)
	const [body, setBody] = useState<Release['body']>(releaseSSR.body)
	const [version, setVersion] = useState<Release['version']>(releaseSSR.version)
	const [timestamp, setTimestamp] = useState<Date>(new Date(releaseSSR.timestamp))
	const [summary, setSummary] = useState<Release['summary']>(releaseSSR.summary)
	const [features, setFeatures] = useState<Release['features']>(currentFeaturesAsString)

	// Image stuff
	const [coverImage, setCoverImage] = useState<File>()
	const [coverImageURL, setCoverImageURL] = useState<Release['image_url']>(releaseSSR.image_url)

	const router = useRouter()

	const db = useFirestore()

	const timestampForInputValue = timestamp.toISOString().split('T')?.[0]

	const onChangeTimestamp = (dispatcher: Dispatch<Date>) => (ev: ChangeEvent<HTMLInputElement>) => {
		dispatcher(new Date(ev.target.value))
	}

	const onCoverImageChange = (ev: ChangeEvent<HTMLInputElement>) => {
		const image = ev.target?.files?.[0]

		if (image) {
			setCoverImage(image)
			setCoverImageURL(URL.createObjectURL(image))
		}
	}

	const onChange =
		(dispatcher: Dispatch<any>) => (ev: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
			dispatcher(ev.target.value)

	const onSave = async (ev: FormEvent) => {
		ev.preventDefault()

		// upload cover image if any and handle releases
		const [coverImageStorageUrl] = await Promise.all([
			uploadReleaseCover(releaseSSR.id, coverImage),
			handleReleases()
		])

		// Update the release
		await updateDoc<Partial<Release>>(doc(db, `releases/${releaseSSR.id}`), {
			title,
			body,
			version,
			timestamp: Timestamp.fromDate(timestamp),
			summary: summary || '',
			...(coverImageStorageUrl ? { image_url: coverImageStorageUrl } : {})
		})

		// Back to the release page
		router.push(`/releases/${releaseSSR.id}`)
	}

	const handleReleases = async () => {
		const batch = writeBatch(db)

		// Remove all the current features
		currentFeatures.forEach((feature) => {
			batch.delete(doc(db, `releases/${releaseSSR.id}/features/${feature.id}`))
		})

		const newFeatures = handleFeaturesString(features)

		// Create edited features
		newFeatures.forEach((feature) => {
			const featureDoc = doc(collection(db, `releases/${releaseSSR.id}/features`))
			batch.set(featureDoc, { feature })
		})

		await batch.commit()
	}

	return (
		<>
			{/* Meta/SEO */}
			<Head>
				<title>{title} | Firebase Changelog</title>
			</Head>

			{/* Hero */}
			<EntryHero mode="edit" release={releaseSSR} />

			<main className="container py-24 form-control">
				<form
					id={RELEASE_FORM_ID}
					onSubmit={onSave}
					className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-screen-sm"
				>
					{/* Image */}
					<label
						htmlFor="image"
						className="flex flex-col md:flex-row md:items-center gap-8 md:col-span-2"
					>
						<span className="form-label">Hero Image</span>

						{coverImageURL && (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={coverImageURL}
								className="w-48 h-48 object-contain"
								alt="Cover for release"
							/>
						)}

						<input
							type="file"
							name="Image"
							id="image"
							accept="image/*"
							className="appearance-none flex flex-1 bg-fb-gray-light/10 px-6 py-4 rounded-lg"
							onChange={onCoverImageChange}
						/>
					</label>
					{/* Title */}
					<div className="md:col-span-2 form-control">
						<label className="form-label" htmlFor="edit-title">
							Title
						</label>

						<input
							type="text"
							id="edit-title"
							value={title}
							onChange={onChange(setTitle)}
							placeholder="Title"
							className="input"
							required
						/>
					</div>

					{/* Date */}
					<div className="md:col-span-1 form-control">
						<label className="form-label" htmlFor="edit-date">
							Date
						</label>

						<input
							type="date"
							id="edit-date"
							placeholder="1/1/1900"
							className="input"
							value={timestampForInputValue}
							onChange={onChangeTimestamp(setTimestamp)}
							required
						/>
					</div>

					{/* Version */}
					<div className="md:col-span-1 form-control">
						<label className="form-label" htmlFor="edit-version">
							Version
						</label>

						<input
							type="text"
							id="edit-version"
							placeholder="0.00"
							className="input"
							value={version}
							onChange={onChange(setVersion)}
							required
						/>
					</div>

					{/* Summary */}
					<div className="md:col-span-2 form-control">
						<label className="form-label" htmlFor="edit-summary">
							Summary
						</label>
						<textarea
							placeholder="Summary"
							rows={4}
							value={summary}
							onChange={onChange(setSummary)}
							id="edit-summary"
							className="w-full text-white bg-fb-gray-light/10 p-6 text-lg"
							required
						/>
					</div>

					{/* Features */}
					<div className="md:col-span-2 form-control">
						<label className="form-label" htmlFor="edit-features">
							Features
						</label>
						<textarea
							placeholder="Features (one per line)"
							rows={10}
							value={features}
							onChange={onChange(setFeatures)}
							id="edit-features"
							className="w-full text-white bg-fb-gray-light/10 p-6 font-mono text-sm"
							required
						/>
					</div>

					{/* Body */}
					<div className="md:col-span-2 form-control">
						<label className="form-label" htmlFor="edit-body">
							Body
						</label>
						<textarea
							value={body}
							onChange={onChange(setBody)}
							placeholder="Body"
							rows={50}
							id="edit-body"
							className="w-full text-white bg-fb-gray-light/10 p-6 font-mono text-sm"
							required
						/>
					</div>
				</form>
			</main>
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
	params: { id: Release['id'] }
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
			currentFeatures: features
		}
	}
}
