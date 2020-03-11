import React from 'react'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { makeStyles, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Typography } from '@material-ui/core'
import clsx from 'clsx'

const usePanelStyles = makeStyles(theme => ({
    root: {
        border: '1px solid rgba(0, 0, 0, .125)',
        boxShadow: 'none',
        '&:not(:last-child)': {
            borderBottom: 0,
        },
        '&:before': {
            display: 'none',
        },
        '&$expanded': {
            margin: 'auto',
        },
    },
    expanded: {},
}))

const useSummaryStyles = makeStyles(theme => ({
    root: {
        backgroundColor: 'rgba(0, 0, 0, .03)',
        borderBottom: '1px solid rgba(0, 0, 0, .125)',
        marginBottom: -1,
        minHeight: 56,
        '&$expanded': {
            minHeight: 56,
        },
    },
    content: {
        '&$expanded': {
            margin: '12px 0',
        },
    },
    expanded: {},
}))

const useDetailsStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(2),
    },
}))

const useStyles = makeStyles(theme => ({
    expanded: {
        '&$expanded': {
            minHeight: 'inherit',
        },
    },
    content: {
        '&$content': {
            margin: 0,
        }
    },
    root: {
        padding: 5,
    },
}))

const Menu = () => {
    const panelClasses = usePanelStyles()
    const summaryClasses = useSummaryStyles()
    const detailsClasses = useDetailsStyles()

    return (
        <ExpansionPanel classes={panelClasses}>
            <ExpansionPanelSummary
                classes={summaryClasses}
                expandIcon={<ExpandMoreIcon />}
            >
                <Typography>
                    Main Menu
                </Typography>
            </ExpansionPanelSummary>

            <ExpansionPanelDetails classes={detailsClasses}>
                <Typography>
                    Some text
                    <br/>
                    More text
                </Typography>
            </ExpansionPanelDetails>
        </ExpansionPanel>
    )
}

export default Menu