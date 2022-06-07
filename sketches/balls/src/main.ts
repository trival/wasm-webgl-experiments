import './style.css'
import { addToLoop, startLoop } from 'tvs-utils/dist/app/frameLoop'
import init2, {
	get_geom,
	get_light,
	get_mvp,
	get_normal_mat,
	setup,
	update,
} from '../crate/pkg/tvs_sketch_balls'
import { render, renderInit, wasmGeometryToFormData } from './render'

init2().then(() => {
	setup()
	const ball = wasmGeometryToFormData(get_geom())
	renderInit(ball)

	addToLoop((tpf) => {
		update(tpf)
		render(get_mvp(), get_normal_mat(), get_light())
	})
	startLoop()
})
