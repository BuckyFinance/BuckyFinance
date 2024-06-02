import React, { useState } from 'react'
import Logo from "../bucket.png";
import Eth from "../eth.svg"
import {Link} from 'react-router-dom'
import { getCurrentLTV } from '../backend/scripts/getCurrentLTV';
 
function Header(props) {
	const {connectButton, account} = props;
	const [maxLTV, setMaxLTV] = useState(0);

	async function getLTV(){
		if(account.isConnected)
			setMaxLTV(await getCurrentLTV(account.address));
	}

	getLTV();

	

    return (
      	<header>
			<div className='leftH'>
				<img src={Logo} className='logo'></img>
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
				<div className='maxLTV'>
					<div style={{height: 24}}>Max LTV {maxLTV}%</div>
				</div>
				{connectButton}
				
			</div>
		</header>
    )
}

export default Header