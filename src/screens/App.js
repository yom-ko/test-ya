import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
// import * as moment from 'moment';

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
    this.handleDatePick = this.handleDatePick.bind(this);

    this.today = new Date();
    this.defaultStartDate = `${this.today.getFullYear()}-${`0${this.today.getMonth() + 1}`.slice(
      -2
    )}-${this.today.getDate()}`;

    this.state = {
      startDate: this.defaultStartDate,
      type: 'departure',
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

  handleDatePick(_, { startDate }) {
    const startDateString = startDate.format('YYYY-MM-DD');

    this.setState(state => ({
      ...state,
      startDate: startDateString
    }));
  }

  render() {
    const { startDate, type, currentTerm, flights } = this.state;

    return (
      <Layout>
        <h1 style={{ marginBottom: '4.2rem' }}>Time Table</h1>
        <SearchForm
          startDate={startDate}
          currentTerm={currentTerm}
          handleTypePick={this.handleTypePick}
          handleInputChange={this.handleInputChange}
          handleDatePick={this.handleDatePick}
        />
        <FlightTable flights={flights} type={type} />
      </Layout>
    );
  }
}

export default hot(module)(App);
