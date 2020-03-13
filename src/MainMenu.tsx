import React from "react"
import Menu from "./Menu"
import { Button } from "@material-ui/core"

const MainMenu = () => {
    const buttons = []
    return (
        <Menu title="Main Menu">
            <Button variant="contained">Add Box</Button>
        </Menu>
    )
}

export default MainMenu