import type { NextPage } from 'next'
import type { AppProps } from 'next/app'

import MainLayout from '@layouts/MainLayout'

import { withFirebaseProvider } from '@components/ReactFireProviders'

import '@styles/globals.scss'

export type NextPageWithLayout<P = Record<string, never>, IP = P> = NextPage<P, IP> & {
	Layout?: ({ children }: { children: JSX.Element }) => JSX.Element
}

type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout
}

function DemoApp({ Component, pageProps }: AppPropsWithLayout) {
	const Layout = Component.Layout || MainLayout

	return (
		<Layout>
			<Component {...pageProps} />
		</Layout>
	)
}

export default withFirebaseProvider(DemoApp)
