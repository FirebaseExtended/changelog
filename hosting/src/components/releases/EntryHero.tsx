import Link from 'next/link'

import { useSigninCheck } from 'reactfire'

import type { Release } from '@lib/types'

import AuthorCard from './AuthorCard'
import ReleaseActions from './ReleaseActions'

type Props = {
	release?: Release
	mode?: 'view' | 'create' | 'edit'
	isLoading?: boolean
}

export default function EntryHero({ release, mode = 'view', isLoading }: Props) {
	const { data: signinCheckResult } = useSigninCheck()

	return (
		<header className="relative text-fb-gray pt-48 pb-32">
			<div className="container flex flex-col lg:flex-row justify-between items-start">
				{/* Left side */}
				<div className="flex flex-col items-start">
					{/* Back button */}
					<Link href="/">
						<a className="button button-outline button-inverted mb-16">&larr; All releases</a>
					</Link>

					{/* Title */}
					<h1 className="title text-fb-gray text-3xl md:text-5xl max-w-[600px]">
						{mode === 'create' ? 'New Release' : release?.title}
					</h1>
				</div>
				{mode !== 'create' && (
					<div>
						<p className="title text-2xl mb-2">{release?.version}</p>

						{/* Publish date */}
						<time className="text-[#90814C] block mb-4">
							{new Date((release?.timestamp as number) || new Date()).toLocaleDateString(
								undefined,
								{
									month: 'long',
									day: 'numeric',
									year: 'numeric'
								}
							)}
						</time>

						<AuthorCard
							name={release?.author?.displayName || ''}
							photoURL={release?.author?.photoURL || ''}
						/>
					</div>
				)}
			</div>

			{signinCheckResult?.signedIn && (
				<ReleaseActions release={release} mode={mode} isLoading={isLoading} />
			)}

			<div className="entry-hero-bg" />
		</header>
	)
}
