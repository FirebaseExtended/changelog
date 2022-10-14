import type { ReactNode } from 'react'

import Footer from '@components/layout/Footer'
import Header from '@components/layout/Header'

type Props = {
	children: ReactNode
}

export default function MainLayout({ children }: Props) {
	return (
		<div className="relative">
			<Header />

			{children}

			<Footer />
		</div>
	)
}
