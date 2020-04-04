import React from 'react';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import './styles.css';

let supplyEthValue;

class AppPage extends React.Component {
	constructor() {
		super();
		this.state = {
			statsFetched: false,
			supplyButton: true,
		};
	}

	getBalances = async () => {
		const { cEth, dai } = this.props.values;

		const web3 = this.props.values.web3;
		const wallet_address = this.props.values.address;

		let eth_balance = +web3.utils.fromWei(
			await web3.eth.getBalance(wallet_address)
		);
		let ceth_balance =
			(await cEth.methods.balanceOf(wallet_address).call()) / 1e8;
		let dai_balance =
			+(await dai.methods.balanceOf(wallet_address).call()) / 1e18;
		//balance of underlying (ETH)
		let _balanceOfUnderlying = await cEth.methods
			.balanceOfUnderlying(wallet_address)
			.call();
		let balanceOfUnderlying = web3.utils
			.fromWei(_balanceOfUnderlying)
			.toString();

		this.setState({
			eth_balance,
			ceth_balance,
			dai_balance,
			balanceOfUnderlying,
		});
	};

	accountStat = async () => {
		const {
			cEth,
			address,
			web3,
			priceOracle,
			cDai,
			comptroller,
		} = this.props.values;

		const cEthAddress = this.props.cEthAddress;
		const cDaiAddress = this.props.cDaiAddress;

		//exchange rate of cETH to ETH
		let exchangeRateCurrent = await cEth.methods
			.exchangeRateCurrent()
			.call();
		exchangeRateCurrent = (exchangeRateCurrent / 1e28).toString();
		console.log(
			'Current exchange rate from cETH to ETH:',
			exchangeRateCurrent
		);

		console.log('Calculating your liquid assets in Compound...');

		let { 1: liquidity } = await comptroller.methods
			.getAccountLiquidity(address)
			.call();
		liquidity = web3.utils.fromWei(liquidity).toString();

		console.log('Fetching cETH collateral factor...');

		let { 1: collateralFactor } = await comptroller.methods
			.markets(cEthAddress)
			.call();
		collateralFactor = (collateralFactor / 1e18) * 100; // Convert to percent

		console.log('Fetching DAI price from the price oracle...');

		let daiPriceInEth = await priceOracle.methods
			.getUnderlyingPrice(cDaiAddress)
			.call();
		daiPriceInEth = daiPriceInEth / 1e18;

		console.log('Fetching borrow rate per block for DAI borrowing...');

		let borrowRate = await cDai.methods.borrowRatePerBlock().call();
		borrowRate = borrowRate / 1e18;

		daiPriceInEth = daiPriceInEth.toFixed(6);

		let borrowLimit = liquidity / daiPriceInEth;

		console.log(
			`\nYou have ${liquidity} of LIQUID assets (worth of ETH) pooled in Compound.`
		);
		console.log(
			`You can borrow up to ${collateralFactor}% of your TOTAL assets supplied to Compound as DAI.`
		);
		console.log(`1 DAI == ${daiPriceInEth} ETH`);
		console.log(`You can borrow up to ${borrowLimit} DAI from Compound.`);
		console.log(
			`NEVER borrow near the maximum amount because your account will be instantly liquidated.`
		);
		console.log(
			`\nYour borrowed amount INCREASES (${borrowRate} * borrowed amount) DAI per block.\nThis is based on the current borrow rate.\n`
		);

		this.setState({
			exchangeRateCurrent,
			liquidity,
			collateralFactor,
			daiPriceInEth,
			borrowLimit,
			statsFetched: true,
		});
	};

	supplyETH = async () => {
		if (supplyEthValue) {
			const { cEth, address, web3 } = this.props.values;

			await cEth.methods.mint().send({
				from: address,
				gasLimit: web3.utils.toHex(150000),
				gasPrice: web3.utils.toHex(20000000000),
				value: web3.utils.toHex(
					web3.utils.toWei(supplyEthValue, 'ether')
				),
			});
		}
	};

	enterMarkets = async () => {
		const { comptroller, address, web3 } = this.props.values;
		const cEthAddress = this.props.cEthAddress;

		console.log(
			'\nEntering market (via Comptroller contract) for ETH (as collateral)...'
		);

		let markets = [cEthAddress];
		await comptroller.methods.enterMarkets(markets).send({
			from: address,
			gasLimit: web3.utils.toHex(150000),
			gasPrice: web3.utils.toHex(20000000000),
		});

		this.getBalances();
	};

	borrowDai = async () => {
		const daiToBorrow = 50;
		const { web3, address, cDai } = this.props.values;

		console.log(`Now attempting to borrow ${daiToBorrow} DAI...`);

		await cDai.methods
			.borrow(web3.utils.toWei(daiToBorrow.toString(), 'ether'))
			.send({
				from: address,
				gasLimit: web3.utils.toHex(600000),
				gasPrice: web3.utils.toHex(20000000000),
			});

		console.log('\nFetching DAI borrow balance from cDAI contract...');

		let balance = await cDai.methods.borrowBalanceCurrent(address).call();
		balance = balance / 1e18;

		console.log(`Borrow balance is ${balance} DAI`);

		this.getBalances();
	};

