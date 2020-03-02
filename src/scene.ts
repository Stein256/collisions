import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {DragControls} from 'three/examples/jsm/controls/DragControls'
import * as THREE from 'three'

import Collisions from './collisions'
import { Mesh } from 'three'
const trace = console.log

export default class Scene {
    scene: THREE.Scene
    renderer: THREE.WebGLRenderer
    camera: THREE.PerspectiveCamera
    elem: HTMLElement
    dragControls: DragControls
    collisions: Collisions
    constructor(elem: HTMLElement) {
        this.elem = elem
        this.renderer = new THREE.WebGLRenderer()
        this.renderer.setSize(elem.offsetWidth, elem.offsetHeight)
        elem.appendChild(this.renderer.domElement)

        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0xaaaaaa)

        this.camera = new THREE.PerspectiveCamera(70, elem.offsetWidth / elem.offsetHeight, 0.1, 1000)
        this.camera.position.set(0, 20, 0)
        let orbitControls = new OrbitControls(this.camera, this.renderer.domElement)
        orbitControls.addEventListener('change', () => this.render())

        let gridHelper = new THREE.GridHelper(10, 10, 0xffffff, 0xcccccc)
        this.scene.add(gridHelper)

        let box1 = makeBox()
        box1.position.x = 0
        //box1.rotation.y = Math.PI / 2 * Math.random()
        let box2 = makeBox()
        box2.position.x = 10
        //box2.rotation.y = Math.PI / 2 * Math.random()

        this.collisions = new Collisions()
        this.collisions.setCollidable(box1.uuid, meshToPoints(box1))
        this.collisions.setCollidable(box2.uuid, meshToPoints(box2))

        this.scene.add(box1)
        this.scene.add(box2)

        let currentY = 0
        this.dragControls = new DragControls([box1, box2], this.camera, this.renderer.domElement)
        this.dragControls.addEventListener('dragstart', e => {
            orbitControls.enabled = false
            currentY = e.object.position.y
        })

        let red = new THREE.MeshBasicMaterial({
            color: 0xff0000
        })
        let green = new THREE.MeshBasicMaterial({
            color: 0x00ff00
        })
        this.dragControls.addEventListener('drag', e => {
            e.object.position.y = currentY
            //@ts-ignore
            let { x, y, collided } = this.collisions.getProjection(e.object.uuid, meshToPoints(e.object))
            e.object.position.x += x
            e.object.position.z += y
            if (collided) {
                e.object.material = red
            } else {
                e.object.material = green
            }
            this.render()
        })

        this.dragControls.addEventListener('dragend', e => {
            orbitControls.enabled = true
            this.collisions.setCollidable(e.object.uuid, meshToPoints(e.object))
        })

        this.render()
    }

    render() {
        this.renderer.render(this.scene, this.camera)
    }

    resize() {
        this.camera.aspect = this.elem.offsetWidth / window.innerHeight
        this.renderer.setSize(this.elem.offsetWidth, window.innerHeight)
        this.camera.updateProjectionMatrix()
        this.render()
    }
}
//check vertex order
function meshToPoints(mesh: Mesh) {
    //@ts-ignore
    let p =  mesh.geometry.vertices
        .filter(v => v.y > 0)
        .map(v => ({
            x: v.x + mesh.position.x,
            y: v.z + mesh.position.z,
        }));
    // [p[1], p[2]] = [p[2], p[1]];
    // [p[3], p[0]] = [p[0], p[3]];
    return p
}

function makeBox() {
    return new THREE.Mesh(
        //new THREE.BoxGeometry(Math.random() * 5, 1, Math.random() * 5),
        new THREE.BoxGeometry(2, 1, 4),
        new THREE.MeshBasicMaterial({
            color: Math.random() * 0xffffff
        })
    )
}