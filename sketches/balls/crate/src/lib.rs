#[macro_use]
extern crate lazy_static;
use geom::create_ball1_geom;
use glam::{vec3, Quat};
use tvs_libs::rendering::transform::Transform;
use wasm_bindgen::prelude::*;
use web_sys::console;

mod geom;
mod scene;
mod utils;

const GEOM: &str = "geom";
const BALL_1: &str = "ball1";

#[wasm_bindgen]
pub fn setup() {
    utils::set_panic_hook();
    console::log_1(&"Hello, wasm-pack, balls!".into());

    scene::update(|mut s| {
        s.set_geometry(GEOM, create_ball1_geom());
        s.set_obj(
            BALL_1,
            GEOM,
            Transform::from_translation(vec3(0.0, 0.0, -20.0)),
        );
        s.update_cam(|c| {
            c.aspect_ratio = 4.0 / 3.0;
            c.fov = 0.6;
            c.recalculate_proj_mat();
        });
    });
}

#[wasm_bindgen]
pub fn get_geom() -> JsValue {
    serde_wasm_bindgen::to_value(scene::read().geom(GEOM)).unwrap()
}

#[wasm_bindgen]
pub fn get_mvp() -> js_sys::Float32Array {
    let mvp_mat = scene::read().model_view_proj_mat(BALL_1);
    js_sys::Float32Array::from(mvp_mat.to_cols_array().as_slice())
}

#[wasm_bindgen]
pub fn update(tpf: f32) {
    scene::update(|mut s| {
        s.update_obj_transform(BALL_1, |t| {
            t.rotate(Quat::from_rotation_y(0.001 * tpf));
        });
    });
}
