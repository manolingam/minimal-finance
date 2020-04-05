import React from 'react';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import './styles.css';

const Redeem = (props) => {
	return (
		<div className='grid-2'>
			<p>Redeem Ether</p>
			<TextField
				id='outlined-number'
				label={`${props.ceth_balance} cETH`}
				type='number'
				InputProps={{
					inputProps: {
						max: props.ceth_balance,
					},
				}}
				disabled={props.redeemCEth_disabled}
				InputLabelProps={{
					shrink: true,
				}}
				variant='outlined'
				onChange={props.redeemCEthHandler}
			/>
			<br></br>
			<TextField
				id='outlined-number'
				label={`${props.balanceOfUnderlying} ETH`}
				type='number'
				InputProps={{
					inputProps: {
						max: props.balanceOfUnderlying,
					},
				}}
				disabled={props.redeemEth_disabled}
				InputLabelProps={{
					shrink: true,
				}}
				variant='outlined'
				onChange={props.redeemEthHandler}
			/>
			<br></br>
			{props.redeemLoading ? (
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
					disabled={props.redeemEthButton}
					onClick={props.redeemETH}
				>
					Redeem
				</Button>
			)}
		</div>
	);
};

export default Redeem;
