import React from 'react'

import ReactMarkdown from 'react-markdown'

import Code from './Code'

export default function Markdown({ markdown }: { markdown: string }) {
	return (
		<div className="markdown">
			<ReactMarkdown
				components={{
					code: Code
				}}
			>
				{markdown}
			</ReactMarkdown>
		</div>
	)
}
