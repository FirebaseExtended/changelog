import { useMemo, useState } from 'react'

import highlight from 'highlight.js'
import type { CodeComponent } from 'react-markdown/lib/ast-to-react'

// eslint-disable-next-line react/function-component-definition
const Code: CodeComponent = ({ className, children }) => {
	const [copied, setCopied] = useState(false)

	const { html, code } = useMemo(() => {
		const match = /language-(\w+)/.exec(className || '')
		const lang = match?.[1]

		if (lang && highlight.getLanguage(lang)) {
			try {
				const data = highlight.highlight(children.toString(), {
					language: lang,
					ignoreIllegals: true
				})
				return {
					html: data.value || '',
					code: data.code || ''
				}
			} catch (_) {
				// This is no longer an empty block statement :)
			}
		}
		return {
			html: '',
			code: ''
		}
	}, [children, className])

	return (
		<>
			<div
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{
					__html: html
				}}
			/>
			<button
				type="button"
				className="button"
				onClick={() => {
					navigator.clipboard.writeText(code)
					setCopied(true)
				}}
			>
				{copied ? 'Copied' : 'Copy'}
			</button>
		</>
	) // use external default escaping
}

export default Code
