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

let repayValue;

class Repay extends React.Component {
	constructor() {
		super();
		this.state = {
			repayButton: true,
		};
	}

	repayLoanHandler = (event) => {
		if (
			event.target.value &&
			event.target.value > 0 &&
			event.target.value <= this.props.repayDai_balance
		) {
			repayValue = event.target.value;
			this.setState({
				repayButton: false,
			});
		} else {
			this.setState({ repayButton: true });
		}
	};

	render() {
		return (
			<div className='grid-4'>
				<p>Repay</p>
				<StyledTextField
					id='outlined-number'
					label={`${this.props.repayDai_balance} Dai`}
					type='number'
					InputProps={{
						inputProps: {
							max: this.props.repayDai_balance,
						},
					}}
					InputLabelProps={{
						shrink: true,
					}}
					variant='outlined'
					onChange={this.repayLoanHandler}
				/>
				<br></br>
				{this.props.repayLoading ? (
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
							this.setState({ repayButton: true });
							await this.props.repayLoan(repayValue);
							document.querySelector(
								'.grid-4 #outlined-number'
							).value = '';
						}}
						disabled={this.state.repayButton}
					>
						Repay
					</StyledButton>
				)}
			</div>
		);
	}
}

export default Repay;
