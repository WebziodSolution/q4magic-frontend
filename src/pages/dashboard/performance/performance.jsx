import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { setHeaderTitle } from '../../../redux/commonReducers/commonReducers'
import Activities from '../activities/activities'
import Results from '../results/results'
import { useLocation } from 'react-router-dom'

const Performance = ({ setHeaderTitle, performanceSelectedTabIndex }) => {
    const locaiton = useLocation()

    useEffect(() => {
        if (locaiton.pathname === "/dashboard/performance") {
            setHeaderTitle("Performance")
        }
    }, [performanceSelectedTabIndex])
    return (
        <>
            {
                performanceSelectedTabIndex === 0 && (
                    <Activities />
                )
            }
            {
                performanceSelectedTabIndex === 1 && (
                    <Results />
                )
            }
        </>
    )
}

const mapStateToProps = (state) => ({
    performanceSelectedTabIndex: state.common.performanceSelectedTabIndex,
})

const mapDispatchToProps = {
    setHeaderTitle
}

export default connect(mapStateToProps, mapDispatchToProps)(Performance)