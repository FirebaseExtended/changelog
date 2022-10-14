import Link from 'next/link'
import { useRouter } from 'next/router'

import { useSigninCheck, useUser } from 'reactfire'

import SignOut from '@components/auth/SignOut'

import FirebaseLogo from './FirebaseLogo'

type Props = {
	navItemsTextColor?: string
}
export default function Header({ navItemsTextColor }: Props) {
	const user = useUser()
	const { data: signInCheckResult } = useSigninCheck()

	const router = useRouter()
	const currentPath = router.pathname

	return (
		<nav className="navbar">
			<div className="container flex flex-col md:flex-row justify-between">
				{/* Logo */}
				<Link href="/">
					<a title="Firebase Changelog" className="mb-4 md:mb-0">
						<FirebaseLogo className="w-32" />
					</a>
				</Link>

				{/* Right side links */}
				<div className={`space-x-2 space-y-2 md:space-y-0 ${navItemsTextColor ?? ''}`}>
					<Link href="/">
						<a className={`nav-item ${currentPath === '/' ? 'nav-item-current' : ''}`}>
							<span>Changelog</span>
						</a>
					</Link>

					{signInCheckResult?.signedIn && (
						<Link href="/releases/new">
							<a
								className={`nav-item ${currentPath === '/releases/new' ? 'nav-item-current' : ''}`}
							>
								Add Release
							</a>
						</Link>
					)}

					{/* Authentication */}
					{signInCheckResult?.signedIn !== true ? (
						<Link href="/sign-in">
							<a className={`nav-item ${currentPath === '/sign-in' ? 'nav-item-current' : ''}`}>
								<span>Sign in</span>
							</a>
						</Link>
					) : (
						<div className="inline-block">
							<div className="ml-4 author-card bg-[#2C2E33]/10 text-fb-gray">
								{/* Title */}
								<div className="w-8 h-8 bg-[#2C2E33]/10 rounded-full flex items-center justify-center">
									<svg
										fill="none"
										shapeRendering="geometricPrecision"
										stroke="currentColor"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="1.5"
										viewBox="0 0 24 24"
										className="w-4 h-4"
									>
										<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
										<circle cx="12" cy="7" r="4" />
									</svg>
								</div>
								{/* Title */}
								<span className="author-name">{user.data?.email}</span>
								<span className="opacity-30">|</span>
								<SignOut className="cursor-pointer" />
							</div>
						</div>
					)}
				</div>
			</div>
		</nav>
	)
}
