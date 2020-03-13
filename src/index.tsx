import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux';
import produce from 'immer'

import Scene from './scene'
import MainMenu from './MainMenu';
import BoxMenu from './BoxMenu';
import DebugMenu from './DebugMenu';
import { Box } from '@material-ui/core';

const initialState = {
    boxes: {},
    activeBoxID: '',
} as State

function reducer(state = initialState, action: Action): State {
    switch(action.type) {
        case 'ADD_BOX':
        case 'MOVE_BOX':
            return produce(state, draft => {
                draft.boxes[action.box.uuid] = action.box
                draft.activeBoxID = action.box.uuid
            })
        default:
            return state
    }
}

const store = createStore(reducer)
export type Store = typeof store

const App = () => (
    <Provider store={store}>
        <div style={{ position: 'fixed', width: '200px', margin: 5 }}>
            <MainMenu></MainMenu>
            <BoxMenu></BoxMenu>
            <DebugMenu></DebugMenu>
        </div>
        <div id="scene"></div>
    </Provider>
)

ReactDOM.render(<App />, document.querySelector("#root"));
const scene = new Scene(document.querySelector("#scene") as HTMLElement, store)

scene.addBox({ x: -2, y: 0 }, 2, 4, Math.PI / 10)
scene.addBox({ x: 0, y: -1 }, 2, 4, 0)
scene.addBox({ x: 2, y: 0 }, 2, 4, -Math.PI / 10)

window.addEventListener('resize', () => {
    scene.resize()
})

interface Action {
    type: string,
    box: ReturnType<typeof scene.addBox>
}

interface State {
    boxes: {
        [key:string]: ReturnType<typeof scene.addBox>,
    },
    activeBoxID: string,
}