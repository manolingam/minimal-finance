import React from 'react';
import { withRouter } from 'react-router-dom';
import Identicon from 'identicon.js';

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
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
import { CircularProgress } from '@material-ui/core';

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
			statsFetched: false,
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
		const { cEth, dai, comptroller, priceOracle } = this.props.values;
		const cDaiAddress = this.props.cDaiAddress;

		const web3 = this.props.values.web3;
		const wallet_address = this.state.address;

		let eth_balance = +web3.utils.fromWei(
			await web3.eth.getBalance(wallet_address)
		);
		let ceth_balance =
			(await cEth.methods.balanceOf(wallet_address).call()) / 1e8;
		let dai_balance =
			+(await dai.methods.balanceOf(wallet_address).call()) / 1e18;

		let _balanceOfUnderlying = await cEth.methods
			.balanceOfUnderlying(wallet_address)
			.call();
		let balanceOfUnderlying = web3.utils
			.fromWei(_balanceOfUnderlying)
			.toString();

		let { 1: liquidity } = await comptroller.methods
			.getAccountLiquidity(wallet_address)
			.call();
		liquidity = web3.utils.fromWei(liquidity).toString();

		let daiPriceInEth = await priceOracle.methods
			.getUnderlyingPrice(cDaiAddress)
			.call();
		daiPriceInEth = daiPriceInEth / 1e18;

		daiPriceInEth = daiPriceInEth.toFixed(6);

		let borrowLimit = liquidity / daiPriceInEth;

		this.setState({
			eth_balance,
			ceth_balance,
			dai_balance,
			balanceOfUnderlying,
			borrowLimit,
			marketEntered: liquidity === '0' ? false : true,
		});
	};

	accountStat = async () => {
		const { cEth, cDai, comptroller } = this.props.values;

		const cEthAddress = this.props.cEthAddress;

		//exchange rate of cETH to ETH
		let exchangeRateCurrent = await cEth.methods
			.exchangeRateCurrent()
			.call();
		exchangeRateCurrent = (exchangeRateCurrent / 1e28).toString();
		console.log(
			'Current exchange rate from cETH to ETH:',
			exchangeRateCurrent
		);

		console.log('Fetching cETH collateral factor...');

		let { 1: collateralFactor } = await comptroller.methods
			.markets(cEthAddress)
			.call();
		collateralFactor = (collateralFactor / 1e18) * 100; // Convert to percent

		console.log('Fetching borrow rate per block for DAI borrowing...');

		let borrowRate = await cDai.methods.borrowRatePerBlock().call();
		borrowRate = borrowRate / 1e18;

		console.log(
			`You can borrow up to ${collateralFactor}% of your TOTAL assets supplied to Compound as DAI.`
		);
		// console.log(`1 DAI == ${daiPriceInEth} ETH`);
		console.log(
			`NEVER borrow near the maximum amount because your account will be instantly liquidated.`
		);
		console.log(
			`\nYour borrowed amount INCREASES (${borrowRate} * borrowed amount) DAI per block.\nThis is based on the current borrow rate.\n`
		);

		this.setState({
			exchangeRateCurrent,

			collateralFactor,

			statsFetched: true,
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

	redeemETH = async (redeemEthValue, redeemCEthValue) => {
		const { cEth, web3 } = this.props.values;
		const address = this.state.address;

		if (redeemCEthValue) {
			this.setState({ redeemLoading: true });

			try {
				await cEth.methods.redeem(redeemCEthValue * 1e8).send({
					from: address,
					gasLimit: web3.utils.toHex(1500000),
					gasPrice: web3.utils.toHex(20000000000),
				});

				await this.getBalances();

				this.setState({
					redeemLoading: false,
					successSnackbarOpen: true,
				});
			} catch (err) {
				await this.getBalances();

				this.setState({ redeemLoading: false, failSnackbarOpen: true });
			}
		} else if (redeemEthValue) {
			this.setState({ redeemLoading: true });

			try {
				let ethAmount = web3.utils.toWei(redeemEthValue).toString();
				await cEth.methods.redeemUnderlying(ethAmount).send({
					from: address,
					gasLimit: web3.utils.toHex(1500000),
					gasPrice: web3.utils.toHex(20000000000),
				});

				await this.getBalances();

				this.setState({
					redeemLoading: false,
					successSnackbarOpen: true,
				});
			} catch (err) {
				this.setState({ redeemLoading: false, failSnackbarOpen: true });
			}
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

		return (
			<div className='app-container'>
				{this.state.address ? (
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
				) : (
					<CircularProgress />
				)}

				<div className='grid-container'>
					<Supply
						supplyETH={this.supplyETH}
						eth_balance={this.state.eth_balance}
						supplyLoading={this.state.supplyLoading}
					/>
					<Redeem
						ceth_balance={this.state.ceth_balance}
						balanceOfUnderlying={this.state.balanceOfUnderlying}
						redeemLoading={this.state.redeemLoading}
						redeemETH={this.redeemETH}
					/>

					<Borrow
						borrowLimit={this.state.borrowLimit}
						borrowDai={this.borrowDai}
						borrowLoading={this.state.borrowLoading}
						marketEntered={this.state.marketEntered}
						enterMarketLoading={this.state.enterMarketLoading}
						enterMarket={this.enterMarket}
					/>
					<Repay
						dai_balance={this.state.dai_balance}
						repayLoan={this.repayLoan}
						repayLoading={this.state.repayLoading}
					/>
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
