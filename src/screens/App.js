import React, { Component } from 'react';
import { hot } from 'react-hot-loader';

// Import high-level components
import Layout from 'screens/app/Layout';
import SearchForm from 'screens/app/SearchForm';
import FlightTable from 'screens/app/FlightTable';

// Import Bootstrap styles (shared by all components)
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-daterangepicker/daterangepicker.css';

import { getURL, fetchFlights, sanitizeFlights } from 'utils/api';

// App component with routes
class App extends Component {
  constructor(props) {
    super(props);
    this.handleTypePick = this.handleTypePick.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleDelayedPick = this.handleDelayedPick.bind(this);

    this.state = {
      type: 'departure',
      delayedOnly: false,
      currentTerm: '',
      flights: []
    };
  }

  componentDidMount() {
    const { type } = this.state;

    const url = getURL(type);

    fetchFlights(url).then(flights => {
      const newFlights = sanitizeFlights(flights, type);

      this.setState(state => ({
        ...state,
        flights: [...newFlights]
      }));
    });
  }

  handleTypePick(e) {
    e.preventDefault();
    if (e.target.nodeName !== 'BUTTON') return;

    const type = e.target.innerText === 'Departures' ? 'departure' : 'arrival';

    this.setState(
      state => ({
        ...state,
        type
      }),
      () => {
        const url = getURL(type);
        fetchFlights(url).then(flights => {
          const newFlights = sanitizeFlights(flights, type);
          this.setState(state => ({
            ...state,
            flights: [...newFlights]
          }));
        });
      }
    );
  }

  handleInputChange(e) {
    const currentTerm = e.target.value;

    this.setState(state => ({
      ...state,
      currentTerm
    }));
  }

  handleDelayedPick() {
    this.setState(state => {
      const { delayedOnly } = state;
      return {
        ...state,
        delayedOnly: !delayedOnly
      };
    });
  }

  render() {
    const { type, delayedOnly, currentTerm, flights } = this.state;

    return (
      <Layout>
        <h1 style={{ marginBottom: '4.2rem' }}>Time Table</h1>
        <SearchForm
          currentTerm={currentTerm}
          handleTypePick={this.handleTypePick}
          handleInputChange={this.handleInputChange}
          handleDelayedPick={this.handleDelayedPick}
        />
        <FlightTable flights={flights} type={type} delayedOnly={delayedOnly} />
      </Layout>
    );
  }
}

export default hot(module)(App);
