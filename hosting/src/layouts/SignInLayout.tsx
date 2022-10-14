import type { ReactNode } from 'react'

import Header from '@components/layout/Header'

type Props = {
	children: ReactNode
}

export default function SignInLayout({ children }: Props) {
	return (
		<>
			{/* Nav doesn't affect layout */}
			<Header navItemsTextColor="text-white" />

			{/* Content */}
			<div className="container flex h-screen z-10 relative pt-40 pb-24">
				{/* Left side */}
				<header className="w-1/2">
					<h1 className="title text-5xl text-fb-gray">Sign in</h1>
				</header>

				{/* Right side & footer */}
				<div className="w-1/2 text-white flex flex-col justify-between items-end h-full">
					{children}
					<footer className="text-fb-gray-light">
						<small>&copy; 2022 Google Inc. All rights reserved.</small>
					</footer>
				</div>
			</div>

			{/* Decorative BG */}
			<div className="slant-hero" />
		</>
	)
}
