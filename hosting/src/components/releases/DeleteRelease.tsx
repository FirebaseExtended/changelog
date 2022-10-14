import { useRouter } from 'next/router'

import { deleteRelease } from '@lib/releases'
import type { Release } from '@lib/types'

export default function DeleteRelease({ releaseId }: { releaseId: Release['id'] }) {
	const router = useRouter()

	const handleDelete = async () => {
		await deleteRelease(releaseId)
		router.push('/')
	}

	return (
		<button
			className="button text-red-400 hover:bg-red-500/10"
			type="button"
			onClick={() => handleDelete()}
			aria-label="Delete release"
		>
			<svg
				fill="none"
				shape-rendering="geometricPrecision"
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				viewBox="0 0 24 24"
				className="w-5"
			>
				<path d="M3 6h18" />
				<path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
				<path d="M10 11v6" />
				<path d="M14 11v6" />
			</svg>
		</button>
	)
}
