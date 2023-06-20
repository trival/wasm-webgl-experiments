import {
	assign,
	defMain,
	div,
	input,
	output,
	program,
	uniform,
	Vec2Sym,
	vec4,
	Vec4Sym,
} from '@thi.ng/shader-ast'
import { FormData } from 'tvs-painter'
import { makeClear } from 'tvs-painter/dist/utils/context'
import { fs, vs } from '../../shared/glsl/utils'
import { Q } from './context'

Q.painter.updateDrawSettings({
	// enable: [Q.gl.DEPTH_TEST, Q.gl.CULL_FACE],
	clearBits: makeClear(Q.gl, 'depth', 'color'),
	// cullFace: Q.gl.BACK,
})

let aPos: Vec2Sym
// let aWidth: FloatSym
// let aLength: FloatSym
let aUv: Vec2Sym
// let aLocalUv: Vec2Sym
let uSize: Vec2Sym
let vUv: Vec2Sym

const vert = vs(
	program([
		(aPos = input('vec2', 'position')),
		(aUv = input('vec2', 'uv')),
		//
		(uSize = uniform('vec2', 'size')),
		//
		(vUv = output('vec2', 'vUv')),
		//
		defMain(() => [
			assign(vs.gl_Position, vec4(div(aPos, uSize), 0.0, 1.0)),
			assign(vUv, aUv),
		]),
	]),
)

let fragColor: Vec4Sym

const frag = fs(
	program([
		(vUv = input('vec2', 'vUv')),
		//
		(fragColor = output('vec4', 'color')),
		//
		defMain(() => [assign(fragColor, vec4(vUv, 0.0, 1.0))]),
	]),
)

const form = Q.getForm('line')
const shade = Q.getShade('line').update({ vert, frag })
const sketch = Q.getSketch('line').update({
	form,
	shade,
})

export function render(geometry: FormData) {
	form.update(geometry)
	Q.painter.draw({
		sketches: sketch,
		uniforms: {
			size: [Q.gl.drawingBufferWidth, Q.gl.drawingBufferHeight],
		},
	})
}
