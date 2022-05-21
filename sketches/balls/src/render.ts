import {
	assign,
	defMain,
	input,
	Mat4Sym,
	mul,
	output,
	program,
	uniform,
	Vec3Sym,
	vec4,
	Vec4Sym,
} from '@thi.ng/shader-ast'
import { FormData, Painter } from 'tvs-painter'
import { fs, vs } from '../../shared/glsl/utils'

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

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const painter = new Painter(canvas)
const form = painter.createForm()

let aPos: Vec3Sym
let aNormal: Vec3Sym
let aColor: Vec3Sym
let uCamera: Mat4Sym
let vColor: Vec3Sym
let vNormal: Vec3Sym

const vert = vs(
	program([
		(aPos = input('vec3', 'position')),
		(aNormal = input('vec3', 'normal')),
		(aColor = input('vec3', 'color')),
		(uCamera = uniform('mat4', 'camera')),
		(vColor = output('vec3', 'vColor')),
		(vNormal = output('vec3', 'vNormal')),
		defMain(() => [
			assign(vs.gl_Position, mul(uCamera, vec4(aPos, 1.0))),
			assign(vColor, aColor),
			assign(vNormal, aNormal),
		]),
	]),
)

let fragColor: Vec4Sym
const frag = fs(
	program([
		(vColor = input('vec3', 'vColor')),
		(vNormal = input('vec3', 'vNormal')),
		(fragColor = output('vec4', 'color')),
		defMain(() => [assign(fragColor, vec4(vColor, 1.0))]),
	]),
)

const shade = painter.createShade().update({ vert, frag })
const sketch = painter.createSketch().update({
	form,
	shade,
})

export function renderInit(geometry: FormData) {
	form.update(geometry)
}

export function render(camera: Float32Array) {
	painter.draw({
		sketches: sketch,
		uniforms: { camera },
	})
}
