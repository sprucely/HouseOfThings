import React from 'react'
import { Button, Form, Header, Input, Modal, Select } from 'semantic-ui-react'

export function AddLocationModal() {
  const [open, setOpen] = React.useState(false)

  return (
    <Modal
      size='small'
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={<Button icon='add square' />}
    >
      <Modal.Header>Add a Location</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <Header>Details of new location</Header>
          <Form>
            <Form.Group widths='equal'>
              <Form.Field
                control={Input}
                label='Location Name'
                placeholder='Location Name'
              />
              <Form.Field
                control={Select}
                label='Location Type'
                //options={options}
                placeholder='Location Type'
              />
            </Form.Group>
            <Form.Group>
              <Form.Field
                width={16}
                control={Input}
                label='Description'
                placeholder='Description'
              />
            </Form.Group>
          </Form>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={() => setOpen(false)}>
          Cancel
          </Button>
        <Button
          content="OK"
          labelPosition='right'
          icon='checkmark'
          onClick={() => setOpen(false)}
          positive
        />
      </Modal.Actions>
    </Modal>
  )
}