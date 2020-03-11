import React from 'react'
import ReactDOM from 'react-dom'
import Scene from './scene'
import Menu from './Menu';

const App = () => (
    <>
        <div style={{position: 'fixed', width: '200px', margin: 5}}>
            <Menu />
            <Menu />
            <Menu />
            <Menu />
            <Menu />
        </div>
        <div id="scene"></div>
    </>
)

ReactDOM.render(<App />, document.querySelector("#root"));
const scene = new Scene(document.querySelector("#scene") as HTMLElement)

window.addEventListener('resize', () => {
    scene.resize()
})