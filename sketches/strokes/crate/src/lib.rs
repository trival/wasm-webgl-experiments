use tvs_libs::{
    geometry::line_2d::Line, prelude::*, rendering::buffered_geometry::ToBufferedGeometry,
};
use wasm_bindgen::prelude::*;

mod utils;

pub struct State {
    pub line: Line,
}

impl Default for State {
    fn default() -> Self {
        let mut line = Line::new(20.0);

        line.add(vec2(100.0, 100.0));
        line.add_width(vec2(100.0, 300.0), 30.0);
        line.add_width(vec2(300.0, 300.0), 10.0);
        line.add(vec2(300.0, 100.0));

        State { line }
    }
}

impl AppState for State {
    unsafe fn state_cell() -> &'static mut OnceCell<Self> {
        static mut STATE: OnceCell<State> = OnceCell::new();
        &mut STATE
    }
}

#[wasm_bindgen]
pub fn get_geom() -> JsValue {
    let line = &State::read().line;
    serde_wasm_bindgen::to_value(&line.to_buffered_geometry()).unwrap()
}
