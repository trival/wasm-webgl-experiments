import { FormData, Painter } from 'tvs-painter'

interface WasmVertexLayout {
	name: string
	attr_type: number
	normalized: boolean
	offset: number
	size: number
}
interface WasmGeometry {
	buffer: number[]
	indices?: number[]
	vertex_size: number
	vertex_layout: WasmVertexLayout[]
}

export function wasmGeometryToFormData(geom: WasmGeometry): FormData {
	return {
		elements: geom.indices ? new Uint32Array(geom.indices) : undefined,
		drawType: 'TRIANGLES',
		itemCount: geom.buffer.length / geom.vertex_size,
		customLayout: {
			data: new Uint8Array(geom.buffer),
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

export function render(geometry: FormData, camera: Float32Array) {
	const canvas = document.getElementById('canvas') as HTMLCanvasElement
	const painter = new Painter(canvas)
	const form = painter.createForm().update(geometry)
	const vert = /*glsl*/ `
	attribute vec3 position;
	attribute vec3 normal;
	attribute vec3 color;

	uniform mat4 camera;

	varying vec3 vColor;

	void main() {
		gl_Position = camera * vec4(position, 1.0);
		vColor = color;
	}
	`
	const frag = /*glsl*/ `
	precision highp float;
	varying vec3 vColor;
	void main() {
		gl_FragColor = vec4(vColor, 1.0);
	}
	`
	const shade = painter.createShade().update({ vert, frag })
	const sketch = painter.createSketch().update({
		form,
		shade,
		uniforms: { camera },
	})
	painter.draw({ sketches: sketch })
}
