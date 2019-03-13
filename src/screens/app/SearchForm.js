import React from 'react';
import { Col, Form, FormGroup, Input, CustomInput, Button, ButtonGroup } from 'reactstrap';

const SearchForm = ({
  type,
  currentTerm,
  handleTypePick,
  handleInputChange,
  handleDelayedPick
}) => (
  <>
    <Form>
      <FormGroup row onClick={handleTypePick}>
        <Col>
          <ButtonGroup>
            <Button color="info" value="departure" active={type === 'departure'}>
              Departures
            </Button>
            <Button color="info" value="arrival" active={type === 'arrival'}>
              Arrivals
            </Button>
          </ButtonGroup>
        </Col>
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
          <CustomInput
            type="switch"
            id="delayedSwitch"
            name="delayedSwitch"
            label="Delayed only"
            onClick={handleDelayedPick}
          />
        </Col>
      </FormGroup>
    </Form>
  </>
);

export default SearchForm;
