import React from 'react'
import Logo from "../moralis-logo.svg";
import Eth from "../eth.svg"
import {Link} from 'react-router-dom'
 
function Header(props) {
	const {connectButton} = props;

    return (
      	<header>
			<div className='leftH'>
				<img src={Logo} className='logo' alt='logo'></img>
				<Link to="/" className='link'>
					<div className='headerItem'>Hallo</div>
				</Link>
			</div>
			<div className='rightH'>
				{connectButton}
				
			</div>
		</header>
    )
}

export default Header