/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx}',
		'./src/components/**/*.{js,ts,jsx,tsx}',
		'./src/layouts/**/*.{js,ts,jsx,tsx}',
		'./hosting/src/pages/**/*.{js,ts,jsx,tsx}',
		'./hosting/src/components/**/*.{js,ts,jsx,tsx}',
		'./hosting/src/layouts/**/*.{js,ts,jsx,tsx}'
	],
	theme: {
		container: {
			center: true,
			padding: '3rem'
		},
		screens: {
			sm: '640px',
			// => @media (min-width: 640px) { ... }

			md: '768px',
			// => @media (min-width: 768px) { ... }

			lg: '1024px',
			// => @media (min-width: 1024px) { ... }

			xl: '1280px'
			// => @media (min-width: 1280px) { ... }

			// '2xl': '1536px'
			// => @media (min-width: 1536px) { ... }
			// Remove classes
		},
		extend: {
			fontFamily: {
				mono: ['Google Sans Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
				sans: ['Google Sans', 'Roboto', 'sans-serif']
			},
			colors: {
				'fb-yellow': '#FFCA28',
				'fb-yellow-muted': '#FFDB5D',
				'fb-gray': '#202124',
				'fb-gray-light': '#747780'
			}
		}
	},
	plugins: []
}
