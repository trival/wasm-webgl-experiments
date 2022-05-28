import {
	assign,
	defMain,
	input,
	Mat3Sym,
	Mat4Sym,
	mul,
	normalize,
	output,
	program,
	uniform,
	vec3,
	Vec3Sym,
	vec4,
	Vec4Sym,
} from '@thi.ng/shader-ast'
import { diffuseLighting, halfLambert } from '@thi.ng/shader-ast-stdlib'
import { FormData, FormStoreType, Painter } from 'tvs-painter'
import { makeClear } from 'tvs-painter/dist/utils/context'
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
	vertex_count: number
	vertex_layout: WasmVertexLayout[]
}

export function wasmGeometryToFormData(
	geom: WasmGeometry,
	storeType: FormStoreType = 'STATIC',
): FormData {
	return {
		elements: geom.indices
			? { buffer: new Uint32Array(geom.indices), storeType }
			: undefined,
		drawType: 'TRIANGLES',
		itemCount: geom.vertex_count,
		customLayout: {
			data: { buffer: new Uint8Array(geom.buffer), storeType },
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
const { gl } = painter
const form = painter.createForm()

painter.updateDrawSettings({
	enable: [gl.DEPTH_TEST, gl.CULL_FACE],
	clearBits: makeClear(gl, 'depth', 'color'),
	cullFace: gl.BACK,
})

let aPos: Vec3Sym
let aNormal: Vec3Sym
let aColor: Vec3Sym
let uCamera: Mat4Sym
let uNormalMat: Mat3Sym
let vColor: Vec3Sym
let vNormal: Vec3Sym

const vert = vs(
	program([
		(aPos = input('vec3', 'position')),
		(aNormal = input('vec3', 'normal')),
		(aColor = input('vec3', 'color')),
		//
		(uCamera = uniform('mat4', 'camera')),
		(uNormalMat = uniform('mat3', 'normalMatrix')),
		//
		(vColor = output('vec3', 'vColor')),
		(vNormal = output('vec3', 'vNormal')),
		//
		defMain(() => [
			assign(vs.gl_Position, mul(uCamera, vec4(aPos, 1.0))),
			assign(vColor, aColor),
			assign(vNormal, mul(uNormalMat, aNormal)),
		]),
	]),
)

let fragColor: Vec4Sym
let uLight: Vec3Sym

const frag = fs(
	program([
		(vColor = input('vec3', 'vColor')),
		(vNormal = input('vec3', 'vNormal')),
		(uLight = uniform('vec3', 'light')),
		//
		(fragColor = output('vec4', 'color')),
		//
		defMain(() => [
			assign(
				fragColor,
				vec4(
					diffuseLighting(
						halfLambert(normalize(vNormal), uLight),
						vColor,
						vec3(1, 1, 0.6),
						vec3(0.1, 0.1, 0),
					),
					1.0,
				),
			),
		]),
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

export function render(
	camera: Float32Array,
	normalMatrix: Float32Array,
	light: Float32Array,
) {
	painter.draw({
		sketches: sketch,
		uniforms: { camera, light, normalMatrix },
	})
}
