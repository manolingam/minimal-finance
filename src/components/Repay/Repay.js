import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

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
			event.target.value <= this.props.dai_balance
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
				<p>Repay Loan</p>
				<TextField
					id='outlined-number'
					label={`${this.props.dai_balance} DAI`}
					type='number'
					InputProps={{
						inputProps: {
							max: this.props.dai_balance,
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
					<Button
						variant='contained'
						color='primary'
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
					</Button>
				)}
			</div>
		);
	}
}

export default Repay;
