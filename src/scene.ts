import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {DragControls} from 'three/examples/jsm/controls/DragControls'
import * as THREE from 'three'

import Collisions from './collisions'
import { Mesh, Vec2, Geometry, BoxGeometry, Vector3, Object3D, SphereGeometry, Material } from 'three'
import {Store} from './index'
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
    orbitControls: OrbitControls
    boxes: ReturnType<typeof makeBox>[]
    selectedBox: Mesh & { geometry: Geometry }
    store: Store
    
    constructor(elem: HTMLElement, store: Store) {
        this.elem = elem
        this.store = store
        this.renderer = new THREE.WebGLRenderer()
        this.renderer.setSize(elem.offsetWidth, elem.offsetHeight)
        elem.appendChild(this.renderer.domElement)

        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0xaaaaaa)

        this.camera = new THREE.PerspectiveCamera(70, elem.offsetWidth / elem.offsetHeight, 0.1, 1000)
        this.camera.position.set(0, 20, 0)
        this.orbitControls = new OrbitControls(this.camera, elem)
        this.orbitControls.addEventListener('change', () => this.render())

        let gridHelper = new THREE.GridHelper(20, 20, 0xffffff, 0xcccccc)
        this.scene.add(gridHelper)

        this.collisions = new Collisions()
        this.boxes = []
        this.selectedBox

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

    resetDragControls() {
        this.dragControls && this.dragControls.dispose()
        let currentY = 0
        this.dragControls = new DragControls(this.boxes, this.camera, this.elem)
        this.dragControls.addEventListener('dragstart', (e: DragEvent) => {
            this.selectedBox = e.object
            this.orbitControls.enabled = false
            currentY = e.object.position.y
        })

        this.dragControls.addEventListener('drag', (e: DragEvent) => {
            const box = e.object as Mesh & { geometry: BoxGeometry } 
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
            this.store.dispatch({
                type: 'MOVE_BOX',
                box,
            })
            this.render()
        })

        this.dragControls.addEventListener('dragend', (e: DragEvent) => {
            this.orbitControls.enabled = true
            const box = e.object as Mesh & { geometry: BoxGeometry } 
            console.time('moveBox')
            this.moveBox(box)
            console.timeEnd('moveBox')
            this.store.dispatch({
                type: 'MOVE_BOX',
                box,
            })
            this.render()
        })
    }

    addBox(pos: Vec2, width: number, height: number, rotation: number) {
        const box = makeBox(new Vector3(pos.x, 0, pos.y), width, height)
        box.rotation.y = rotation
        this.boxes.push(box)
        this.scene.add(box)
        box.updateMatrix()
        this.collisions.addRect(box.uuid, { x: box.position.x, y: box.position.z }, width, height, -box.rotation.y)
        this.resetDragControls()
        this.render()
        this.store.dispatch({
            type: 'ADD_BOX',
            box,
        })
        return box
    }

    moveBox(box: Mesh) {
        const maxCalls = 1000
        let calls = 0
        // this.collisions.addFromVertices(box.uuid, meshToPoints(box))
        // this.collisions.addRect(box.uuid, { x: box.position.x, y: box.position.z }, 2, 4, -box.rotation.y)
        this.collisions.translate(box.uuid, { x: box.position.x, y: box.position.z })

        let pos = box.position.clone()
        let objectsOuter // can't believe i have to do this
        do {
            ++calls
            const { x, y, objects } = this.collisions.getProjection(box.uuid)
            this.collisions.translate(box.uuid, { x: pos.x, y: pos.z })
            pos.x -= x
            pos.z -= y
            objectsOuter = objects
        } while (objectsOuter.length && calls < maxCalls)

        trace('calls', calls)
        if (calls < maxCalls) {
            box.material = green
        } else {
            box.material = red
        }

        box.position.copy(pos)
        box.updateMatrix()

        // this.collisions.addFromVertices(box.uuid, meshToPoints(box))
        // this.collisions.addRect(box.uuid, { x: box.position.x, y: box.position.z }, 2, 4, -box.rotation.y)
        this.collisions.translate(box.uuid, { x: box.position.x, y: box.position.z })
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

function makeBox(position: Vector3, width = 2, height = 4) {
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.000001, height),
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