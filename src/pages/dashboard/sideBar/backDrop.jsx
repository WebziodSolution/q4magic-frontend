import { connect } from "react-redux"
import { toggleMobileSidebar } from "../../../redux/commonReducers/commonReducers"

const Backdrop = ({ isMobileOpen, toggleMobileSidebar }) => {
    if (!isMobileOpen) return null

    return (
        <div
            className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
            onClick={toggleMobileSidebar}
        />
    )
}

// Map state from Redux
const mapStateToProps = (state) => ({
    isMobileOpen: state.common.isMobileOpen,
})

// Map dispatch
const mapDispatchToProps = {
    toggleMobileSidebar,
}

export default connect(mapStateToProps, mapDispatchToProps)(Backdrop)
