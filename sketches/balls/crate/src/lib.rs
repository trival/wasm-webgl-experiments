use bytemuck::{Pod, Zeroable};
use glam::Vec3;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, hello-wasm-pack!");
}

#[wasm_bindgen]
pub fn todo() {
    utils::set_panic_hook();
    todo!();
}

#[repr(C)]
#[derive(Pod, Zeroable, Clone, Copy)]
struct Vertex1 {
    pos: Vec3,
    color: Vec3,
}

mod utils;
