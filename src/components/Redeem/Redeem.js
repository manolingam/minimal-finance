import React from 'react';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

import '../loading.css';

const StyledTextField = withStyles({
	root: {
		'& label.Mui-focused': {
			color: 'black',
		},
		'& .MuiOutlinedInput-root': {
			'&.Mui-focused fieldset': {
				borderColor: 'gray',
			},
		},
	},
})(TextField);

const StyledButton = withStyles(() => ({
	root: {
		backgroundColor: 'hotpink',
		color: 'white',
		'&:hover': {
			backgroundColor: 'hotpink',
		},
	},
}))(Button);

let redeemEthValue;
class Redeem extends React.Component {
	constructor() {
		super();
		this.state = {
			redeemEthButton: true,
		};
	}

	redeemEthHandler = (event) => {
		if (
			event.target.value > 0 &&
			event.target.value <= this.props.ethForReedem
		) {
			redeemEthValue = event.target.value;
			this.setState({ redeemEthButton: false });
		} else {
			this.setState({ redeemEthButton: true });
		}
	};

	render() {
		return (
			<div className='grid-2'>
				<StyledTextField
					id='outlined-number'
					label={`${this.props.ethForReedem} ETH`}
					type='number'
					InputProps={{
						inputProps: {
							max: this.props.ethForReedem,
						},
					}}
					InputLabelProps={{
						shrink: true,
					}}
					variant='outlined'
					disabled={this.props.transactionLoading}
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
					<StyledButton
						variant='contained'
						disabled={this.state.redeemEthButton}
						onClick={async () => {
							this.setState({
								redeemEthButton: true,
							});
							await this.props.redeemETH(redeemEthValue);
							document.querySelector(
								'.grid-2 #outlined-number'
							).value = '';
						}}
					>
						Redeem
					</StyledButton>
				)}
			</div>
		);
	}
}

export default Redeem;
