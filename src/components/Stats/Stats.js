import React from 'react';

import 'animate.css';

import Eth from '../../assets/eth.svg';

import './styles.css';

class Stats extends React.Component {
	constructor() {
		super();
		this.state = {};
	}

	fetchUnderlyingEth = async () => {
		const { cEth, address, web3 } = this.props;
		let _balanceOfUnderlying = await cEth.methods
			.balanceOfUnderlying(address)
			.call();
		let balanceOfUnderlying = web3.utils
			.fromWei(_balanceOfUnderlying)
			.toString();
		this.setState({ balanceOfUnderlying }, () => {
			setTimeout(
				async function () {
					await this.fetchUnderlyingEth();
				}.bind(this),
				15000
			);
		});
	};

	async componentDidMount() {
		await this.fetchUnderlyingEth();
	}

	render() {
		return (
			<div className='stats'>
				<img
					className='animated flipInY infinite delay-3s'
					src={Eth}
					alt='floating'
				></img>
				<p id='underlyingBalance'>{this.state.balanceOfUnderlying}</p>
			</div>
		);
	}
}

export default Stats;
