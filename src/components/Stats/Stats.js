import React from 'react';

import Skeleton from '@material-ui/lab/Skeleton';

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
				<p id='underlyingBalance'>
					{this.state.balanceOfUnderlying ? (
						this.state.balanceOfUnderlying
					) : (
						<Skeleton animation='wave' width={350} height={50} />
					)}
					<br></br>
					<span style={{ fontSize: '0.5em' }}>
						{' '}
						(Supplied Balance)
					</span>
				</p>
				<p id='underlyingBalance'>
					{this.props.borrowBalanceInEth ||
					this.props.borrowBalanceInEth === 0 ? (
						this.props.borrowBalanceInEth
					) : (
						<Skeleton animation='wave' width={350} height={50} />
					)}
					<br></br>
					<span style={{ fontSize: '0.5em' }}> (Borrow Balance)</span>
				</p>
			</div>
		);
	}
}

export default Stats;
