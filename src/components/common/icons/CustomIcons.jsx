import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const CustomIcons = ({ iconName, css , onClick}) => {    
    return (
        <>
            <FontAwesomeIcon icon={iconName} className={css} onClick={onClick} />
        </>
    )
}

export default CustomIcons