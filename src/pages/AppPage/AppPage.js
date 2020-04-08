import React from 'react';
import { withRouter } from 'react-router-dom';
import Identicon from 'identicon.js';

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';
import Skeleton from '@material-ui/lab/Skeleton';
import { withStyles } from '@material-ui/core/styles';

import '../../components/Supply/Supply';
import '../../components/Redeem/Redeem';
import '../../components/Borrow/Borrow';
import '../../components/Repay/Repay';

import './styles.css';
import Supply from '../../components/Supply/Supply';
import Redeem from '../../components/Redeem/Redeem';
import Borrow from '../../components/Borrow/Borrow';
import Repay from '../../components/Repay/Repay';
import Stats from '../../components/Stats/Stats';
import { CircularProgress } from '@material-ui/core';

const StyledButton = withStyles(() => ({
	root: {
		backgroundColor: 'hotpink',
		color: 'white',
		'&:hover': {
			backgroundColor: 'hotpink',
		},
	},
}))(Button);

const StyledSnackBar = withStyles({
	root: {
		position: 'initial',
		zIndex: '1400',
		alignItems: 'center',
		justifyContent: 'center',
	},
	anchorOriginBottomCenter: {
		left: '50%',
		right: 'auto',
		bottom: '24px',
		transform: 'none',
	},
})(Snackbar);

function Alert(props) {
	return <MuiAlert elevation={6} variant='filled' {...props} />;
}
class AppPage extends React.Component {
	constructor() {
		super();
		this.state = {
			marketEntered: false,
			supplyLoading: false,
			redeemLoading: false,
			enterMarketLoading: false,
			borrowLoading: false,
			repayLoading: false,
			successSnackbarOpen: false,
			failSnackbarOpen: false,
		};
	}

	handleSnackBarClose = () => {
		this.setState({ successSnackbarOpen: false, failSnackbarOpen: false });
	};

	enterMarket = async () => {
		this.setState({ enterMarketLoading: true });

		const { comptroller, web3 } = this.props.values;
		const address = this.state.address;
		const cEthAddress = this.props.cEthAddress;

		try {
			console.log(
				'\nEntering market (via Comptroller contract) for ETH (as collateral)...'
			);

			let markets = [cEthAddress];
			await comptroller.methods.enterMarkets(markets).send({
				from: address,
				gasLimit: web3.utils.toHex(150000),
				gasPrice: web3.utils.toHex(20000000000),
			});

			await this.getBalances();

			this.setState({
				marketEntered: true,
				enterMarketLoading: false,
				successSnackbarOpen: true,
			});
		} catch (err) {
			this.setState({
				failSnackbarOpen: true,
				enterMarketLoading: false,
			});
		}
	};

	getBalances = async () => {
		const { cEth, cDai, dai, comptroller, priceOracle } = this.props.values;
		const cDaiAddress = this.props.cDaiAddress;
		const cEthAddress = this.props.cEthAddress;

		const web3 = this.props.values.web3;
		const wallet_address = this.state.address;

		// ether balance of the user's wallet
		let eth_balance = +web3.utils.fromWei(
			await web3.eth.getBalance(wallet_address)
		);

		// ceth balance of the user's wallet
		let ceth_balance =
			(await cEth.methods.balanceOf(wallet_address).call()) / 1e8;

		// dai balance of the user's wallet
		let dai_balance =
			+(await dai.methods.balanceOf(wallet_address).call()) / 1e18;

		// exchange rate for ceth to eth
		// let exchangeRate =
		// 	(await cEth.methods.exchangeRateCurrent().call()) / 1e28;

		// underlying eth balance in compound
		let _balanceOfUnderlying = await cEth.methods
			.balanceOfUnderlying(wallet_address)
			.call();

		let balanceOfUnderlying = web3.utils
			.fromWei(_balanceOfUnderlying)
			.toString();

		// available liquidity in ether
		let { 1: liquidity } = await comptroller.methods
			.getAccountLiquidity(wallet_address)
			.call();
		liquidity = web3.utils.fromWei(liquidity).toString();
		console.log('Liquidity: ', liquidity);

		//collateral factor for eth
		let { 1: collateralFactor } = await comptroller.methods
			.markets(cEthAddress)
			.call();

		console.log('balUnder * 0.75: ', balanceOfUnderlying * 0.75);

		// dai price in eth
		let daiPriceInEth = await priceOracle.methods
			.getUnderlyingPrice(cDaiAddress)
			.call();
		daiPriceInEth = daiPriceInEth / 1e18;

		daiPriceInEth = daiPriceInEth.toFixed(6);

		// available dai for borrowing
		let borrowLimit = liquidity / daiPriceInEth;
		console.log('Borrow limit: ', borrowLimit);

		// pending dai balance that needs to be repaid
		let borrowBalance = await cDai.methods
			.borrowBalanceCurrent(wallet_address)
			.call();

		borrowBalance = borrowBalance / 1e18;

		console.log('Borrow Balance: ', borrowBalance * daiPriceInEth);

		console.log('liquidty * 0.75', liquidity * 0.75);

		let ethForReedem =
			balanceOfUnderlying - (borrowBalance * daiPriceInEth) / 0.75;

		console.log('Eth that can be redeemed: ', ethForReedem);

		this.setState({
			eth_balance,
			ceth_balance,
			dai_balance,
			balanceOfUnderlying,
			borrowLimit,
			borrowBalance,
			liquidity,
			borrowBalanceInEth: borrowBalance * daiPriceInEth,
			borrowLimitInEth: balanceOfUnderlying * 0.75,
			marketEntered: liquidity === '0' ? false : true,
		});
	};

