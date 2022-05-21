import { GLSLVersion, targetGLSL } from '@thi.ng/shader-ast-glsl'

export const getFs = (prelude = 'precision mediump float;') => {
	const glsl = targetGLSL({
		// target WebGL2
		version: GLSLVersion.GLES_300,
		// emit #version pragma
		versionPragma: true,
		// fragment shader
		type: 'fs',
		// custom prelude
		prelude,
	})
	return glsl
}

export const getVs = (prelude = '') => {
	const glsl = targetGLSL({
		// target WebGL2
		version: GLSLVersion.GLES_300,
		// emit #version pragma
		versionPragma: true,
		// fragment shader
		type: 'vs',
		// custom prelude
		prelude,
	})
	return glsl
}

export const fs = getFs()
export const vs = getVs()
