import React, { SyntheticEvent } from 'react';
import { Card, Dimmer, Loader, Ref, Segment, Image } from 'semantic-ui-react';
import { State, useState } from '@hookstate/core';
import { useDrag } from 'react-dnd'

import { DragData, DragItemTypes, DropData, ItemModel } from '../types';

type ItemListProps = {
  items: State<ItemModel[]>;
  onActivateItem: (activatedItem: State<ItemModel>) => void;
};


type ItemProps = {
  item: State<ItemModel>;
  onActivateItem: (activatedItem: State<ItemModel>) => void;
}


function ItemCard(props: ItemProps) {
  const {
    item: _item,
    onActivateItem,
  } = props;

  const item = useState(_item);

  const handleItemClick = () => {
    if (!item.isActive.get()) {
      onActivateItem(item);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  const handleItemDoubleClick = (e: SyntheticEvent) => {
    e.preventDefault();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  const [, drag] = useDrag({
    item: {
      type: DragItemTypes.LOCATION,
      dragData: {
        dragItemType: 'item',
        dragItem: [],
      } as DragData
    },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  })


  return (
    (<Card
      active={!item.promised && !item.error && item.isActive.get()}
      color={!item.promised && !item.error && item.isActive.get() ? 'blue' : undefined}
      onMouseDown={handleItemClick}
      onDoubleClick={handleItemDoubleClick}
      raised={item.isActive.get()}


    >
      <Ref innerRef={drag}>
        <div>
          <Image src='/logo192.png' size='small' />
          <Card.Content>
            <Card.Header>{item.name.get()}</Card.Header>
            {item.locationName.get() && <Card.Meta>Located in {item.locationName.get()}</Card.Meta>}
            {item.description.get() && <Card.Description>{item.description.get()}</Card.Description>}
          </Card.Content>
        </div>
      </Ref>
    </Card>)
  );
}


export function ItemList(props: ItemListProps) {
  const {
    items: _items,
    onActivateItem,
  } = props;

  const items = useState(_items);

  return (<Segment basic>
    <Dimmer active={items.promised} >
      <Loader>Loading</Loader>
    </Dimmer>
    <Card.Group itemsPerRow={3}>
      {!items.promised && !items.error && items.keys.map((i) => (
        <ItemCard key={items[i].id.get()}
          item={items[i]}
          onActivateItem={onActivateItem} />
      ))}
    </Card.Group>
  </Segment>
  );
}
