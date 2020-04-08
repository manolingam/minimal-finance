import React from 'react';

import './styles.css';

class HomePage extends React.Component {
	constructor() {
		super();
		this.state = {
			is_loaded: false,
		};
	}

	async componentDidMount() {
		if (this.props.networkID === 42) {
			const { cEth, cDai } = this.props;
			let cEth_cash = await cEth.methods.getCash().call();

			this.setState({
				cEth_cash,
				is_loaded: true,
			});
		}
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
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<p
						style={{
							textAlign: 'center',
							fontSize: '1.8em',
							color: 'black',
							fontWeight: 'bold',
						}}
					>
						Kovan DAI Loans
					</p>
					<p
						style={{
							fontSize: '1.6em',
						}}
					>
						Supply Ether, Borrow DAI, Repay DAI, Redeem Ether!
					</p>
					<p
						style={{
							fontSize: '1.6em',
						}}
					>
						{`There's ${this.state.cEth_cash}$ value of Ether!`}
					</p>
				</div>
			</div>
		);
	}
}

export default HomePage;
