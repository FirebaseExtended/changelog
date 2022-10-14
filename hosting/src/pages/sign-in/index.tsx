import Head from 'next/head'

import SignInLayout from '@layouts/SignInLayout'
import { useSigninCheck } from 'reactfire'

import LoginHandler from '@components/auth/LoginHandler'

export default function SignIn() {
	const { status } = useSigninCheck()

	if (status === 'loading') {
		return <p>Loading...</p>
	}

	return (
		<>
			<Head>
				<title>Sign In | Firebase Changelog</title>
			</Head>
			<p className="text-xl max-w-[490px]">
				Sign in with your email. <br />
				We&apos;ll send you a magic link.
			</p>

			{/* Auth module */}
			<div className="w-[490px]">
				<LoginHandler />
				<div id="recaptcha-container-id" />
			</div>
		</>
	)
}

SignIn.Layout = SignInLayout
