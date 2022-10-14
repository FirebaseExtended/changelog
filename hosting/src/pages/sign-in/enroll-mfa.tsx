import { useEffect } from 'react'

import { useRouter } from 'next/router'

import SignInLayout from '@layouts/SignInLayout'
import { useSigninCheck } from 'reactfire'

import EnrollMFA from '@components/auth/EnrollMFA'

export default function EnrollMFAPage() {
	const { status, data: signInCheckResult } = useSigninCheck()
	const router = useRouter()

	useEffect(() => {
		if (signInCheckResult?.signedIn === false) {
			router.push('/sign-in')
		}
	}, [router, signInCheckResult])

	if (status === 'loading' || signInCheckResult?.signedIn === false) {
		return null
	}

	return (
		<>
			<p className="text-xl max-w-[380px]">
				Please verify your phone number to proceed with the authentication process.
			</p>

			{/* Auth module */}
			<EnrollMFA />
			<div id="recaptcha-container-id" />
		</>
	)
}

EnrollMFAPage.Layout = SignInLayout
