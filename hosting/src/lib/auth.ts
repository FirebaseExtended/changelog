import {
	PhoneAuthProvider,
	PhoneMultiFactorGenerator,
	RecaptchaVerifier,
	getMultiFactorResolver,
	isSignInWithEmailLink,
	multiFactor,
	sendSignInLinkToEmail,
	signInWithEmailLink,
	signOut
} from 'firebase/auth'
import type {
	MultiFactorError,
	MultiFactorInfo,
	MultiFactorResolver,
	User,
	UserCredential
} from 'firebase/auth'

import { auth } from './firebase'

export function isLoggedIn() {
	return isSignInWithEmailLink(auth, window.location.href)
}

export function getMultiFactorResolverFromSignInAttempt(error: MultiFactorError) {
	return getMultiFactorResolver(auth, error)
}

export async function signInLinkLogin(email: string): Promise<UserCredential | undefined> {
	if (!email || typeof window === 'undefined') {
		return undefined
	}

	return signInWithEmailLink(auth, email, window.location.href)
}

export async function login(email: string) {
	if (isSignInWithEmailLink(auth, window.location.href)) {
		return signInLinkLogin(email)
	}

	const actionCodeSettings = {
		url: `${window.location.origin}/sign-in`,
		handleCodeInApp: true
	}

	await sendSignInLinkToEmail(auth, email, actionCodeSettings).catch((err) => {
		// TODO - handle
		console.error(err)
	})

	window.localStorage.setItem('emailForSignIn', email)

	return true
}

export function initRecaptcha() {
	return new RecaptchaVerifier(
		'recaptcha-container-id',
		{
			size: 'invisible'
		},
		auth
	)
}

export async function enrollSecondFactor(
	user: User,
	phoneNumber: string,
	recaptchaVerifier: RecaptchaVerifier | null
): Promise<string | undefined> {
	if (!(user && phoneNumber && recaptchaVerifier)) {
		return undefined
	}

	const session = await multiFactor(user).getSession()
	const phoneInfoOptions = {
		phoneNumber,
		session
	}

	const phoneAuthProvider = new PhoneAuthProvider(auth)

	return phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier)
}

export async function signInToSecondFactor(
	recaptchaVerifier: RecaptchaVerifier | null,
	multiFactorResolver: MultiFactorResolver,
	multiFactorHint: MultiFactorInfo
) {
	if (!(recaptchaVerifier && multiFactorResolver && multiFactorHint)) {
		return undefined
	}

	const { session } = multiFactorResolver
	const phoneInfoOptions = {
		multiFactorHint,
		session
	}

	const phoneAuthProvider = new PhoneAuthProvider(auth)

	return phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier)
}

export async function submitVerificationCode(
	multiFactorResolver: MultiFactorResolver,
	verificationCode: string,
	verificationId: string
) {
	const cred = PhoneAuthProvider.credential(verificationId, verificationCode)
	const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred)

	// Complete enrollment.
	return multiFactorResolver.resolveSignIn(multiFactorAssertion)
}

export async function logout() {
	return signOut(auth)
}
