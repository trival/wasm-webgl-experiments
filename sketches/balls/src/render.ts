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
	float,
} from '@thi.ng/shader-ast'
import { diffuseLighting, halfLambert } from '@thi.ng/shader-ast-stdlib'
import { FormData } from 'tvs-painter'
import { makeClear } from 'tvs-painter/dist/utils/context'
import { fs, vs } from '../../shared/glsl/utils'
import { Q } from './context'

Q.painter.updateDrawSettings({
	enable: [Q.gl.DEPTH_TEST, Q.gl.CULL_FACE],
	clearBits: makeClear(Q.gl, 'depth', 'color'),
	cullFace: Q.gl.BACK,
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
			assign(vs.gl_PointSize, float(2)),
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
						vec3(1, 1, 1),
						vec3(0.1, 0.1, 0.1),
					),
					1.0,
				),
			),
		]),
	]),
)

const form = Q.getForm('ball')
const shade = Q.getShade('ball').update({ vert, frag })
const sketch = Q.getSketch('ball').update({
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
	Q.painter.draw({
		sketches: sketch,
		uniforms: { camera, light, normalMatrix },
	})
}
