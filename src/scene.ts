import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {DragControls} from 'three/examples/jsm/controls/DragControls'
import * as THREE from 'three'

import Collisions from './collisions'
import { Mesh, Vec2, Geometry, BoxGeometry, Vector3, Object3D, SphereGeometry } from 'three'
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

        let box1 = makeBox(new Vector3(-2, 0, 0))
        let box2 = makeBox(new Vector3(0, 0, 0))
        let box3 = makeBox(new Vector3(2, 0, 0))

        // box1.rotation.y = Math.PI * 2 * Math.random()
        // box2.rotation.y = Math.PI * 2 * Math.random()
        // box3.rotation.y = Math.PI * 2 * Math.random()

        box1.rotation.y = Math.PI / 10
        box2.rotation.y = 0
        box3.rotation.y = -Math.PI / 10

        this.scene.add(box1)
        this.scene.add(box2)
        this.scene.add(box3)

        box1.updateMatrix()
        box2.updateMatrix()
        box3.updateMatrix()

        this.collisions = new Collisions()
        this.collisions.setFromVertices(box1.uuid, meshToPoints(box1))
        this.collisions.setFromVertices(box2.uuid, meshToPoints(box2))
        this.collisions.setFromVertices(box3.uuid, meshToPoints(box3))

        let currentY = 0
        this.dragControls = new DragControls([box1, box2, box3], this.camera, this.renderer.domElement)
        this.dragControls.addEventListener('dragstart', (e: DragEvent) => {
            orbitControls.enabled = false
            currentY = e.object.position.y
        })

        let red = new THREE.MeshBasicMaterial({
            color: 0xff0000
        })
        let green = new THREE.MeshBasicMaterial({
            color: 0x00ff00
        })
        this.dragControls.addEventListener('drag', (e: DragEvent) => {
            e.object.position.y = currentY
            this.collisions.setFromVertices(e.object.uuid, meshToPoints(e.object))
            let { x, y, collided } = this.collisions.getProjection(e.object.uuid)
            e.object.position.x -= x
            e.object.position.z -= y
            if (collided) {
                e.object.material = red
            } else {
                e.object.material = green
            }
            this.render()
        })

        this.dragControls.addEventListener('dragend', (e: DragEvent) => {
            orbitControls.enabled = true
            let objects, calls = 0;
            do {
                ++calls
                this.collisions.setFromVertices(e.object.uuid, meshToPoints(e.object))
                let res = this.collisions.getProjection(e.object.uuid)
                e.object.position.x -= res.x
                e.object.position.z -= res.y
                objects = res.objects
                e.object.updateMatrix()
            } while (objects.length && calls < 1000)
            trace('calls', calls)
            if (calls < 100) {
                e.object.material = green
            }
            this.collisions.setFromVertices(e.object.uuid, meshToPoints(e.object))
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
        //new THREE.BoxGeometry(Math.random() * 5, 1, Math.random() * 5),
        new THREE.BoxGeometry(2, 0.000001, 4),
        new THREE.MeshBasicMaterial({
            color: Math.random() * 0xffffff
        })
    ) as Mesh & {geometry: BoxGeometry}
    box.position.copy(position)
    return box
}

function makeSphere(position: Vector3) {
    const sphere = new THREE.Mesh(
        //new THREE.BoxGeometry(Math.random() * 5, 1, Math.random() * 5),
        new THREE.SphereGeometry(0.1, 1, 1),
        new THREE.MeshBasicMaterial({
            color: 0xff0000
        })
    ) as Mesh & {geometry: SphereGeometry}
    sphere.position.copy(position)
    return sphere
}

interface DragEvent extends THREE.Event {
    object: Mesh & { geometry: Geometry }
}