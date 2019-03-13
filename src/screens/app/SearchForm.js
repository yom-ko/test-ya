import React from 'react';
import { Col, Form, FormGroup, Input, CustomInput, Button } from 'reactstrap';

const SearchForm = ({ currentTerm, handleTypePick, handleInputChange }) => (
  <>
    <Form>
      <FormGroup row onClick={handleTypePick}>
        <Button color="link">Departures</Button>
        <Button color="link">Arrivals</Button>
      </FormGroup>
      <FormGroup row style={{ marginBottom: '2.2rem' }}>
        <Col xs={10} sm={10}>
          <Input type="text" value={currentTerm} onChange={handleInputChange} />
        </Col>
        <Col
          xs={2}
          sm={2}
          style={{
            fontSize: '0.9em'
          }}
        >
          <CustomInput type="switch" id="delayedSwitch" name="delayedSwitch" label="Delayed only" />
        </Col>
      </FormGroup>
    </Form>
  </>
);

export default SearchForm;
