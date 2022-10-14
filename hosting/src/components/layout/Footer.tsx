import { useState } from 'react'

import Link from 'next/link'

import FirebaseLogo from './FirebaseLogo'

export default function Footer() {
	const [helloSparky, setHelloSparky] = useState(false)

	const showHelloSparky = () => {
		setHelloSparky(true)
		setTimeout(() => {
			setHelloSparky(false)
		}, 2700)
	}

	return (
		<footer className={`footer ${helloSparky ? 'hello-sparky' : ''}`}>
			<div className="relative container flex flex-col md:flex-row gap-4 justify-between items-center">
				<div
					className="cursor-pointer hover:bg-fb-gray-light/10 rounded-full transition-colors px-6 py-2"
					onClick={showHelloSparky}
					aria-hidden="true"
				>
					<FirebaseLogo className="w-32" />
				</div>

				<small>&copy; 2022 Google Inc. All rights reserved.</small>

				<div className="flex space-x-4">
					<Link href="/">
						<a className="py-2">Changelog</a>
					</Link>
				</div>
				<div className="sparky" />
			</div>
		</footer>
	)
}
