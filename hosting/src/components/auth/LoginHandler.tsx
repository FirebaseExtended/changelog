import type { ChangeEvent, ChangeEventHandler, FormEvent } from 'react'
import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import type { MultiFactorInfo, MultiFactorResolver } from 'firebase/auth'

import {
	getMultiFactorResolverFromSignInAttempt,
	initRecaptcha,
	isLoggedIn,
	login,
	signInLinkLogin,
	signInToSecondFactor,
	submitVerificationCode
} from '@lib/auth'

import { IconArrowRight, IconCheck, IconEmail, IconHashtag } from '@components/svg'

enum AuthState {
	UNKNOWN,
	UNAUTHENTICATED,
	UNAUTHENTICATED_EMAIL_LINK_SENT,
	UNVERIFIED_FROM_EMAIL_LINK,
	VERIFIED_FROM_EMAIL_LINK,
	MULTIFACTOR_RESOLUTION_REQUESTED,
	PHONE_VERIFICATION_REQUESTED,
	RECAPTCHA_VERIFICATION_REQUESTED,
	MFA_VERIFIED_FROM_EMAIL,
	ERROR
}

export default function LoginHandler() {
	const router = useRouter()

	const [errorMessage, setErrorMessage] = useState('')
	const [phoneVerificationCode, setPhoneVerificationCode] = useState('')
	const [phoneVerificationId, setPhoneVerificationId] = useState('')
	const [multiFactorResolver, setMultiFactorResolver] = useState<MultiFactorResolver | undefined>(
		undefined
	)

	const [email, setEmail] = useState('')
	const [authState, setAuthState] = useState(AuthState.UNKNOWN)

	useEffect(() => {
		const initialEmail = window.localStorage.getItem('emailForSignIn')

		// InitialEmail is set, which indicates user entered an email from a previous session
		// isLogged is true, which indicates user came from an email link
		if (isLoggedIn() && initialEmail) {
			setEmail(initialEmail)

			setAuthState(AuthState.UNVERIFIED_FROM_EMAIL_LINK)

			// Auto-Init the Login for the user with their previous email
			onSignInWithEmailLink(initialEmail)
			return
		}

		setAuthState(AuthState.UNAUTHENTICATED)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const onSignInWithEmailLink = async (signInEmail: string) => {
		signInLinkLogin(signInEmail)
			.then((results) => {
				console.log('results', results)
				router.push('/sign-in/enroll-mfa')
				return null
			})
			.catch((err) => {
				// console.log('err', err)
				if (err.code === 'auth/multi-factor-auth-required') {
					// Second factor challenge is required.
					const mfaResolver = getMultiFactorResolverFromSignInAttempt(err)
					setMultiFactorResolver(mfaResolver)

					// Default to phone verification
					sendVerificationCode(mfaResolver, mfaResolver.hints[0])

					return
				}

				setErrorMessage(err.message)
				setAuthState(AuthState.ERROR)
				window.localStorage.removeItem('emailForSignIn')
			})
	}

	const onSignInClick = async (ev: ChangeEvent | FormEvent) => {
		ev.preventDefault()
		if (!email) return undefined

		if ([AuthState.UNAUTHENTICATED, AuthState.ERROR].includes(authState)) {
			// remove query params to enable re-requesting email link, helpful for development
			router.replace('/sign-in', undefined, { shallow: true })

			// Move to the next state
			setAuthState(AuthState.UNAUTHENTICATED_EMAIL_LINK_SENT)

			return login(email).catch((err) => {
				console.log(err)
			})
		}

		return onSignInWithEmailLink(email)
	}

	const sendVerificationCode = async (
		mfaResolver: MultiFactorResolver,
		mfaHint: MultiFactorInfo
	) => {
		if (!mfaHint || !mfaResolver) return

		const recaptchaVerifier = initRecaptcha()

		const verificationId = await signInToSecondFactor(
			recaptchaVerifier,
			mfaResolver,
			mfaHint
		).catch((err) => {
			console.error(err)
			setErrorMessage(err.message)
		})

		if (verificationId) {
			setPhoneVerificationId(verificationId)
			setAuthState(AuthState.PHONE_VERIFICATION_REQUESTED)
			recaptchaVerifier.clear()
		}
	}

	const onPhoneVerificationSubmit = async (ev: ChangeEvent | FormEvent) => {
		ev.preventDefault()

		if (phoneVerificationCode && phoneVerificationId && multiFactorResolver) {
			submitVerificationCode(multiFactorResolver, phoneVerificationCode, phoneVerificationId)
				.then(() => {
					setAuthState(AuthState.MFA_VERIFIED_FROM_EMAIL)

					// MFA verified, redirect to home
					router.push('/')
				})
				.catch((err) => {
					console.error('[submitVerificationCode]: ', err)
					setErrorMessage('This code is invalid')
				})
		}
	}

	const onEmailChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
		setEmail(ev?.target?.value)
	}

	const onPhoneVerificationChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
		setPhoneVerificationCode(ev?.target?.value)
	}

	const resetSignIn = () => {
		setAuthState(AuthState.UNAUTHENTICATED)
		setErrorMessage('')
		setEmail('')
		router.push('/sign-in')
	}

	const EmailForm = (
		<form onSubmit={onSignInClick} className="flex items-end gap-4">
			{/* Email field + label */}
			<div className="flex-1">
				<label htmlFor="email" className="form-label min-w-[150px]">
					Email
				</label>
				<div className="form-control relative">
					<input
						id="email"
						name="email"
						className="input pl-9"
						onChange={onEmailChange}
						value={email}
						type="email"
						disabled={authState === AuthState.UNAUTHENTICATED_EMAIL_LINK_SENT}
						placeholder="sample@google.com"
						required
					/>
					<IconEmail />
				</div>
			</div>

			{/* Submit */}
			{authState === AuthState.UNAUTHENTICATED_EMAIL_LINK_SENT ? (
				<button type="submit" className="button button-outline" disabled>
					<IconCheck />
					<span className="self-center ml-2">Email sent</span>
				</button>
			) : (
				<button type="submit" className="button button-primary">
					<span className="self-center mr-2">Email link</span>
					<IconArrowRight />
				</button>
			)}
		</form>
	)

	switch (authState) {
		case AuthState.ERROR:
			return (
				<div className="flex space-x-2">
					<span>We could not sign you in.</span>
					<button className="text-fb-yellow" type="button" onClick={resetSignIn}>
						Try again
					</button>
				</div>
			)

		// case AuthState.UNAUTHENTICATED_EMAIL_LINK_SENT:
		// 	return (
		// 		<>
		// 			{EmailForm}
		// 			<div>Check your email to complete registration.</div>
		// 		</>
		// 	)

		case AuthState.UNVERIFIED_FROM_EMAIL_LINK:
			return <p className="text-center">Verifying link &hellip;</p>

		// INFO: STEP SKIPPED
		// case AuthState.VERIFIED_FROM_EMAIL_LINK:

		// INFO: STEP SKIPPED; WE'RE CHOOSING "PHONE" AS THE DEFAULT
		// case AuthState.MULTIFACTOR_RESOLUTION_REQUESTED:

		// Verify code sent to phone
		case AuthState.PHONE_VERIFICATION_REQUESTED:
			return (
				<div>
					<form onSubmit={onPhoneVerificationSubmit}>
						{errorMessage ? (
							<label className="text-red-400" htmlFor="code">
								{errorMessage}
							</label>
						) : (
							<label htmlFor="code" className="form-label">
								Phone Verification Code
							</label>
						)}

						<div className="flex gap-4 flex-1">
							<div className="form-control flex-1">
								<input
									id="code"
									name="code"
									className="input pl-9"
									onChange={onPhoneVerificationChange}
									value={phoneVerificationCode}
									autoComplete="one-time-code"
									placeholder="- - - - - -"
									required
								/>
								<IconHashtag />
							</div>

							<button type="submit" className="button button-primary whitespace-nowrap flex">
								<span className="self-center pr-2">Sign in</span>
								<IconArrowRight />
							</button>
						</div>
					</form>
				</div>
			)

		// Enter email address to sign in
		// case AuthState.UNAUTHENTICATED:
		// 	return EmailForm

		// Logged in via Email and MFA verified
		case AuthState.MFA_VERIFIED_FROM_EMAIL:
			router.push('/')
			return null

		case AuthState.UNKNOWN:
		default:
			return EmailForm
	}
}
