import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

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
		backgroundColor: '#39c5cc',
		'&:hover': {
			backgroundColor: '#39c5cc',
		},
	},
}))(Button);

let borrowValue;

class Borrow extends React.Component {
	constructor() {
		super();
		this.state = {
			borrowButton: true,
		};
	}

	borrowDaiHandler = (event) => {
		if (
			event.target.value &&
			event.target.value > 0 &&
			event.target.value < this.props.borrowLimit
		) {
			borrowValue = event.target.value;
			this.setState({
				borrowButton: false,
			});
		} else {
			this.setState({ borrowButton: true });
		}
	};

	render() {
		return (
			<div className='grid-3'>
				<p>Borrow</p>
				{this.props.marketEntered ? (
					<StyledTextField
						id='outlined-number'
						label={`${this.props.borrowLimit} Dai`}
						type='number'
						InputProps={{
							inputProps: {
								max: this.props.borrowLimit,
							},
						}}
						InputLabelProps={{
							shrink: true,
						}}
						variant='outlined'
						onChange={this.borrowDaiHandler}
					/>
				) : null}

				<br></br>

				{this.props.borrowLoading || this.props.enterMarketLoading ? (
					<div className='lds-ellipsis'>
						<div></div>
						<div></div>
						<div></div>
						<div></div>
					</div>
				) : this.props.marketEntered ? (
					<StyledButton
						variant='contained'
						onClick={async () => {
							this.setState({ borrowButton: true });
							await this.props.borrowDai(borrowValue);
							document.querySelector(
								'.grid-3 #outlined-number'
							).value = '';
						}}
						disabled={this.state.borrowButton}
					>
						Borrow
					</StyledButton>
				) : (
					<StyledButton
						variant='contained'
						onClick={this.props.enterMarket}
					>
						Enter Market
					</StyledButton>
				)}
			</div>
		);
	}
}

export default Borrow;
