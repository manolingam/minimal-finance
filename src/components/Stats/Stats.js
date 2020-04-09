import React from 'react';

import Skeleton from '@material-ui/lab/Skeleton';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles';

import Eth from '../../assets/eth.svg';

import './styles.css';

const LightTooltip = withStyles((theme) => ({
	tooltip: {
		backgroundColor: theme.palette.common.black,
		color: 'white',
		boxShadow: theme.shadows[1],
		fontSize: 11,
	},
}))(Tooltip);

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

				{this.state.balanceOfUnderlying ? (
					<LightTooltip
						placement='right'
						title='Your supplied ETH currently earning interest (updated every 15 secs)'
						arrow
					>
						<p id='underlyingBalance'>
							{this.state.balanceOfUnderlying}
							<br></br>
							<span style={{ fontSize: '0.5em' }}>
								{' '}
								(Supplied Balance)
							</span>
						</p>
					</LightTooltip>
				) : (
					<Skeleton animation='wave' width={350} height={50} />
				)}

				{this.props.cEthBalance ? (
					<LightTooltip
						placement='left'
						title={`Your cToken Balance. Each cToken value increases as you earn interest. 1 cETH = ${this.props.exchangeRate} ETH.`}
						arrow
					>
						<p id='cEthBalance'>
							{this.props.cEthBalance}
							<br></br>
							<span style={{ fontSize: '0.5em' }}>
								{' '}
								(cEth Balance)
							</span>
						</p>
					</LightTooltip>
				) : (
					<Skeleton animation='wave' width={350} height={50} />
				)}

				{this.props.borrowBalanceInEth ||
				this.props.borrowBalanceInEth === 0 ? (
					<LightTooltip
						placement='right'
						title='Your pending loan value in ETH that needs to be repaid.'
						arrow
					>
						<p id='borrowBalance'>
							{this.props.borrowBalanceInEth}
							<br></br>
							<span style={{ fontSize: '0.5em' }}>
								{' '}
								(Borrow Balance)
							</span>
						</p>
					</LightTooltip>
				) : (
					<Skeleton animation='wave' width={350} height={50} />
				)}
			</div>
		);
	}
}

export default Stats;
