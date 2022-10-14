module.exports = {
	...require('@monogram/prettier-config'),
	importOrder: [
		'^react$',
		'^next*',
		'<THIRD_PARTY_MODULES>',
		'^@lib/(.*)$',
		'^@components/(.*)$',
		'^@styles/(.*)$',
		'^[./]'
	],
	importOrderSeparation: true,
	importOrderSortSpecifiers: true
}
