import type { Feature } from '@lib/types'

export default function FeaturesList({ features }: { features: Feature[] }) {
	return (
		<div className="mb-10">
			<h3 className="mb-2">Features</h3>

			<ul className="list-disc ml-4">
				{features.map((feature) => (
					<li className="text-white" key={feature.id}>
						{feature.feature}
					</li>
				))}
			</ul>
		</div>
	)
}
