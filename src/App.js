import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Web3 from 'web3';
import 'animate.css';

import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

import HomePage from './pages/HomePage/HomePage';
import AppPage from './pages/AppPage/AppPage';
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

const StyledButton = withStyles({
	label: {
		color: 'black;',
	},
})(Button);

class App extends React.Component {
	constructor() {
		super();
		this.state = {
			initFinished: false,
			web3Browser: false,
			provider: '',
			address: '',
			web3: '',
			contracts_init: false,
			cEth: '',
			comptroller: '',
			priceOracle: '',
			dai: '',
			cDai: '',
		};
	}

	// initialize compound contracts
	init = async () => {
		if (typeof window.ethereum !== 'undefined') {
			const web3 = new Web3(window.ethereum);
			const networkID = await web3.eth.net.getId();
			const cEth = new web3.eth.Contract(cEthAbi, cEthAddress);
			const comptroller = new web3.eth.Contract(
				comptrollerAbi,
				comptrollerAddress
			);
			const priceOracle = new web3.eth.Contract(
				priceOracleAbi,
				priceOracleAddress
			);
			const dai = new web3.eth.Contract(daiAbi, daiAddress);
			const cDai = new web3.eth.Contract(cDaiAbi, cDaiAddress);
			this.setState({
				cEth,
				comptroller,
				priceOracle,
				dai,
				cDai,
				web3,
				networkID,
				contracts_init: true,
				provider: window.ethereum,
				web3Browser: true,
				initFinished: true,
			});
		} else {
			this.setState({ web3Browser: false, initFinished: true });
		}
	};

	async componentDidMount() {
		await this.init();
	}

	connectAccount = async () => {
		try {
			this.setState({ connectLoading: true });
			const address = await window.ethereum.enable();
			this.setState({ address: address[0], connectLoading: false });
		} catch (err) {
			this.setState({ connectLoading: false });
		}
	};

	render() {
		const values = this.state;

		return this.state.initFinished ? (
			<Router>
				<Route exact path='/'>
					<HomePage
						networkID={this.state.networkID}
						cEth={this.state.cEth}
						cDai={this.state.cDai}
						web3={this.state.web3}
						connectAccount={this.connectAccount}
						web3Browser={this.state.web3Browser}
					/>
				</Route>
				<Route exact path='/app'>
					{this.state.address ? (
						<AppPage
							values={values}
							cEthAddress={cEthAddress}
							cDaiAddress={cDaiAddress}
						/>
					) : this.state.connectLoading ? (
						<div></div>
					) : (
						<div className='unauthorized'>
							<p className='animated flash'>
								Unauthorized route!
							</p>
							<Link to='/' className='nav-buttons'>
								<StyledButton variant='outlined'>
									Home
								</StyledButton>
							</Link>
						</div>
					)}
				</Route>
			</Router>
		) : (
			<div></div>
		);
	}
}

export default App;
