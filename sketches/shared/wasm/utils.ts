import { FormData, FormStoreType } from 'tvs-painter'

interface WasmVertexLayout {
	name: string
	attr_type: number
	normalized: boolean
	offset: number
	size: number
}

interface WasmGeometry {
	buffer: Uint8Array
	indices?: Uint8Array
	vertex_size: number
	vertex_count: number
	rendering_primitive: number
	vertex_layout: WasmVertexLayout[]
}

export function wasmGeometryToFormData(
	geom: WasmGeometry,
	storeType: FormStoreType = 'STATIC',
): FormData {
	return {
		elements: geom.indices
			? { buffer: new Uint32Array(geom.indices.buffer), storeType }
			: null,
		drawType: geom.rendering_primitive,
		itemCount: geom.vertex_count,
		customLayout: {
			data: { buffer: geom.buffer, storeType },
			layout: Object.fromEntries(
				geom.vertex_layout.map((l) => [
					l.name,
					{
						size: l.size,
						type: l.attr_type,
						normalize: l.normalized,
						stride: geom.vertex_size,
						offset: l.offset,
					},
				]),
			),
		},
	}
}
