import React from 'react';
import { Col, Form, FormGroup, Input, Button } from 'reactstrap';

import DatePicker from 'components/DatePicker';

const SearchForm = ({
  startDate,
  currentTerm,
  handleTypePick,
  handleInputChange,
  handleDatePick
}) => (
  <>
    <Form>
      <FormGroup row onClick={handleTypePick}>
        <Button color="link">Departures</Button>
        <Button color="link">Arrivals</Button>
      </FormGroup>
      <FormGroup row style={{ marginBottom: '2.2rem' }}>
        <Col xs={6} sm={8}>
          <Input type="text" value={currentTerm} onChange={handleInputChange} />
        </Col>
        <Col xs={6} sm={3}>
          <DatePicker startDate={startDate} handleDatePick={handleDatePick} />
        </Col>
      </FormGroup>
    </Form>
  </>
);

export default SearchForm;
