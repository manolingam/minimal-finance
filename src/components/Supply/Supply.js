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

let supplyEthValue;
class Supply extends React.Component {
	constructor() {
		super();
		this.state = {
			supplyButton: true,
		};
	}

	supplyEthHandler = (event) => {
		if (
			event.target.value &&
			event.target.value > 0 &&
			event.target.value <= this.props.eth_balance
		) {
			supplyEthValue = event.target.value;
			this.setState({
				supplyButton: false,
			});
		} else {
			this.setState({ supplyButton: true });
		}
	};

	render() {
		return (
			<div className='grid-1'>
				<p>Supply</p>
				<StyledTextField
					id='outlined-number'
					label={`${this.props.eth_balance} ETH`}
					type='number'
					InputProps={{
						inputProps: {
							max: this.props.eth_balance,
						},
					}}
					InputLabelProps={{
						shrink: true,
					}}
					variant='outlined'
					onChange={this.supplyEthHandler}
				/>
				<br></br>
				{this.props.supplyLoading ? (
					<div className='lds-ellipsis'>
						<div></div>
						<div></div>
						<div></div>
						<div></div>
					</div>
				) : (
					<StyledButton
						variant='contained'
						onClick={async () => {
							this.setState({ supplyButton: true });
							await this.props.supplyETH(supplyEthValue);
							document.querySelector(
								'.grid-1 #outlined-number'
							).value = '';
						}}
						disabled={this.state.supplyButton}
					>
						Supply
					</StyledButton>
				)}
			</div>
		);
	}
}

export default Supply;
