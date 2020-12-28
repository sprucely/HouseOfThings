import { createState, State, useState } from '@hookstate/core';
import React from 'react'
import { Button, Form, Input, Modal, Select } from 'semantic-ui-react'

import { LocationModel, LocationTypeModel } from '../types'
import { fetchLocationTypes } from '../services/data';
import { clone } from '../utilities/state';

type EditLocationProps = {
  action: "Add" | "Edit";
  onOpen?: () => State<LocationModel> | null;
  // editedLocation will be null when modal is cancelled
  onClose: (editedLocation: LocationModel | null) => void;
  trigger: React.ReactNode
}

type Event = React.ChangeEvent<HTMLInputElement>;

const defaultLocationGlobal = createState<LocationModel>({
  id: 0,
  parentId: 0,
  rootId: 0,
  depth: 0,
  path: "",
  moveable: true,
  name: undefined,
  description: undefined,
  expanded: true,
  locationType: "House",
  isActive: false,
  isDefault: true
})

export function EditLocationModal(props: EditLocationProps) {
  const { onOpen, onClose, action, trigger } = props;

  const location = useState(clone(defaultLocationGlobal.value));
  const defaultLocationType = useState(defaultLocationGlobal.locationType);

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

  const open = useState(false);

  function closeModal(acceptEdits: boolean) {
    const resultState = acceptEdits ? clone(location.value) : null

    open.set(false);
    onClose(resultState);
  }

  function openModal() {
    if (!locationTypes.promised && !locationTypes.error && locationTypes.length === 0) {
      locationTypes.set(fetchLocationTypes());
    }

    if (action === "Add") {
      location.merge(clone(defaultLocationGlobal.value))
    } else {
      const openingLocation = (onOpen && onOpen()) || null;
      if (openingLocation) {
        location.merge(clone(openingLocation.value))
      }
    }

    open.set(true);
  }

  return (
    <Modal
      size='small'
      onClose={() => closeModal(false)}
      onOpen={() => openModal()}
      open={open.get()}
      trigger={trigger}
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
                  defaultLocationType.set(value);
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