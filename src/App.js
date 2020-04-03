import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Web3 from 'web3';

import Button from '@material-ui/core/Button';
import Identicon from 'identicon.js';

import Home from './components/Home/Home';
import './App.css';

const cEthAddress = '0xf92fbe0d3c0dcdae407923b2ac17ec223b1084e4';
const cEthAbi = require('./abi/cEth.json');
const daiAddress = '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa';
const daiAbi = require('./abi/dai.json');
const cDaiAddress = '0xe7bc397dbd069fc7d0109c0636d06888bb50668c';
const cDaiAbi = require('./abi/cDai.json');
const comptrollerAddress = '0x1f5d7f3caac149fe41b8bd62a3673fe6ec0ab73b';
const comptrollerAbi = require('./abi/comptroller.json');
const priceOracleAddress = '0x6998ed7daf969ea0950e01071aceeee54cccbab5';
const priceOracleAbi = require('./abi/priceOracle.json');

class App extends React.Component {
	constructor() {
		super();
		this.state = {
			provider: '',
			address: '',
			web3: '',
			contracts_init: false,
			eth_balance: '',
			ceth_balance: '',
			dai_balance: '',
			cEth: '',
			comptroller: '',
			priceOracle: '',
			dai: '',
			cDai: ''
		};
	}

	// initialize compound contracts
	initContracts = async () => {
		const web3 = this.state.web3;
		const cEth = await new web3.eth.Contract(cEthAbi, cEthAddress);
		const comptroller = await new web3.eth.Contract(
			comptrollerAbi,
			comptrollerAddress
		);
		const priceOracle = await new web3.eth.Contract(
			priceOracleAbi,
			priceOracleAddress
		);
		const dai = await new web3.eth.Contract(daiAbi, daiAddress);
		const cDai = await new web3.eth.Contract(cDaiAbi, cDaiAddress);
		this.setState({
			cEth,
			comptroller,
			priceOracle,
			dai,
			cDai,
			contracts_init: true
		});
	};

	async componentDidMount() {
		if (typeof window.ethereum !== 'undefined') {
			const web3 = new Web3(window.ethereum);
			const networkID = await web3.eth.net.getId();
			this.setState(
				{ provider: window.ethereum, web3, networkID },
				() => {
					this.initContracts();
				}
			);
		}
	}

	getBalances = async () => {
		const web3 = this.state.web3;
		const wallet_address = this.state.address;
		let eth_balance = +web3.utils.fromWei(
			await web3.eth.getBalance(wallet_address)
		);
		let ceth_balance =
			(await this.state.cEth.methods.balanceOf(wallet_address).call()) /
			1e8;
		let dai_balance =
			+(await this.state.dai.methods.balanceOf(wallet_address).call()) /
			1e18;
		this.setState({ eth_balance, ceth_balance, dai_balance });
	};

	connectAccount = async () => {
		const address = await window.ethereum.enable();
		this.setState({ address: address[0] }, () => {
			this.getBalances();
			console.log(this.state);
		});
	};

	supplyETH = async () => {
		const ethToSupplyAsCollateral = '0.2';

		console.log(
			'\nSupplying ETH to Compound as collateral (you will get cETH in return)...\n'
		);

		await this.state.cEth.methods.mint().send({
			from: this.state.address,
			gasLimit: this.state.web3.utils.toHex(150000),
			gasPrice: this.state.web3.utils.toHex(20000000000),
			value: this.state.web3.utils.toHex(
				this.state.web3.utils.toWei(ethToSupplyAsCollateral, 'ether')
			)
		});

		console.log(
			'\nEntering market (via Comptroller contract) for ETH (as collateral)...'
		);

		let markets = [cEthAddress];
		await this.state.comptroller.methods.enterMarkets(markets).send({
			from: this.state.address,
			gasLimit: this.state.web3.utils.toHex(150000),
			gasPrice: this.state.web3.utils.toHex(20000000000)
		});

		console.log('Calculating your liquid assets in Compound...');

		let {
			1: liquidity
		} = await this.state.comptroller.methods
			.getAccountLiquidity(this.state.address)
			.call();
		liquidity = this.state.web3.utils.fromWei(liquidity).toString();

		console.log('Fetching cETH collateral factor...');

		let {
			1: collateralFactor
		} = await this.state.comptroller.methods.markets(cEthAddress).call();
		collateralFactor = (collateralFactor / 1e18) * 100; // Convert to percent

		console.log('Fetching DAI price from the price oracle...');

		let daiPriceInEth = await this.state.priceOracle.methods
			.getUnderlyingPrice(cDaiAddress)
			.call();
		daiPriceInEth = daiPriceInEth / 1e18;

		console.log('Fetching borrow rate per block for DAI borrowing...');

		let borrowRate = await this.state.cDai.methods
			.borrowRatePerBlock()
			.call();
		borrowRate = borrowRate / 1e18;

		console.log(
			`\nYou have ${liquidity} of LIQUID assets (worth of ETH) pooled in Compound.`
		);
		console.log(
			`You can borrow up to ${collateralFactor}% of your TOTAL assets supplied to Compound as DAI.`
		);
		console.log(`1 DAI == ${daiPriceInEth.toFixed(6)} ETH`);
		console.log(
			`You can borrow up to ${liquidity /
				daiPriceInEth} DAI from Compound.`
		);
		console.log(
			`NEVER borrow near the maximum amount because your account will be instantly liquidated.`
		);
		console.log(
			`\nYour borrowed amount INCREASES (${borrowRate} * borrowed amount) DAI per block.\nThis is based on the current borrow rate.\n`
		);

		this.getBalances();
	};

