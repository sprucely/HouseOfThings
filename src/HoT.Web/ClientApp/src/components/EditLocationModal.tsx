import { createState, State, useState } from '@hookstate/core';
import React, { useEffect } from 'react'
import { Button, Form, Header, Input, Modal, Popup, Select } from 'semantic-ui-react'
import { LocationModel, LocationTypeModel } from '../types'
import { fetchLocationTypes, createLocation } from '../services/data';

type EditLocationProps = {
  action: "Add" | "Edit";
  location?: State<LocationModel>;
  // editedLocation will be null when modal is cancelled
  onClose: (editedLocation: LocationModel | null) => void;
}

type Event = React.ChangeEvent<HTMLInputElement>;

const defaultLocationGlobal = createState<LocationModel>({
  id: 0,
  parentId: 0,
  moveable: true,
  name: undefined,
  description: undefined,
  expanded: true,
  locationType: "House",
  children: []
})


export function EditLocationModal(props: EditLocationProps) {
  const { location: originalLocation, onClose, action } = props;

  const defaultLocation = useState(defaultLocationGlobal);

  // clone location for local editing without affecting state that was passed in
  const location = useState(JSON.parse(JSON.stringify(originalLocation?.get() || defaultLocation.get())) as LocationModel);

  const locationTypes = useState(fetchLocationTypes());

  const locationTypeOptions = (!locationTypes.promised && !locationTypes.error && locationTypes.keys.map(i => {
    const name = locationTypes[i].name.get();
    return {
      key: name,
      value: name,
      text: name,
      icon: { className: locationTypes[i].iconClass.get() }
    }
  })) || [];

  const open = useState(false);

  // State<> objects don't seem to play nicely with useEffect, so get immediate state...
  const isOpen = open.get();
  useEffect(() => {
    if (isOpen && !Boolean(originalLocation)) {
      location.locationType.set(JSON.parse(JSON.stringify(defaultLocation.locationType.get())));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  function closeModal(acceptEdits: boolean) {
    const result = (acceptEdits && JSON.parse(JSON.stringify(location.get()))) || null;
    open.set(false);
    location.set(JSON.parse(JSON.stringify(originalLocation?.get() || defaultLocation.get())));
    onClose(result);
  }

  return (
    <Modal
      size='small'
      onClose={() => closeModal(false)}
      onOpen={() => open.set(true)}
      open={open.get()}
      trigger={<Popup content='Add Storage' trigger={<Button icon='add square' onClick={() => open.set(true)} />} />}
    >
      <Modal.Header>{action} Location</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <Form>
            <Form.Group widths='equal'>
              <Form.Field
                control={Input}
                label='Location Name'
                placeholder='Location Name'
                value={location.name.get()}
                onChange={(e: Event) => location.name.set(e.target.value)}
              />
              <Form.Field
                control={Select}
                label='Location Type'
                placeholder='Location Type'
                value={location.locationType.get()}
                onChange={(_: any, { value }: { value: string }) => {
                  location.locationType.set(value);
                  defaultLocation.locationType.set(value);
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
                value={location.description.get()}
                onChange={(e: Event) => location.description.set(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={() => closeModal(false)}>
          Cancel
          </Button>
        <Button
          content="OK"
          labelPosition='right'
          icon='checkmark'
          onClick={() => closeModal(true)}
          positive
        />
      </Modal.Actions>
    </Modal>
  )
}