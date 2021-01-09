import React, { SyntheticEvent, useEffect } from 'react';
import { Button, Card, Dimmer, Loader, Ref, Segment, Image, MenuItem, Menu, List, Header } from 'semantic-ui-react';
import { State, useState } from '@hookstate/core';
import { useDrag } from 'react-dnd';
import { TSelectableItemProps, SelectableGroup, createSelectable, SelectAll, DeselectAll } from 'react-selectable-fast';

import { DragData, DragItemTypes, ItemModel } from '../types';
import { getColor } from '../utilities/style-overrides';

type ItemListProps = {
  items: State<ItemModel[]>;
  onEditItem: (editItem: State<ItemModel>) => void;
};


type ItemProps = TSelectableItemProps & {
  item: State<ItemModel>;
  selectedItems: State<ItemModel>[]; // for drag/drop purposes
  onEditItem: (editItem: State<ItemModel>) => void;
}


function ItemCard(props: ItemProps) {
  const {
    item: _item,
    selectedItems,
    onEditItem,
    selectableRef,
    isSelected,
    isSelecting
  } = props;

  const item = useState(_item);

  useEffect(() => {
    if (!item.promised && !item.error) {
      item.merge(i => {
        i.isSelected = isSelected;
        i.isSelecting = isSelecting;
        return i;
      });
    }

  }, [isSelected, isSelecting, item]);

  const handleItemClick = () => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  const handleItemDoubleClick = (e: SyntheticEvent) => {
    onEditItem(item);
    e.preventDefault();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  const [, drag] = useDrag({
    item: {
      type: DragItemTypes.ITEMS,
      dragData: {
        dragItemType: 'items',
        dragItem: selectedItems,
      } as DragData
    },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  })

  return (
    (<Card
      raised={isSelected || isSelecting}
      color={isSelecting ? 'yellow' : isSelected ? 'blue' : undefined}
      onMouseDown={handleItemClick}
      onDoubleClick={handleItemDoubleClick}
    >
      <Ref innerRef={drag}>
        <div>
          <Ref innerRef={selectableRef}>
            <div>
              <Image src='/logo192.png' size='small' />
              <Card.Content>
                <div style={{ backgroundColor: isSelecting ? getColor('yellow') : isSelected ? getColor('blue') : undefined }}>
                <List inverted={isSelecting || isSelected}>
                  <List.Item><Card.Header>{item.name.get()}</Card.Header></List.Item>
                  <List.Item>{item.locationName.get() && <Card.Meta size='small' disabled>Located in {item.locationName.get()}</Card.Meta>}</List.Item>
                  <List.Item>{item.description.get() && <Card.Description size='small'>{item.description.get()}</Card.Description>}</List.Item>
                </List>
                </div>
              </Card.Content>
            </div>
          </Ref>
        </div>
      </Ref>
    </Card>)
  );
}

const SelectableItemCard = createSelectable(ItemCard);


export function ItemList(props: ItemListProps) {
  const {
    items: _items,
    onEditItem,
  } = props;

  const items = useState(_items);
  const [selectedItems, setSelectedItems] = React.useState<State<ItemModel>[]>([]);

  const handleSelecting = () => {
    console.log("selecting");
  }

  const handleSelectionClear = () => {
    console.log("selectionClear");
  }

  const handleSelectionFinish = () => {
    setSelectedItems(items.filter(i => i.isSelected.get()));
  }

  return (<Segment basic>
    <Dimmer active={items.promised} >
      <Loader>Loading</Loader>
    </Dimmer>
    <SelectableGroup
      //className="main"
      //clickClassName="tick"
      enableDeselect
      tolerance={5}
      globalMouse={true}
      allowClickWithoutSelected={false}
      duringSelection={handleSelecting}
      onSelectionClear={handleSelectionClear}
      onSelectionFinish={handleSelectionFinish}
    >
      <SelectAll className="selectable-button">
        <Button>Select all</Button>
      </SelectAll>
      <DeselectAll className="selectable-button">
        <Button>Clear selection</Button>
      </DeselectAll>
      <Card.Group itemsPerRow={3}>
        {!items.promised && !items.error && items.keys.map((i) => (
          <SelectableItemCard key={items[i].id.get()}
            item={items[i]}
            onEditItem={onEditItem}
            selectedItems={selectedItems} />
        ))}
      </Card.Group>
    </SelectableGroup>
  </Segment>
  );
}
