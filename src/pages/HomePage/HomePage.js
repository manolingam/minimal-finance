import React from 'react';

import './styles.css';

class HomePage extends React.Component {
	constructor() {
		super();
		this.state = {};
	}

	render() {
		return (
			<div className='home-container'>
				<img
					className='eth'
					src='https://compound.finance/images/ctoken_eth.svg'
					alt='cEth'
				></img>
				<img
					className='dai'
					src='https://compound.finance/images/ctoken_dai.svg'
					alt='cDai'
				></img>
				<div className='title-container'>
					<p id='app-title'>Minimal Finance</p>
					<p className='app-phrase-1'>
						Earn interest from your Ether!
					</p>
					<p className='app-phrase-2'>Borrow Dai from your Ether!</p>
				</div>
			</div>
		);
	}
}

export default HomePage;
