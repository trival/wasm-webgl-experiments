use geom::create_ball1_geom;
use glam::{vec3, Mat4, Vec3};
use wasm_bindgen::prelude::*;
use web_sys::console;

mod geom;
mod scene;
mod utils;

#[wasm_bindgen]
pub fn greet() {
    utils::set_panic_hook();
    console::log_1(&"Hello, wasm-pack, balls!".into());
}

#[wasm_bindgen]
pub fn create_ball1() -> JsValue {
    serde_wasm_bindgen::to_value(&create_ball1_geom()).unwrap()
}

#[wasm_bindgen]
pub fn create_camera() -> js_sys::Float32Array {
    let proj = Mat4::perspective_rh(0.6, 4.0 / 3.0, 0.01, 1000.0);
    let view = Mat4::look_at_rh(vec3(0.0, 1.0, 20.0), Vec3::Y, Vec3::Y);
    let mat = proj * view;
    js_sys::Float32Array::from(mat.to_cols_array().as_slice())
}
