import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				{/* Google Sans */}
				<link
					href="https://fonts.googleapis.com/css2?family=Google+Sans&display=swap"
					rel="stylesheet"
				/>

				{/* Google Sans Mono */}
				<link
					href="https://fonts.googleapis.com/css2?family=Google+Sans+Mono:wght@400;600;700&display=swap"
					rel="stylesheet"
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	)
}
