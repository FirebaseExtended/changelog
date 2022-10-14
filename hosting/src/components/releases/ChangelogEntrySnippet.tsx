import Image from 'next/image'
import Link from 'next/link'

import type { Release } from '@lib/types'

import AuthorCard from './AuthorCard'

type Props = {
	release: Release
}

export default function ChangelogEntrySnippet({ release }: Props) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 mb-12 py-8 gap-y-8">
			{/* Meta */}
			<div className="col-span-1 md:col-span-2 flex flex-col gap-2">
				{/* Version */}
				<span className="title text-xl text-white">{release.version}</span>

				{/* Date */}
				<time>
					{new Date(release.timestamp).toLocaleDateString(undefined, {
						month: 'long',
						day: 'numeric',
						year: 'numeric'
					})}
				</time>
				{/* Author */}
				<AuthorCard
					name={release.author.displayName || ''}
					photoURL={release.author.photoURL || ''}
				/>
			</div>

			<div className="col-span-1 md:col-span-4 lg:col-span-6 flex flex-col md:flex-row gap-8">
				{/* Node circle */}
				<span className="border-2 border-fb-yellow-muted w-6 h-6 ml-[-13px] lg:mr-4 bg-fb-gray z-10 rounded-full flex-shrink-0" />

				{/* Article */}
				<div className="flex w-full items-start gap-4">
					<div className="relative flex-none w-[48px] h-[48px]">
						{release.image_url && (
							<Image
								src={release.image_url}
								alt=""
								layout="fill"
								objectFit="contain"
								className="flex-shrink-0"
							/>
						)}
					</div>

					<div>
						<h2 className="title text-xl text-white mb-4">{release.title}</h2>
						{/* Show only summary here */}
						{release.summary && <p>{release.summary}</p>}
					</div>
				</div>

				{/* CTA */}
				<Link href={`/releases/${release.id}`}>
					<a className="button button-outline self-end">Read more &rarr;</a>
				</Link>
			</div>
		</div>
	)
}
