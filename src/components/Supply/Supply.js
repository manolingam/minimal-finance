import React from 'react';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import './styles.css';

const Supply = (props) => {
	return (
		<div className='grid-1'>
			<p>Supply Ether</p>
			<TextField
				id='outlined-number'
				label={`${props.eth_balance} ETH`}
				type='number'
				InputProps={{
					inputProps: {
						min: 1,
						max: props.eth_balance,
					},
				}}
				InputLabelProps={{
					shrink: true,
				}}
				variant='outlined'
				onChange={props.supplyEthHandler}
			/>
			<br></br>
			{props.supplyLoading ? (
				<div class='lds-ellipsis'>
					<div></div>
					<div></div>
					<div></div>
					<div></div>
				</div>
			) : (
				<Button
					variant='contained'
					color='primary'
					onClick={props.supplyETH}
					disabled={props.supplyButton}
				>
					Supply
				</Button>
			)}
		</div>
	);
};

export default Supply;