	borrowDai = async () => {
		const daiToBorrow = 50;

		console.log(`Now attempting to borrow ${daiToBorrow} DAI...`);

		await this.state.cDai.methods
			.borrow(
				this.state.web3.utils.toWei(daiToBorrow.toString(), 'ether')
			)
			.send({
				from: this.state.address,
				gasLimit: this.state.web3.utils.toHex(600000),
				gasPrice: this.state.web3.utils.toHex(20000000000)
			});

		console.log('\nFetching DAI borrow balance from cDAI contract...');

		let balance = await this.state.cDai.methods
			.borrowBalanceCurrent(this.state.address)
			.call();
		balance = balance / 1e18;
		console.log(`Borrow balance is ${balance} DAI`);

		this.getBalances();
	};

	repayDai = async () => {
		const daiToRepay = 50;
		console.log(`Now repaying the borrow...`);
		console.log(
			'Approving DAI to be transferred from your wallet to the cDAI contract...'
		);
		await this.state.dai.methods
			.approve(
				cDaiAddress,
				this.state.web3.utils.toWei(daiToRepay.toString(), 'ether')
			)
			.send({
				from: this.state.address,
				gasLimit: this.state.web3.utils.toHex(100000),
				gasPrice: this.state.web3.utils.toHex(20000000000)
			});

		const repayBorrow = await this.state.cDai.methods
			.repayBorrow(
				this.state.web3.utils.toWei(daiToRepay.toString(), 'ether')
			)
			.send({
				from: this.state.address,
				gasLimit: this.state.web3.utils.toHex(600000),
				gasPrice: this.state.web3.utils.toHex(20000000000)
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
		const tokens = await this.state.cEth.methods
			.balanceOfUnderlying(this.state.address)
			.call();

		console.log(
			'You have the following underlying ether',
			this.state.web3.utils.fromWei(tokens.toString(), 'ether')
		);

		await this.state.cEth.methods
			.redeemUnderlying(
				this.state.web3.utils.toWei((0.4).toString(), 'ether')
			)
			.send({
				from: this.state.address,
				gasLimit: this.state.web3.utils.toHex(600000), // posted at compound.finance/developers#gas-costs
				gasPrice: this.state.web3.utils.toHex(20000000000)
			});

		console.log('Redeemed!');

		this.getBalances();
	};

	render() {
		return this.state.contracts_init ? (
			<Router>
				<nav className='nav'>
					<p
						style={{
							textAlign: 'center',
							fontSize: '1.8em',
							color: '#ffd31d',
							fontWeight: 'bold'
						}}
					>
						Kovan DAI Loans
					</p>
					{this.state.address ? (
						<div>
							<Link to='/' className='nav-buttons'>
								<Button
									variant='contained'
									color='secondary'
									onClick={() => {
										this.setState({ address: '' });
									}}
								>
									Exit
								</Button>
							</Link>
							<div className='nav-account'>
								<img
									src={`data:image/png;base64,${new Identicon(
										this.state.address,
										30
									).toString()}`}
									alt='identicon'
								></img>
								<p>{this.state.address}</p>
							</div>
						</div>
					) : this.state.networkID === 42 ? (
						<Link to='/app' className='nav-buttons'>
							<Button
								variant='contained'
								color='primary'
								onClick={this.connectAccount}
							>
								App
							</Button>
						</Link>
					) : (
						<div className='nav-buttons'>
							<Button
								variant='contained'
								color='primary'
								disabled
							>
								Switch to Kovan
							</Button>
						</div>
					)}
				</nav>
				<Route exact path='/'>
					<Home
						cEth={this.state.cEth}
						cDai={this.state.cDai}
						networkID={this.state.networkID}
					/>
				</Route>
				<Route exact path='/app'>
					<div style={{ marginTop: '10%' }}>
						<div>
							<p>Ether balance: {this.state.eth_balance}</p>
							<p>cETH balance: {this.state.ceth_balance}</p>
							<p>DAI balance: {this.state.dai_balance}</p>
						</div>
						<div>
							<button onClick={this.supplyETH}>Supply</button>
							<button onClick={this.borrowDai}>Borrow</button>
							<button onClick={this.repayDai}>Repay</button>
							<button onClick={this.redeemETH}>Redeem</button>
						</div>
					</div>
				</Route>
			</Router>
		) : (
			<div>Loading...</div>
		);
	}
}

export default App;
