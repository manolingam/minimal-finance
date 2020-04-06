import React from 'react';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import './styles.css';

let redeemCEthValue;
let redeemEthValue;
class Redeem extends React.Component {
	constructor() {
		super();
		this.state = {
			redeemCEth_disabled: false,
			redeemEth_disabled: false,
			redeemEthButton: true,
		};
	}

	redeemCEthHandler = (event) => {
		if (event.target.value) {
			this.setState({ redeemEth_disabled: true });
		} else {
			this.setState({
				redeemEth_disabled: false,
			});
		}

		if (
			event.target.value > 0 &&
			event.target.value <= this.props.ceth_balance
		) {
			redeemCEthValue = event.target.value;
			redeemEthValue = '';
			this.setState({
				redeemEthButton: false,
			});
		} else {
			redeemEthValue = '';
			this.setState({ redeemEthButton: true });
		}
	};

	redeemEthHandler = (event) => {
		if (event.target.value) {
			this.setState({
				redeemCEth_disabled: true,
			});
		} else {
			this.setState({
				redeemCEth_disabled: false,
			});
		}

		if (
			event.target.value > 0 &&
			event.target.value <= this.props.balanceOfUnderlying
		) {
			redeemEthValue = event.target.value;
			redeemCEthValue = '';
			this.setState({
				redeemEthButton: false,
			});
		} else {
			redeemCEthValue = '';
			this.setState({ redeemEthButton: true });
		}
	};

	render() {
		return (
			<div className='grid-2'>
				<p>Redeem Ether</p>
				<TextField
					id='outlined-number'
					label={`${this.props.ceth_balance} cETH`}
					type='number'
					InputProps={{
						inputProps: {
							max: this.props.ceth_balance,
						},
					}}
					disabled={this.state.redeemCEth_disabled}
					InputLabelProps={{
						shrink: true,
					}}
					variant='outlined'
					onChange={this.redeemCEthHandler}
				/>
				<br></br>
				<TextField
					id='outlined-number'
					label={`${this.props.balanceOfUnderlying} ETH`}
					type='number'
					InputProps={{
						inputProps: {
							max: this.props.balanceOfUnderlying,
						},
					}}
					disabled={this.state.redeemEth_disabled}
					InputLabelProps={{
						shrink: true,
					}}
					variant='outlined'
					onChange={this.redeemEthHandler}
				/>
				<br></br>
				{this.props.redeemLoading ? (
					<div className='lds-ellipsis'>
						<div></div>
						<div></div>
						<div></div>
						<div></div>
					</div>
				) : (
					<Button
						variant='contained'
						color='primary'
						disabled={this.state.redeemEthButton}
						onClick={async () => {
							this.setState({ redeemEthButton: true });
							await this.props.redeemETH(
								redeemEthValue,
								redeemCEthValue
							);
							document.querySelectorAll(
								'.grid-2 #outlined-number'
							)[0].value = '';
							document.querySelectorAll(
								'.grid-2 #outlined-number'
							)[1].value = '';
						}}
					>
						Redeem
					</Button>
				)}
			</div>
		);
	}
}

export default Redeem;
