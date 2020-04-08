import React from 'react';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

import './styles.css';

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
		backgroundColor: '#00d395',
		color: 'white',
		'&:hover': {
			backgroundColor: '#00d395',
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
			event.target.value <= this.props.balanceOfUnderlying
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
				<p>Redeem</p>
				<StyledTextField
					id='outlined-number'
					label={`${this.props.balanceOfUnderlying} ETH`}
					type='number'
					InputProps={{
						inputProps: {
							max: this.props.balanceOfUnderlying,
						},
					}}
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
