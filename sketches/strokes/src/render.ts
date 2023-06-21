import { assign, defMain, div, mul, vec2, vec4 } from '@thi.ng/shader-ast'
import { fit0111 } from '@thi.ng/shader-ast-stdlib'
import { FormData } from 'tvs-painter'
import { makeClear } from 'tvs-painter/dist/utils/context'
import { defShader } from '../../shared/glsl/utils'
import { Q } from './context'

Q.painter.updateDrawSettings({
	enable: [Q.gl.CULL_FACE],
	clearBits: makeClear(Q.gl, 'color'),
	cullFace: Q.gl.BACK,
})

const shader = defShader({
	attribs: {
		position: 'vec2',
		uv: 'vec2',
	},
	varying: {
		vUv: 'vec2',
	},
	uniforms: {
		size: 'vec2',
	},
	vs: (gl, uniforms, inp, out) => [
		defMain(() => [
			assign(out.vUv, inp.uv),
			assign(
				gl.gl_Position,
				vec4(mul(fit0111(div(inp.position, uniforms.size)), vec2(1, -1)), 0, 1),
			),
		]),
	],
	fs: (gl, uniforms, inp, out) => [
		defMain(() => [assign(out.fragColor, vec4(inp.vUv, 0, 1))]),
	],
})

const form = Q.getForm('line')
const shade = Q.getShade('line').update(shader)
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
