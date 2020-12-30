import { createState, State, useState } from '@hookstate/core';
import React, { useEffect } from 'react'
import { Form, Input, Segment, Select } from 'semantic-ui-react'

import { LocationModel, LocationTypeModel } from '../types'
import { fetchLocationTypes } from '../services/data';

type EditLocationProps = {
  location: State<LocationModel>
}

export const editLocationDefaultsGlobal = createState({ locationType: "Default" });

export function EditLocation(props: EditLocationProps) {
  const { location: _location } = props;

  const location = useState(_location);
  const editLocationDefaults = useState(editLocationDefaultsGlobal);

  const locationTypes = useState<LocationTypeModel[]>([]);

  const locationTypeOptions = (!locationTypes.promised && !locationTypes.error && locationTypes.keys.map(i => {
    const name = locationTypes[i].name.get();
    return {
      key: name,
      value: name,
      text: name,
      icon: { className: locationTypes[i].iconClass.get() }
    }
  })) || [];

  useEffect(()=>{
    if (!locationTypes.promised && !locationTypes.error && locationTypes.length === 0) {
      locationTypes.set(fetchLocationTypes());
    }
  },[locationTypes]);

  return (
    <Segment basic>
      <Form>
        <Form.Group widths='equal'>
          <Form.Field
            control={Input}
            label='Location Name'
            placeholder='Location Name'
            value={location.name.get() || ""}
            onChange={(_: any, { value }: { value: string }) => location.name.set(value)}
          />
          <Form.Field
            control={Select}
            label='Location Type'
            placeholder='Location Type'
            value={location.locationType.get()}
            onChange={(_: any, { value }: { value: string }) => {
              location.locationType.set(value);
              editLocationDefaults.locationType.set(value);
            }}
          options={locationTypeOptions}
          />
        </Form.Group>
        <Form.Group>
          <Form.Field
            width={16}
            control={Input}
            label='Description'
            placeholder='Description'
            value={location.description.get() || ""}
            onChange={(_: any, { value }: { value: string }) => location.description.set(value)}
          />
        </Form.Group>
      </Form>
    </Segment>
  )
}