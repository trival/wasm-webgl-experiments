use bytemuck::{Pod, Zeroable};
use glam::{vec3, Mat4, Quat, Vec3};
use serde::Serialize;
use std::f32::consts::PI;
use tvs_libs::{
    data_structures::grid::{make_grid_with_coord_ops, CIRCLE_COLS_COORD_OPS},
    geometry::{
        mesh_geometry_3d::{MeshBufferedGeometryType, MeshGeometry, MeshVertex, VertexPosition},
        vertex_index::{VertIdx2Usize, WithVertexIndex},
    },
    rendering::buffered_geometry::{
        vert_type, BufferedGeometry, BufferedVertexData, ToBufferedVertexData, VertexFormat,
        WithVertexLayout,
    },
};
use wasm_bindgen::prelude::*;
use web_sys::console;

mod utils;

#[wasm_bindgen]
pub fn greet() {
    console::log_1(&"Hello, wasm-pack, balls!".into());
}

#[repr(C)]
#[derive(Pod, Zeroable, Clone, Copy, Serialize)]
struct VertexBuffer {
    pos: Vec3,
    color: Vec3,
}
impl BufferedVertexData for VertexBuffer {}
impl WithVertexLayout for VertexBuffer {
    fn vertex_layout() -> Vec<tvs_libs::rendering::buffered_geometry::VertexType> {
        let mut layout = vec![];
        layout.push(vert_type("position", VertexFormat::Float32x3));
        layout.push(vert_type("color", VertexFormat::Float32x3));
        layout
    }
}

struct Vertex {
    data: VertexBuffer,
    grid_pos: (usize, usize),
}
impl WithVertexIndex<VertIdx2Usize> for Vertex {
    fn vertex_index(&self) -> VertIdx2Usize {
        VertIdx2Usize(self.grid_pos.0, self.grid_pos.1)
    }
}
impl VertexPosition for Vertex {
    fn position(&self) -> Vec3 {
        self.data.pos
    }
}
impl ToBufferedVertexData<VertexBuffer> for Vertex {
    fn to_buffered_vertex_data(&self) -> VertexBuffer {
        self.data
    }
}
impl MeshVertex<VertIdx2Usize, VertexBuffer> for Vertex {}

fn vert(pos: Vec3, color: Vec3, x: usize, y: usize) -> Vertex {
    Vertex {
        data: VertexBuffer { pos, color },
        grid_pos: (x, y),
    }
}

pub fn create_ball1_geom() -> BufferedGeometry {
    utils::set_panic_hook();
    let mut grid = make_grid_with_coord_ops(CIRCLE_COLS_COORD_OPS);
    let mut col1 = vec![];
    let mut y = 5;
    while y >= -5 {
        col1.push(vec3(1.0, y as f32, 0.0));
        y -= 1;
    }
    grid.add_col(col1.clone());

    let stops = 7;
    let angle = (PI * 2.0) / stops as f32;
    for i in 1..stops {
        let q = Quat::from_rotation_y(angle * i as f32);
        let col = col1.iter().map(|pos| q.mul_vec3(*pos)).collect();
        grid.add_col(col)
    }

    let mut geom = MeshGeometry::new();
    for y in 0..(grid.height - 1) {
        for x in 0..grid.width {
            let v1 = grid.vertex(x as i32, y as i32).unwrap();
            let v2 = v1.bottom().unwrap();
            let v3 = v2.right().unwrap();
            let v4 = v3.top().unwrap();
            geom.add_face4(
                vert(v1.val, vec3(1.0, 0.0, 0.0), v1.x, v1.y),
                vert(v2.val, vec3(1.0, 0.0, 0.0), v2.x, v2.y),
                vert(v3.val, vec3(1.0, 0.0, 0.0), v3.x, v3.y),
                vert(v4.val, vec3(1.0, 0.0, 0.0), v4.x, v4.y),
            );
        }
    }

    geom.generate_face_normals();
    geom.generate_vertex_normals();
    geom.triangulate();

    geom.to_buffered_geometry_by_type(
        MeshBufferedGeometryType::FaceNormals,
        VertexBuffer::vertex_layout(),
    )
}

#[wasm_bindgen]
pub fn create_ball1() -> JsValue {
    serde_wasm_bindgen::to_value(&create_ball1_geom()).unwrap()
}

#[wasm_bindgen]
pub fn create_camera() -> js_sys::Float32Array {
    let proj = Mat4::perspective_rh_gl(0.6, 4.0 / 3.0, 0.01, 1000.0);
    let view = Mat4::look_at_rh(vec3(0.0, 1.0, 20.0), Vec3::Y, Vec3::Y);
    let mat = proj * view;
    js_sys::Float32Array::from(mat.to_cols_array().as_slice())
}

#[test]
fn test_ball1() {
    let res = create_ball1_geom();
    print!("{:?}", res);
    assert!(res.buffer.len() > 0);
}