	supplyETH = async (supplyEthValue) => {
		if (supplyEthValue) {
			this.setState({ supplyLoading: true });

			const { cEth, web3 } = this.props.values;
			const address = this.state.address;

			try {
				await cEth.methods.mint().send({
					from: address,
					gasLimit: web3.utils.toHex(1500000),
					gasPrice: web3.utils.toHex(20000000000),
					value: web3.utils.toHex(
						web3.utils.toWei(supplyEthValue, 'ether')
					),
				});
				await this.getBalances();

				this.setState({
					supplyLoading: false,
					successSnackbarOpen: true,
				});
			} catch (err) {
				console.log(err);
				await this.getBalances();

				this.setState({ supplyLoading: false, failSnackbarOpen: true });
			}
		}
	};

	redeemETH = async (redeemEthValue) => {
		const { cEth, web3 } = this.props.values;
		const address = this.state.address;

		this.setState({ redeemLoading: true });

		redeemEthValue = web3.utils.toWei(redeemEthValue, 'ether');

		console.log('Redeem value: ', redeemEthValue);

		try {
			let res = await cEth.methods.redeemUnderlying(redeemEthValue).send({
				from: address,
				gasLimit: web3.utils.toHex(1500000),
				gasPrice: web3.utils.toHex(20000000000),
			});

			console.log('Message: ', res);

			await this.getBalances();

			this.setState({
				redeemLoading: false,
				successSnackbarOpen: true,
			});
		} catch (err) {
			await this.getBalances();

			this.setState({ redeemLoading: false, failSnackbarOpen: true });
		}
	};

	borrowDai = async (daiToBorrow) => {
		this.setState({ borrowLoading: true });

		const { web3, cDai } = this.props.values;
		const address = this.state.address;

		try {
			console.log(`Now attempting to borrow ${daiToBorrow} DAI...`);

			await cDai.methods
				.borrow(web3.utils.toWei(daiToBorrow.toString(), 'ether'))
				.send({
					from: address,
					gasLimit: web3.utils.toHex(600000),
					gasPrice: web3.utils.toHex(20000000000),
				});

			console.log('\nFetching DAI borrow balance from cDAI contract...');

			let balance = await cDai.methods
				.borrowBalanceCurrent(address)
				.call();
			balance = balance / 1e18;

			console.log(`Borrow balance is ${balance} DAI`);

			this.setState({
				borrowLoading: false,
				successSnackbarOpen: true,
			});

			this.getBalances();
		} catch (err) {
			this.setState({
				borrowLoading: false,
				failSnackbarOpen: true,
			});
		}
	};

	repayLoan = async (repayValue) => {
		this.setState({ repayLoading: true });

		const { dai, web3, cDai } = this.props.values;
		const address = this.state.address;
		const cDaiAddress = this.props.cDaiAddress;

		console.log(`Now repaying the borrow...`);
		console.log(
			'Approving DAI to be transferred from your wallet to the cDAI contract...'
		);

		try {
			await dai.methods
				.approve(
					cDaiAddress,
					web3.utils.toWei(repayValue.toString(), 'ether')
				)
				.send({
					from: address,
					gasLimit: web3.utils.toHex(100000),
					gasPrice: web3.utils.toHex(20000000000),
				});

			const repayBorrow = await cDai.methods
				.repayBorrow(web3.utils.toWei(repayValue.toString(), 'ether'))
				.send({
					from: address,
					gasLimit: web3.utils.toHex(600000),
					gasPrice: web3.utils.toHex(20000000000),
				});

			if (repayBorrow.events && repayBorrow.events.Failure) {
				const errorCode = repayBorrow.events.Failure.returnValues.error;
				console.error(`repayBorrow error, code ${errorCode}`);
				process.exit(12);
			}

			this.setState({
				repayLoading: false,
				successSnackbarOpen: true,
			});
			console.log(`\nBorrow repaid.\n`);

			this.getBalances();
		} catch (err) {
			this.setState({
				repayLoading: false,
				failSnackbarOpen: true,
			});
		}
	};

