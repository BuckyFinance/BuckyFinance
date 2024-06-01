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
					<div className='headerItem'>Dashboard</div>
				</Link>
				<Link to="/swap" className='link'>
					<div className='headerItem'>Swap</div>
				</Link>
				<Link to="/borrow" className='link'>
					<div className='headerItem'>Quick Borrow</div>
				</Link>
			</div>
			<div className='rightH'>
				{connectButton}
				
			</div>
		</header>
    )
}

export default Header