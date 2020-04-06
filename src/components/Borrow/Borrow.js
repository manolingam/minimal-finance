import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

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
				<p>Borrow Dai</p>
				{this.props.marketEntered ? (
					<TextField
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
					<Button
						variant='contained'
						color='primary'
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
					</Button>
				) : (
					<Button
						variant='contained'
						color='primary'
						onClick={this.props.enterMarket}
					>
						Enter Market
					</Button>
				)}
			</div>
		);
	}
}

export default Borrow;
