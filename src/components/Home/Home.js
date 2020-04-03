import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';

const Home = ({ values }) => {
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
	} = values;

	console.log(values);

	return (
		<div className='info-container'>
			<div className='cEth-container'>
				<h3 className='title'>cEth Info</h3>
				<List component='nav' aria-label='main mailbox folders'>
					<ListItem button>
						Exchange Rate: {cEth_exchangeRate}
					</ListItem>
					<Divider />
					<ListItem button>Borrow Rate: {cEth_borrowRate}</ListItem>
					<Divider />
					<ListItem button>Supply Rate: {cEth_supplyRate}</ListItem>
					<Divider />
					<ListItem button>Total Borrows: {cEth_borrows}</ListItem>
					<Divider />
					<ListItem button>Total Tokens: {cEth_tokens}</ListItem>
				</List>
			</div>
			<div className='cDai-container'>
				<h3 className='title'>cDai Info</h3>
				<List component='nav' aria-label='main mailbox folders'>
					<ListItem button>
						Exchange Rate: {cDai_exchangeRate}
					</ListItem>
					<Divider />
					<ListItem button>Borrow Rate: {cDai_borrowRate}</ListItem>
					<Divider />
					<ListItem button>Supply Rate: {cDai_supplyRate}</ListItem>
					<Divider />
					<ListItem button>Total Borrows: {cDai_borrows}</ListItem>
					<Divider />
					<ListItem button>Total Tokens: {cDai_tokens}</ListItem>
				</List>
			</div>{' '}
		</div>
	);
};

export default Home;
