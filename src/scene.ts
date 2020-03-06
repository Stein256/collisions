import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {DragControls} from 'three/examples/jsm/controls/DragControls'
import * as THREE from 'three'

import Collisions from './collisions'
import { Mesh, Vec2, Geometry, BoxGeometry, Vector3, Object3D, SphereGeometry, Material } from 'three'
import { MyLine } from './threeUtils'
const trace = console.log

let red = new THREE.MeshBasicMaterial({
    color: 0xff0000
})
let green = new THREE.MeshBasicMaterial({
    color: 0x00ff00
})

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

        let gridHelper = new THREE.GridHelper(20, 20, 0xffffff, 0xcccccc)
        this.scene.add(gridHelper)

        this.collisions = new Collisions()

        let box1 = makeBox(new Vector3(-2, 0, 0))
        let box2 = makeBox(new Vector3(0, 0, -1))
        let box3 = makeBox(new Vector3(2, 0, 0))

        // box1.rotation.y = Math.PI * 2 * Math.random()
        // box2.rotation.y = Math.PI * 2 * Math.random()
        // box3.rotation.y = Math.PI * 2 * Math.random()

        box1.rotation.y = Math.PI / 5
        box2.rotation.y = 0
        box3.rotation.y = -Math.PI / 5

        const boxes = [box1, box2, box3]

        boxes.forEach(box => {
            this.scene.add(box)
            box.updateMatrix()
            // this.collisions.addFromVertices(box.uuid, meshToPoints(box), { x: box.position.x, y: box.position.z })
            this.collisions.addRect(box.uuid, {x: box.position.x, y: box.position.z}, 2, 4, -box.rotation.y)
        })

        let currentY = 0
        this.dragControls = new DragControls(boxes, this.camera, this.renderer.domElement)
        this.dragControls.addEventListener('dragstart', (e: DragEvent) => {
            orbitControls.enabled = false
            currentY = e.object.position.y
        })

        this.dragControls.addEventListener('drag', (e: DragEvent) => {
            const box = e.object
            box.position.y = currentY
            // this.collisions.addFromVertices(e.object.uuid, meshToPoints(e.object))
            // this.collisions.addRect(box.uuid, { x: box.position.x, y: box.position.z }, 2, 4, -box.rotation.y)
            this.collisions.translate(box.uuid, { x: box.position.x, y: box.position.z })
            let { x, y, collided } = this.collisions.getProjection(box.uuid)
            box.position.x -= x
            box.position.z -= y
            if (collided) {
                box.material = red
            } else {
                box.material = green
            }
            this.render()
        })

        const maxCalls = 1000
        this.dragControls.addEventListener('dragend', (e: DragEvent) => {
            orbitControls.enabled = true
            const box = e.object
            let objects, calls = 0

            do {
                ++calls
                // this.collisions.addFromVertices(box.uuid, meshToPoints(box))
                // this.collisions.addRect(box.uuid, { x: box.position.x, y: box.position.z }, 2, 4, -box.rotation.y)
                this.collisions.translate(box.uuid, { x: box.position.x, y: box.position.z })
                let res = this.collisions.getProjection(box.uuid)
                box.position.x -= res.x
                box.position.z -= res.y
                objects = res.objects
                box.updateMatrix()
            } while (objects.length && calls < maxCalls)
            trace('calls', calls)
            if (calls < maxCalls) {
                box.material = green
            }
            // this.collisions.addRect(box.uuid, { x: box.position.x, y: box.position.z }, 2, 4, -box.rotation.y)
            this.collisions.translate(box.uuid, { x: box.position.x, y: box.position.z })
            // this.collisions.addFromVertices(box.uuid, meshToPoints(box))
            this.render()
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

function meshToPoints(mesh: Mesh & {geometry: Geometry}) {
    return mesh.geometry.vertices
        .filter(v => v.y > 0)
        .map(v => v.clone().applyMatrix4(mesh.matrix))
        .map(v => ({
            x: v.x,
            y: v.z,
        } as Vec2))
}

function makeBox(position: Vector3) {
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.000001, 4),
        green,
    ) as Mesh & {geometry: BoxGeometry}
    box.position.copy(position)
    return box
}

function makeSphere(position: Vector3, material = red) {
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 1, 1),
        material,
    ) as Mesh & {geometry: SphereGeometry}
    sphere.position.copy(position)
    return sphere
}

interface DragEvent extends THREE.Event {
    object: Mesh & { geometry: Geometry }
}