import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import CircularProgress from '@material-ui/core/CircularProgress';
import Alert from '@material-ui/lab/Alert';

import './styles.css';

class Home extends React.Component {
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
		const {
			cEth_exchangeRate,
			cEth_borrows,
			cEth_borrowRate,
			cEth_tokens,
			cEth_supplyRate,
			cDai_exchangeRate,
			cDai_borrows,
			cDai_borrowRate,
			cDai_tokens,
			cDai_supplyRate
		} = this.state;

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
						<div className='info-container'>
							<div className='cEth-container'>
								<h3 className='title'>cEth Info</h3>
								<List
									component='nav'
									aria-label='main mailbox folders'
								>
									<ListItem button>
										Exchange Rate: {cEth_exchangeRate}
									</ListItem>
									<Divider />
									<ListItem button>
										Borrow Rate: {cEth_borrowRate}
									</ListItem>
									<Divider />
									<ListItem button>
										Supply Rate: {cEth_supplyRate}
									</ListItem>
									<Divider />
									<ListItem button>
										Total Borrows: {cEth_borrows}
									</ListItem>
									<Divider />
									<ListItem button>
										Total Tokens: {cEth_tokens}
									</ListItem>
								</List>
							</div>
							<div className='cDai-container'>
								<h3 className='title'>cDai Info</h3>
								<List
									component='nav'
									aria-label='main mailbox folders'
								>
									<ListItem button>
										Exchange Rate: {cDai_exchangeRate}
									</ListItem>
									<Divider />
									<ListItem button>
										Borrow Rate: {cDai_borrowRate}
									</ListItem>
									<Divider />
									<ListItem button>
										Supply Rate: {cDai_supplyRate}
									</ListItem>
									<Divider />
									<ListItem button>
										Total Borrows: {cDai_borrows}
									</ListItem>
									<Divider />
									<ListItem button>
										Total Tokens: {cDai_tokens}
									</ListItem>
								</List>
							</div>{' '}
						</div>
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

export default Home;
