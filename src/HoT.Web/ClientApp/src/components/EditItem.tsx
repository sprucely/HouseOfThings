import { State, useState } from '@hookstate/core';
import React from 'react'
import { Form, Input, Segment } from 'semantic-ui-react'

import { ItemModel } from '../types'

type EditItemProps = {
  item: State<ItemModel>
}

export function EditItem(props: EditItemProps) {
  const { item: _item } = props;

  const item = useState(_item);

  return (
    <Segment basic>
      <Form>
        <Form.Group widths='equal'>
          <Form.Field
            control={Input}
            label='Location Name'
            placeholder='Location Name'
            value={item.name.get() || ""}
            onChange={(_: any, { value }: { value: string }) => item.name.set(value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Field
            width={16}
            control={Input}
            label='Description'
            placeholder='Description'
            value={item.description.get() || ""}
            onChange={(_: any, { value }: { value: string }) => item.description.set(value)}
          />
        </Form.Group>
      </Form>
    </Segment>
  )
}