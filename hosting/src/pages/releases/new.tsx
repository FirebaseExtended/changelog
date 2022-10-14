import { useEffect, useState } from 'react'
import type { ChangeEvent, Dispatch, FormEvent } from 'react'

import Head from 'next/head'
import { useRouter } from 'next/router'

import { addDoc, collection, doc, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore'
import { useFirestore, useSigninCheck, useUser } from 'reactfire'

import { RELEASE_FORM_ID, handleFeaturesString, uploadReleaseCover } from '@lib/releases'
import type { Release } from '@lib/types'

import { EntryHero } from '@components/releases'

export default function ReleaseEditPage() {
	const [title, setTitle] = useState<Release['title']>('')
	const [body, setBody] = useState<Release['body']>('')
	const [version, setVersion] = useState<Release['version']>('')
	const [summary, setSummary] = useState<Release['summary']>('')
	const [features, setFeatures] = useState<Release['features']>('')

	// Image stuff
	const [coverImage, setCoverImage] = useState<File>()
	const [coverImageURL, setCoverImageURL] = useState<string>()

	const [isPublishing, setIsPublishing] = useState<boolean>(false)

	const router = useRouter()
	const user = useUser()
	const { status, data: signInCheckResult } = useSigninCheck()

	const db = useFirestore()

	const onChange =
		(dispatcher: Dispatch<any>) => (ev: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
			dispatcher(ev.target.value)

	const onCoverImageChange = (ev: ChangeEvent<HTMLInputElement>) => {
		const image = ev.target?.files?.[0]

		if (image) {
			setCoverImage(image)
			setCoverImageURL(URL.createObjectURL(image))
		}
	}

	const onSave = async (ev: FormEvent) => {
		ev.preventDefault()

		setIsPublishing(true)

		const createdReleaseDoc = await addDoc(collection(db, `releases/`), {
			title,
			body,
			version,
			timestamp: serverTimestamp(),
			summary: summary || '',
			image_url: null,
			author: {
				uid: user.data?.uid,
				photoURL: user.data?.photoURL,
				displayName: user.data?.displayName
			}
		})

		const [coverImageStorageUrl] = await Promise.all([
			uploadReleaseCover(createdReleaseDoc.id, coverImage),
			handleReleases(createdReleaseDoc.id)
		])

		if (coverImageStorageUrl) {
			await updateDoc<Partial<Release>>(doc(db, `releases/${createdReleaseDoc.id}`), {
				image_url: coverImageStorageUrl
			})
		}

		router.push(`/releases/${createdReleaseDoc.id}`)
	}

	const handleReleases = async (releaseId: Release['id']) => {
		const batch = writeBatch(db)

		const featuresToCreate = handleFeaturesString(features)

		featuresToCreate.forEach((feature) => {
			const featureDoc = doc(collection(db, `releases/${releaseId}/features`))
			batch.set(featureDoc, { feature })
		})

		await batch.commit()
	}

	// Decide whether to force the user to sign in based on their auth state
	useEffect(() => {
		if (signInCheckResult?.signedIn === false) {
			router.push('/sign-in')
		}
	}, [router, signInCheckResult?.signedIn])

	if (status === 'loading') {
		return <span>Loading...</span>
	}

	if (signInCheckResult?.signedIn === false) {
		return null
	}

	return (
		<>
			{/* Meta/SEO */}
			<Head>
				<title>{title || 'New release'} | Firebase Changelog</title>
			</Head>

			{/* Hero */}
			<EntryHero mode="create" isLoading={isPublishing} />

			<main className="container py-24 form-control">
				<form
					id={RELEASE_FORM_ID}
					className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-screen-sm"
					onSubmit={onSave}
				>
					{/* Image */}
					<label
						htmlFor="image"
						className="flex flex-col md:flex-row md:items-center gap-8 md:col-span-2"
					>
						<span className="form-label">Hero Image</span>

						{/* eslint-disable-next-line @next/next/no-img-element */}
						{coverImageURL && <img src={coverImageURL} alt="Cover for release" />}
						<input
							type="file"
							name="Image"
							id="image"
							accept="image/*"
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
							rows={2}
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
					<div className="col-span-2">
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
