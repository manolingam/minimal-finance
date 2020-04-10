import React from 'react';
import { Link } from 'react-router-dom';

import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

import './styles.css';

const StyledButton = withStyles({
	label: {
		color: 'black;',
	},
})(Button);

class HomePage extends React.Component {
	constructor() {
		super();
		this.state = {};
	}

	render() {
		console.log('Web3 Browser', this.props.web3Browser);
		return (
			<div>
				<nav className='nav'>
					{this.props.web3Browser ? (
						this.props.networkID === 42 ? (
							<Link to='/app' className='nav-buttons'>
								<StyledButton
									variant='outlined'
									onClick={this.props.connectAccount}
								>
									App
								</StyledButton>
							</Link>
						) : (
							<div className='nav-buttons'>
								<StyledButton variant='outlined' disabled>
									Switch to Kovan
								</StyledButton>
							</div>
						)
					) : (
						<div className='nav-buttons'>
							<a
								id='metamask-link'
								href='https://metamask.io/'
								target='_blank'
								rel='noopener noreferrer'
							>
								INSTALL METAMASK
							</a>
						</div>
					)}
				</nav>
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
						<p id='app-title' className='animated zoomIn'>
							Minimal Finance
						</p>
						<p className='app-phrase-1'>
							Earn interest from your Ether!
						</p>
						<p className='app-phrase-2'>
							Borrow Dai from your Ether!
						</p>
					</div>
				</div>
			</div>
		);
	}
}

export default HomePage;
