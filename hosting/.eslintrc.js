module.exports = {
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'import'],
	settings: {
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts', '.tsx']
		},
		'import/resolver': {
			typescript: {
				alwaysTryTypes: true,
				project: ['./tsconfig.json']
			},
			node: {
				extensions: ['.ts', '.tsx']
			}
		}
	},
	extends: [
		'airbnb',
		'airbnb/hooks',
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:import/typescript',
		'next',
		'next/core-web-vitals',
		'prettier'
	],
	rules: {
		indent: 'off',
		'no-use-before-define': 'off',
		'no-else-return': [
			'error',
			{
				allowElseIf: true
			}
		],
		'import/extensions': 'off',
		'@typescript-eslint/ban-ts-comment': 'off',
		'react/jsx-filename-extension': [
			1,
			{
				extensions: ['.tsx']
			}
		],
		'react/jsx-props-no-spreading': 'off',
		'jsx-a11y/anchor-is-valid': 'off',
		'jsx-a11y/label-has-associated-control': 'off',
		'@typescript-eslint/consistent-type-imports': 'error',
		'no-shadow': 'off',
		'@typescript-eslint/no-shadow': ['error'],
		'react/require-default-props': 'off'
	}
}
