import React from 'react';

import liquidAnimation from '../../assets/liquid.gif';

import './styles.css';

class Stats extends React.Component {
	constructor() {
		super();
		this.state = {};
	}

	render() {
		return (
			<div className='stats'>
				<img src={liquidAnimation} alt='floating'></img>
			</div>
		);
	}
}

export default Stats;
