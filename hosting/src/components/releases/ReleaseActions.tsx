import Link from 'next/link'

import { useUser } from 'reactfire'

import { RELEASE_FORM_ID } from '@lib/releases'
import type { Release } from '@lib/types'

import DeleteRelease from './DeleteRelease'

type Props = {
	release?: Release
	mode?: 'view' | 'create' | 'edit'
	isLoading?: boolean
}

export default function ReleaseActions({ release, mode = 'view', isLoading }: Props) {
	const { data: user } = useUser()

	if (!user) return null

	const currentUserIsAuthor = user.uid === release?.author.uid

	return (
		<div className="container flex items-start lg:-bottom-[150px] mt-24 -mb-[150px]">
			{/* Actions */}
			<div className="flex bg-fb-gray border border-white/10 rounded-full relative z-20 p-2 gap-2">
				{['edit', 'create'].includes(mode) && (
					<>
						<Link href={mode === 'create' ? '/' : `/releases/${release?.id}/`}>
							<a className="button button-transparent">Cancel</a>
						</Link>

						<button
							form={RELEASE_FORM_ID}
							type="submit"
							className="button button-primary border-blue-400 bg-blue-500 text-white"
							disabled={isLoading}
						>
							{isLoading ? 'Publishing...' : 'Publish'}
						</button>
					</>
				)}

				{mode === 'view' && currentUserIsAuthor && (
					<>
						<Link href={`/releases/${release?.id}/edit`}>
							<a className="button button-primary border-blue-400 bg-blue-500 text-white">Edit</a>
						</Link>

						<DeleteRelease releaseId={release.id} />
					</>
				)}
			</div>
		</div>
	)
}