	async componentDidMount() {
		this.setState({ address: this.props.values.address }, async () => {
			await this.getBalances();
		});
	}

	render() {
		window.ethereum.on(
			'accountsChanged',
			async function (accounts) {
				this.setState({ address: accounts[0] }, async () => {
					this.getBalances();
				});
			}.bind(this)
		);

		let borrowLimitPercent =
			((this.state.borrowLimitInEth - this.state.liquidity) * 100) /
			this.state.borrowLimitInEth;

		return (
			<div className='app-container'>
				{this.state.address ? (
					<div>
						<Stats
							cEth={this.props.values.cEth}
							address={this.state.address}
							web3={this.props.values.web3}
							borrowBalanceInEth={this.state.borrowBalanceInEth}
						/>
						<div className='nav-account'>
							<img
								src={`data:image/png;base64,${new Identicon(
									this.state.address,
									30
								).toString()}`}
								alt='identicon'
							></img>
							<p id='address'>{this.state.address}</p>
						</div>
					</div>
				) : (
					<CircularProgress />
				)}

				<div className='borrow-limit'>
					<p id='bar-title'>Borrow Limit</p>
					<div className='borrow-bar'>
						<div
							id='borrow-filled'
							style={{ width: `${borrowLimitPercent}%` }}
						></div>
					</div>
					<p id='bar-num'>
						{this.state.borrowLimitInEth ? (
							this.state.borrowLimitInEth
						) : (
							<Skeleton
								animation='wave'
								width={100}
								height={30}
							/>
						)}
					</p>
				</div>

				<div className='flex-container'>
					{this.state.eth_balance ? (
						<div className='supply-container'>
							<Supply
								supplyETH={this.supplyETH}
								eth_balance={this.state.eth_balance}
								supplyLoading={this.state.supplyLoading}
							/>
							<Redeem
								balanceOfUnderlying={
									this.state.balanceOfUnderlying
								}
								redeemLoading={this.state.redeemLoading}
								redeemETH={this.redeemETH}
							/>
						</div>
					) : (
						<Skeleton variant='rect' width={310} height={118} />
					)}
					{this.state.eth_balance ? (
						this.state.marketEntered ? (
							<div className='borrow-container'>
								<Borrow
									borrowLimit={this.state.borrowLimit}
									borrowDai={this.borrowDai}
									borrowLoading={this.state.borrowLoading}
								/>
								<Repay
									repayDai_balance={this.state.borrowBalance}
									repayLoan={this.repayLoan}
									repayLoading={this.state.repayLoading}
								/>
							</div>
						) : this.state.enterMarketLoading ? (
							<div className='borrow-container'>
								<div className='lds-ellipsis'>
									<div></div>
									<div></div>
									<div></div>
									<div></div>
								</div>
							</div>
						) : (
							<div className='borrow-container'>
								<StyledButton
									variant='contained'
									onClick={this.enterMarket}
								>
									Enter Market
								</StyledButton>
							</div>
						)
					) : (
						<Skeleton variant='rect' width={310} height={118} />
					)}
				</div>
				<div
					style={{
						position: 'absolute',
						bottom: '1em',
						left: '1em',
					}}
				>
					<StyledSnackBar
						open={this.state.successSnackbarOpen}
						autoHideDuration={6000}
						onClose={this.handleSnackBarClose}
					>
						<Alert severity='success'>Transaction succeeded!</Alert>
					</StyledSnackBar>
					<StyledSnackBar
						open={this.state.failSnackbarOpen}
						autoHideDuration={6000}
						onClose={this.handleSnackBarClose}
					>
						<Alert severity='error'>
							Transaction either failed or rejected!
						</Alert>
					</StyledSnackBar>
				</div>
			</div>
		);
	}
}

export default withRouter(AppPage);
