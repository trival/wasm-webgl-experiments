import { addToLoop, startLoop } from 'tvs-utils/dist/app/frameLoop'
import { wasmGeometryToFormData } from '../../shared/wasm/utils'
import init, {
	get_geom,
	get_light,
	get_mvp,
	get_normal_mat,
	setup,
	update,
} from '../crate/pkg/tvs_sketch_strokes'
import { render, renderInit } from './render'

init().then(() => {
	setup()
	const ball = wasmGeometryToFormData(get_geom())
	renderInit(ball)

	addToLoop((tpf) => {
		update(tpf)
		render(get_mvp(), get_normal_mat(), get_light())
	}, 'mainLoop')

	startLoop()
})

if (import.meta.hot) {
	import.meta.hot.accept()
}
