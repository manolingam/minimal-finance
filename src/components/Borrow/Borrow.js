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
				<br></br>
				{this.props.borrowLoading ? (
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
				)}
			</div>
		);
	}
}

export default Borrow;
