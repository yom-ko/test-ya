import React, { PureComponent } from 'react';
import { hot } from 'react-hot-loader';

// Import high-level components
import Layout from 'screens/app/Layout';
import SearchForm from 'screens/app/SearchForm';
import FlightTable from 'screens/app/FlightTable';

// Import Bootstrap styles (shared by all components)
import 'bootstrap/dist/css/bootstrap.css';

import { receiveFlights } from 'utils/helpers';

// App component with routes
class App extends PureComponent {
  constructor(props) {
    super(props);
    this.handleTypePick = this.handleTypePick.bind(this);
    this.handleDelayedPick = this.handleDelayedPick.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);

    // Initial app state
    this.state = {
      type: 'departure',
      delayedOnly: false,
      currentTerm: '',
      isLoading: true,
      flights: []
    };
  }

  // Receive and save departures list on page load
  componentDidMount() {
    const { type } = this.state;

    receiveFlights(type).then(flights => {
      this.setState(state => ({
        ...state,
        isLoading: false,
        flights: [...flights]
      }));
    });
  }

  // Receive an updated list of departures or arrivals
  // depending on the flight type button clicked.
  handleTypePick(e) {
    if (e.target.nodeName !== 'BUTTON') return;
    e.preventDefault();

    const type = e.target.value;

    this.setState(state => ({
      ...state,
      isLoading: true,
      type
    }));

    receiveFlights(type).then(flights => {
      this.setState(state => ({
        ...state,
        isLoading: false,
        flights: [...flights]
      }));
    });
  }

  // If the `Delayed only` toggle has been clicked,
  // change the app state accordingly.
  handleDelayedPick() {
    this.setState(state => ({
      ...state,
      delayedOnly: !state.delayedOnly
    }));
  }

  // Save the current user's input as
  // she is typing in the search field.
  handleInputChange(e) {
    const currentTerm = e.target.value;

    this.setState(state => ({
      ...state,
      currentTerm
    }));
  }

  // Render the entire app
  render() {
    const { type, delayedOnly, isLoading, currentTerm, flights } = this.state;

    return (
      <Layout>
        <h1 style={{ fontSize: '1.8em', marginBottom: '4.2rem' }}>Табло рейсов Шереметьево</h1>
        <SearchForm
          type={type}
          handleTypePick={this.handleTypePick}
          handleDelayedPick={this.handleDelayedPick}
          handleInputChange={this.handleInputChange}
        />
        <FlightTable
          type={type}
          delayedOnly={delayedOnly}
          currentTerm={currentTerm}
          isLoading={isLoading}
          flights={flights}
        />
      </Layout>
    );
  }
}

export default hot(module)(App);
