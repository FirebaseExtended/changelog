import type { ChangeEvent, ChangeEventHandler, FormEvent } from 'react'
import { useEffect, useState } from 'react'

import type { RecaptchaVerifier } from 'firebase/auth'
import { PhoneAuthProvider, PhoneMultiFactorGenerator, multiFactor } from 'firebase/auth'
import { useUser } from 'reactfire'

import { initRecaptcha } from '@lib/auth'
import { auth } from '@lib/firebase'

import { IconHashtag } from '@components/svg'

enum AuthState {
	PHONE_NUMBER_REQUESTED,
	VERIFICATION_CODE_REQUESTED,
	MFA_VERIFIED_FROM_EMAIL,
	ERROR
}

export default function EnrollMFA() {
	const { data: user } = useUser()

	const [phone, setPhone] = useState<string>('')

	const [errorMessage, setErrorMessage] = useState('')
	const [phoneVerificationCode, setPhoneVerificationCode] = useState('')
	const [phoneVerificationId, setPhoneVerificationId] = useState('')
	const [authState, setAuthState] = useState(AuthState.PHONE_NUMBER_REQUESTED)
	const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null)
	const [recaptchaWidgetId, setRecaptchaWidgetId] = useState<number>()

	useEffect(() => {
		if (!recaptchaVerifier) {
			setRecaptchaVerifier(initRecaptcha())
		} else if (recaptchaWidgetId === undefined) {
			recaptchaVerifier.render().then((widgetId) => {
				setRecaptchaWidgetId(widgetId)
			})
		}
	}, [recaptchaVerifier, recaptchaWidgetId])

	const onPhoneChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
		setPhone(ev?.target?.value)
	}

	const onPhoneSubmit = async (ev: ChangeEvent | FormEvent) => {
		ev.preventDefault()

		if (!user || !recaptchaVerifier) return

		const multiFactorSession = await multiFactor(user).getSession()

		// Specify the phone number and pass the MFA session.
		const phoneInfoOptions = {
			phoneNumber: phone,
			session: multiFactorSession
		}

		const phoneAuthProvider = new PhoneAuthProvider(auth)

		// Send SMS verification code.
		const verificationId = await phoneAuthProvider
			.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier)
			.catch((error) => {
				console.error(error)
				setErrorMessage(error.message)
				setAuthState(AuthState.ERROR)
			})

		if (verificationId) {
			setPhoneVerificationId(verificationId)
			setAuthState(AuthState.VERIFICATION_CODE_REQUESTED)
		}
	}

	const onPhoneVerificationSubmit = async (ev: ChangeEvent | FormEvent) => {
		ev.preventDefault()

		if (!user) return

		// Ask user for the verification code. Then:
		const cred = PhoneAuthProvider.credential(phoneVerificationId, phoneVerificationCode)
		const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred)

		// Complete enrollment.
		await multiFactor(user)
			.enroll(multiFactorAssertion)
			.then(() => {
				setAuthState(AuthState.MFA_VERIFIED_FROM_EMAIL)
			})
			.catch((error) => {
				console.error(error)
				setErrorMessage(error.message)
				setAuthState(AuthState.ERROR)
			})
	}

	const onPhoneVerificationChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
		setPhoneVerificationCode(ev?.target?.value)
	}

	switch (authState) {
		case AuthState.ERROR:
			return (
				<div>
					<div className="mb-4 text-red-400 bg-red-500/10 px-4 py-2 rounded-md">
						Error {errorMessage}
					</div>
					<button
						className="button button-primary"
						type="button"
						onClick={() => setAuthState(AuthState.PHONE_NUMBER_REQUESTED)}
					>
						Request phone again
					</button>
				</div>
			)
		case AuthState.PHONE_NUMBER_REQUESTED:
			return (
				<form onSubmit={onPhoneSubmit} className="flex items-end gap-3">
					<div>
						<label className="form-label">Enter Phone Number</label>
						<div className="form-control w-56">
							<input
								className="input"
								onChange={onPhoneChange}
								value={phone}
								type="tel"
								placeholder="+1 555 555 5555"
								required
							/>
						</div>
					</div>
					<button type="submit" className="button button-primary">
						Text me a code
					</button>
				</form>
			)
		case AuthState.VERIFICATION_CODE_REQUESTED:
			return (
				<form onSubmit={onPhoneVerificationSubmit} className="flex items-end gap-3">
					<div>
						<label className="form-label">Phone Verification Code</label>
						<div className="form-control w-56">
							<input
								className="input pl-9"
								onChange={onPhoneVerificationChange}
								value={phoneVerificationCode}
								placeholder="- - - - - -"
								autoComplete="one-time-code"
								required
							/>
							<IconHashtag />
						</div>
					</div>
					<button type="submit" className="button button-primary">
						Verify code
					</button>
				</form>
			)
		case AuthState.MFA_VERIFIED_FROM_EMAIL:
			return (
				<div className="bg-green-500/10 text-green-400 px-4 py-2 rounded-md">
					You are fully logged in with multi-factor authentication!
				</div>
			)

		default:
			return null
	}
}
