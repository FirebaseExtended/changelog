import Image from 'next/image'

export default function AuthorCard({ name, photoURL }: { name: string; photoURL: string }) {
	return (
		<div className="author-card">
			{/* Photo */}
			{photoURL ? (
				<img src={photoURL} width={48} height={48} className="rounded-full" />
			) : (
				<div className="w-[48px] h-[48px] bg-white/10 rounded-full flex items-center justify-center">
					<svg
						fill="none"
						height="24"
						shapeRendering="geometricPrecision"
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="1.5"
						viewBox="0 0 24 24"
						width="24"
					>
						<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
						<circle cx="12" cy="7" r="4" />
					</svg>
				</div>
			)}
			<div className="flex flex-col truncate">
				{/* Name */}
				<span className="author-name">{name || 'Firebase User'}</span>

				{/* Title */}
				<span className="author-title">Firebase at Google</span>
			</div>
		</div>
	)
}
