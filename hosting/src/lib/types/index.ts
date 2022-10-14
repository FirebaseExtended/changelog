import type { User } from 'firebase/auth'
import type { Timestamp } from 'firebase/firestore'

export type Releases = Release[]
export type Release = {
	id: string
	body: string
	image_url: string | null
	title: string
	timestamp: number
	version: string
	summary: string
	author: Author
	features: string
}

export type Feature = {
	id: string
	feature: string
}

export type ReleaseFromFirestore = Omit<Release, 'timestamp'> & { timestamp: Timestamp }

export type Author = Pick<User, 'displayName' | 'photoURL' | 'uid'>
