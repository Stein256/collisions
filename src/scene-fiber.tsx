import React, { useRef, useState, useEffect } from 'react'
import { ReactThreeFiber, useFrame, extend, useThree } from 'react-three-fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three'
import { Mesh } from 'three';
const trace = console.log;

extend({ OrbitControls })
declare global {
    namespace JSX {
        interface IntrinsicElements {
            orbitControls: ReactThreeFiber.Object3DNode<OrbitControls, typeof OrbitControls>
        }
    }
}

export default function Scene(props) {
    const {
        camera,
        gl: { domElement },
        scene
    } = useThree()
    trace('Scene')
    scene.background = new THREE.Color(0xaaaaaa)
    camera.position.set(0, 5, 5)

    let arr = [];
    for (let i = 0; i < 7000; i++) {
        arr.push(<Box key={i} position={[Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10]} />)
    }

    const box = useRef<Mesh>()
    trace(box)

    return (
        <>
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <Box ref={box} position={[-1, 0, 0]} />
            {/* <Box position={[1, 0, 0]} /> */}
            {/* {arr} */}
            <orbitControls args={[camera, domElement]} />
            <gridHelper args={[20, 20]}/>
        </>
    )
}

const g = <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
const m1 = <meshStandardMaterial attach="material" color='orange' />
const m2 = <meshStandardMaterial attach="material" color='hotpink' />

function Box(props: ReactThreeFiber.Object3DNode<THREE.Mesh, typeof THREE.Mesh>) {
    // This reference will give us direct access to the mesh
    const mesh = useRef<Mesh>()
    const rand = Math.random()
    // Set up state for the hovered and active state
    const [hovered, setHover] = useState(false)
    const [active, setActive] = useState(false)
    trace('Box', mesh)
    // Rotate mesh every frame, this is outside of React without overhead
    useFrame(() => {
        mesh.current.rotation.x += (rand - 0.5) * 0.1
        mesh.current.rotation.y += (rand - 0.5) * 0.1
        // trace('Box useFrame')
    })

    return (
        <mesh
            {...props}
            ref={mesh}
            scale={active ? [1.5, 1.5, 1.5] : [1, 1, 1]}
            // onClick={e => setActive(!active)}
            // onPointerOver={e => setHover(true)}
            // onPointerOut={e => setHover(false)}
            >
            {/* <boxBufferGeometry attach="geometry" args={[1, 1, 1]} /> */}
            {/* <meshStandardMaterial attach="material" color={hovered ? 'hotpink' : 'orange'} /> */}
            {g}
            {hovered ? m2 : m1}
        </mesh>
    )
}
