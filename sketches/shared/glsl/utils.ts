import { Func, Sym } from '@thi.ng/shader-ast'
import { Type } from '@thi.ng/shader-ast/api/types'
import { GLSLTarget, GLSLVersion } from '@thi.ng/shader-ast-glsl'
import {
	AttribType,
	DefShaderOpts,
	GLSLDeclPrefixes,
} from '@thi.ng/webgl/api/shader'
import { shaderSourceFromAST } from '@thi.ng/webgl/shader'

export interface ShaderSpec<
	Attrs extends Record<string, AttribType>,
	Uniforms extends Record<string, Type> = Record<string, never>,
	Varying extends Record<string, Type> = Record<string, never>,
	Output extends Record<string, Type> = {
		fragColor: 'vec4'
	},
> {
	/**
	 * Vertex shader GLSL source code.
	 */
	vs: (
		gl: GLSLTarget,
		uniforms: { [key in keyof Uniforms]: Sym<Uniforms[key]> },
		inp: { [key in keyof Attrs]: Sym<Attrs[key]> },
		out: { [key in keyof Varying]: Sym<Varying[key]> },
	) => (Sym<any> | Func<any>)[]
	/**
	 * Fragment shader GLSL source code.
	 */
	fs: (
		gl: GLSLTarget,
		uniforms: { [key in keyof Uniforms]: Sym<Uniforms[key]> },
		inp: { [key in keyof Varying]: Sym<Varying[key]> },
		out: { [key in keyof Output]: Sym<Output[key]> },
	) => (Sym<any> | Func<any>)[]
	/**
	 * Attribute type declarations.
	 */
	attribs: Attrs
	/**
	 * Varying type declarations.
	 */
	varying?: Varying
	/**
	 * Uniform type declarations with optional defaults.
	 */
	uniforms?: Uniforms
	/**
	 * WebGL2 only. Fragment shader output variable type declarations.
	 * Default: `{ fragColor: GLSL.vec4 }`
	 */
	outputs?: Output
	/**
	 * Flag to indicate code generation for attribs, varying, uniforms
	 * and outputs. Default: true.
	 */
	generateDecls?: boolean
	/**
	 * Variable naming convention variable prefixes for GLSL code gen.
	 *
	 * Defaults:
	 *
	 * - Attributes: `a_`
	 * - Varying: `v_`
	 * - Uniforms: `u_`
	 * - Outputs: `o_`
	 */
	declPrefixes?: Partial<GLSLDeclPrefixes>
	/**
	 * Optional prelude source, prepended before main shader code, the
	 * default prelude (unless disabled) and any other generated code.
	 */
	pre?: string
	/**
	 * Optional source code to be appended after main shader code.
	 */
	post?: string
	/**
	 * If true, disables default prelude. Default: false
	 */
	replacePrelude?: boolean
}

export const defShader = <
	Attrs extends Record<string, AttribType>,
	Uniforms extends Record<string, Type> = Record<string, never>,
	Varying extends Record<string, Type> = Record<string, never>,
	Output extends Record<string, Type> = {
		fragColor: 'vec4'
	},
>(
	spec: ShaderSpec<Attrs, Uniforms, Varying, Output>,
	opts?: Partial<DefShaderOpts>,
	version = GLSLVersion.GLES_300,
) => {
	const vert = shaderSourceFromAST(spec as any, 'vs', version, opts)
	const frag = shaderSourceFromAST(spec as any, 'fs', version, opts)
	return { vert, frag }
}
