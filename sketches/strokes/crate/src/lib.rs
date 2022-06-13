use geom::create_ball1_geom;
use js_sys::Float32Array;
use state::{AppState, State};
use tvs_libs::prelude::*;
use wasm_bindgen::prelude::*;
use web_sys::console;

mod geom;
mod state;
mod utils;

const BALL_1: &str = "ball1";

#[wasm_bindgen]
pub fn setup() {
    utils::set_panic_hook();
    console::log_1(&"Hello, wasm-pack, balls!".into());

    State::update(|mut s| {
        s.scene
            .set_obj(BALL_1, Transform::from_translation(vec3(0.0, 0.0, -20.0)));
        s.scene.update_cam(|c| {
            c.aspect_ratio = 4.0 / 3.0;
            c.fov = 0.6;
            c.recalculate_proj_mat();
        });
        s.light_dir = vec3(1.0, 1.0, 1.0).normalize();
    });
}

#[wasm_bindgen]
pub fn get_geom() -> JsValue {
    serde_wasm_bindgen::to_value(&create_ball1_geom()).unwrap()
}

#[wasm_bindgen]
pub fn get_mvp() -> Float32Array {
    let mat = State::read().scene.model_view_proj_mat(BALL_1);
    mat4_to_js(&mat)
}

#[wasm_bindgen]
pub fn get_normal_mat() -> Float32Array {
    let mat = State::read().scene.model_normal_mat(BALL_1);
    mat3_to_js(&mat)
}

#[wasm_bindgen]
pub fn get_light() -> Float32Array {
    let v = State::read().light_dir;
    vec3_to_js(&v)
}

#[wasm_bindgen]
pub fn update(tpf: f32) {
    State::update(|mut s| {
        s.scene.update_obj_transform(BALL_1, |t| {
            t.rotate(Quat::from_rotation_y(0.0003 * tpf));
        });
    });
}