	repayDai = async () => {
		const daiToRepay = 50;
		const { dai, address, web3, cDai } = this.props.values;
		const cDaiAddress = this.props.cDaiAddress;

		console.log(`Now repaying the borrow...`);
		console.log(
			'Approving DAI to be transferred from your wallet to the cDAI contract...'
		);
		await dai.methods
			.approve(
				cDaiAddress,
				web3.utils.toWei(daiToRepay.toString(), 'ether')
			)
			.send({
				from: address,
				gasLimit: web3.utils.toHex(100000),
				gasPrice: web3.utils.toHex(20000000000),
			});

		const repayBorrow = await cDai.methods
			.repayBorrow(web3.utils.toWei(daiToRepay.toString(), 'ether'))
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

		console.log(`\nBorrow repaid.\n`);

		this.getBalances();
	};

	redeemETH = async () => {
		console.log(`Redeeming 18 cETH..`);

		const { cEth, address, web3 } = this.props.values;

		const tokens = await cEth.methods.balanceOfUnderlying(address).call();

		console.log('Exchanging all cETH based on cToken amount...');
		await cEth.methods.redeem(tokens * 1e8).send({
			from: address,
			gasLimit: web3.utils.toHex(150000),
			gasPrice: web3.utils.toHex(20000000000),
		});

		// console.log('Exchanging all cETH based on underlying ETH amount...');
		// let ethAmount = web3.utils.toWei(balanceOfUnderlying).toString()
		// await compoundCEthContract.methods.redeemUnderlying(ethAmount).send({
		//   from: myWalletAddress,
		//   gasLimit: web3.utils.toHex(150000),
		//   gasPrice: web3.utils.toHex(20000000000),
		// });

		this.getBalances();
	};

	async componentDidMount() {
		await this.getBalances();
		await this.accountStat();
	}

	render() {
		return (
			<div className='app-container'>
				{this.state.statsFetched ? (
					<div className='account-stat'>
						<p>
							Your hold
							<span>{this.state.ceth_balance} cEth</span> for
							<span>
								{this.state.balanceOfUnderlying} underlying Eth
							</span>
							. You can either redeem your underlying asset or
							borrow a max of{' '}
							<span>{this.state.borrowLimit} Dai</span>
							whose collateral factor is
							<span>{this.state.collateralFactor}%</span> at the
							rate of <span>{this.state.daiPriceInEth} Eth</span>
							each.
						</p>
					</div>
				) : (
					<CircularProgress />
				)}

				<div className='grid-container'>
					<div className='grid-1'>
						<p>Supply Ether</p>
						<TextField
							id='outlined-number'
							label={`${this.state.eth_balance} ETH`}
							type='number'
							InputLabelProps={{
								shrink: true,
							}}
							variant='outlined'
							onChange={(event) => {
								if (
									event.target.value &&
									event.target.value !== 0
								) {
									supplyEthValue = event.target.value;
									this.setState({ supplyButton: false });
								} else {
									this.setState({ supplyButton: true });
								}
							}}
						/>
						<br></br>
						<Button
							variant='contained'
							color='primary'
							onClick={this.supplyETH}
							disabled={this.state.supplyButton}
						>
							Supply
						</Button>
					</div>
					<div className='grid-2'>
						<p>Redeem Ether</p>
						<TextField
							id='outlined-number'
							label={`${this.state.ceth_balance} cETH`}
							type='number'
							InputLabelProps={{
								shrink: true,
							}}
							variant='outlined'
						/>
						<br></br>
						<TextField
							id='outlined-number'
							label={`${this.state.balanceOfUnderlying} ETH`}
							type='number'
							InputLabelProps={{
								shrink: true,
							}}
							variant='outlined'
						/>
						<br></br>
						<Button variant='contained' color='primary'>
							Redeem
						</Button>
					</div>
					<div className='grid-3'>
						<p>Borrow Dai</p>
						<TextField
							id='outlined-number'
							label={`${this.state.ceth_balance} cETH`}
							type='number'
							InputLabelProps={{
								shrink: true,
							}}
							variant='outlined'
						/>
						<br></br>
						<Button variant='contained' color='primary'>
							Borrow
						</Button>
					</div>
					<div className='grid-4'>
						<p>Repay Loan</p>
						<TextField
							id='outlined-number'
							label={`${this.state.dai_balance} DAI`}
							type='number'
							InputLabelProps={{
								shrink: true,
							}}
							variant='outlined'
						/>
						<br></br>
						<Button variant='contained' color='primary'>
							Repay
						</Button>
					</div>
				</div>
			</div>
		);
	}
}

export default AppPage;
