import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Alert from '@material-ui/lab/Alert';

import Home from '../../components/Home/Home';
import './styles.css';

class HomePage extends React.Component {
	constructor() {
		super();
		this.state = {
			is_loaded: false
		};
	}

	async componentDidMount() {
		if (this.props.networkID === 42) {
			const { cEth, cDai } = this.props;
			const cEth_exchangeRate =
				(await cEth.methods.exchangeRateCurrent().call()) / 1e18;
			const cDai_exchangeRate =
				(await cDai.methods.exchangeRateCurrent().call()) / 1e18;
			const cEth_borrows = await cEth.methods
				.totalBorrowsCurrent()
				.call();
			const cDai_borrows = await cDai.methods
				.totalBorrowsCurrent()
				.call();
			const cEth_borrowRate =
				(await cEth.methods.borrowRatePerBlock().call()) / 1e18;
			const cDai_borrowRate =
				(await cDai.methods.borrowRatePerBlock().call()) / 1e18;
			const cEth_tokens = await cEth.methods.totalSupply().call();
			const cDai_tokens = await cDai.methods.totalSupply().call();
			const cEth_supplyRate =
				(await cEth.methods.supplyRatePerBlock().call()) / 1e18;
			const cDai_supplyRate =
				(await cDai.methods.supplyRatePerBlock().call()) / 1e18;

			this.setState({
				cEth_exchangeRate,
				cEth_borrows,
				cEth_borrowRate,
				cEth_tokens,
				cEth_supplyRate,
				cDai_exchangeRate,
				cDai_borrows,
				cDai_borrowRate,
				cDai_tokens,
				cDai_supplyRate,
				is_loaded: true
			});
		}
	}

	render() {
		const values = this.state;
		return (
			<div className='home-container'>
				<p
					style={{
						fontSize: '1.6em',
						color: 'white',
						maxWidth: '30%'
					}}
				>
					Supply Ether, Borrow DAI, Repay DAI, Redeem Ether!
				</p>
				{this.props.networkID === 42 ? (
					this.state.is_loaded ? (
						<Home values={values} />
					) : (
						<div className='loader'>
							<CircularProgress />
						</div>
					)
				) : (
					<Alert severity='error'>
						Oops! Wrong network! Switch to Kovan Network from
						Metamask.
					</Alert>
				)}
			</div>
		);
	}
}

export default HomePage;
