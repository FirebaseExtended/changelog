import { logout } from '@lib/auth'

type Props = {
	className?: string
}

export default function SignOut({ className }: Props) {
	const onSignoutClick = async () => {
		await logout()
	}

	return (
		<button type="button" className={className} onClick={onSignoutClick}>
			<span>Sign out</span>
		</button>
	)
}
