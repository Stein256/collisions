import React from 'react'
import ReactDOM from 'react-dom'

// import Scene from './scene-fiber'
// import { Canvas } from 'react-three-fiber'

// ReactDOM.render(<Canvas> <Scene /> </Canvas>, document.getElementById("root"));

import Scene from './scene'

const scene = new Scene(document.getElementById("root"))

window.addEventListener('resize', () => {
    scene.resize()
})