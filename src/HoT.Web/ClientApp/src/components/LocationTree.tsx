import React, { SyntheticEvent } from 'react';
import { Button, Dimmer, Grid, Icon, List, ListDescription, ListHeader, Loader, Popup, Ref, Segment } from 'semantic-ui-react';
import { createState, State, useState } from '@hookstate/core';
import { useDrag, useDrop } from 'react-dnd'

import { DragData, DragDataItem, DragItemTypes, DropData, LocationModel } from '../types';
import { getLocationTypeIconClasses } from '../services/data';
import { isInPath } from '../utilities/location-path';

type LocationTreeProps = {
  locations: State<LocationModel[]>;
  draggingLocation: State<LocationModel> | null;
  onActivateLocation: (activatedLocation: State<LocationModel>) => void;
  onEnterLocation: (enteredLocation: State<LocationModel>) => void;
  onExitLocation: (exitedLocation: State<LocationModel>) => void;
  onEditLocation: (editLocation: State<LocationModel>) => void;
  onCanDropData: (data: DropData) => boolean;
  onDropData: (data: DropData) => void;
};


type LocationTreeItemProps = {
  location: State<LocationModel>;
  draggingLocation: State<LocationModel> | null;
  itemIndex?: number;
  onActivateLocation: (activatedLocation: State<LocationModel>) => void;
  onEnterLocation: (enteredLocation: State<LocationModel>) => void;
  onExitLocation: (exitedLocation: State<LocationModel>) => void;
  onEditLocation: (editLocation: State<LocationModel>) => void;
  onCanDropData: (data: DropData) => boolean;
  onDropData: (data: DropData) => void;
}

const iconClassesGlobal = createState(getLocationTypeIconClasses());

function LocationTreeItem(props: LocationTreeItemProps) {
  const { location: _location,
    itemIndex,
    draggingLocation,
    onActivateLocation,
    onEnterLocation,
    onExitLocation,
    onEditLocation,
    onCanDropData,
    onDropData
  } = props;

  const location = useState(_location);
  const iconClasses = useState(iconClassesGlobal);
  const draggingLocationPath = (draggingLocation && draggingLocation.nested('path').get()) || null;

  const handleItemClick = (e: SyntheticEvent) => {
    if (!location.isActive.get()) {
      onActivateLocation(location);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  const handleItemDoubleClick = (e: SyntheticEvent) => {
    onEditLocation(location);
    e.preventDefault();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  const [, drag] = useDrag({
    item: {
      type: DragItemTypes.LOCATION,
      dragData: {
        dragItemType: 'location',
        dragItem: location,
      } as DragData
    },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  })

  const [{ isDroppingAsChild }, dropChild] = useDrop({
    accept: DragItemTypes.LOCATION,
    drop: (item, monitor) => {
      const { dragData } = item as DragDataItem;
      onDropData({ ...dragData, dropTarget: location, targetPlacement: 'child' });
    },
    canDrop: (item, monitor) => {
      const { dragData } = item as DragDataItem;
      return onCanDropData({ ...dragData, dropTarget: location, targetPlacement: 'child' });
    },
    collect: (monitor) => {
      return {
        isDroppingAsChild: !!monitor.isOver()
      };
    }
  })

  const [{ isDroppingAsSibling }, dropSibling] = useDrop({
    accept: DragItemTypes.LOCATION,
    drop: (item, monitor) => {
      const { dragData } = item as DragDataItem;
      onDropData({ ...dragData, dropTarget: location, targetPlacement: 'sibling' });
    },
    canDrop: (item, monitor) => {
      const { dragData } = item as DragDataItem;
      return onCanDropData({ ...dragData, dropTarget: location, targetPlacement: 'sibling' });
    },
    collect: (monitor) => {
      return {
        isDroppingAsSibling: !!monitor.isOver()
      };
    }
  })

  const [{ isDroppingItems }, dropItems] = useDrop({
    accept: DragItemTypes.ITEMS,
    drop: (item, monitor) => {
      const { dragData } = item as DragDataItem;
      onDropData({ ...dragData, dropTarget: location, targetPlacement: 'child' });
    },
    canDrop: (item, monitor) => {
      const { dragData } = item as DragDataItem;
      return onCanDropData({ ...dragData, dropTarget: location, targetPlacement: 'child' });
    },
    collect: (monitor) => {
      return {
        isDroppingItems: !!monitor.isOver()
      };
    }
  })

  const disableForDrops = (draggingLocationPath && isInPath(draggingLocationPath, location.nested('path').get())) || false;

  const mouseHovering = useState(false);

  return (
    (<List.Item
      active={!location.promised && !location.error && location.isActive.get()}
      onMouseDown={handleItemClick}
      onDoubleClick={handleItemDoubleClick}
      disabled={disableForDrops}
      onMouseEnter={() => mouseHovering.set(true)}
      onMouseLeave={() => mouseHovering.set(false)}

    >
      <Ref innerRef={drag}>
        <div>
          {!location.promised && !location.error && <List.Content>
            <Grid verticalAlign='middle'>
              {location.depth.get() > 0 && <Grid.Column width={location.depth.get() as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15} />}
              <Grid.Column color={disableForDrops ? 'grey' : isDroppingAsSibling ? 'blue' : undefined} width={1}>
                <Ref innerRef={dropSibling}>
                  <span>
                    <Icon size='small' className={(!iconClasses.promised && !iconClasses.error && iconClasses.get()[location.locationType.get()]) || 'folder icon'}
                      inverted={isDroppingAsSibling} />
                  </span>
                </Ref>
              </Grid.Column>
              <Grid.Column color={disableForDrops ? 'grey' : isDroppingAsChild || isDroppingItems ? 'blue' : undefined} width={13 - location.depth.get() as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14}
                textAlign='left'>
                <Ref innerRef={dropItems}>
                  <span>
                    <Ref innerRef={dropChild}>
                      <span>
                        <ListHeader>{location.name.get()}</ListHeader>
                        <ListDescription>{location.description.get()}</ListDescription>
                      </span>
                    </Ref>
                  </span>
                </Ref>
              </Grid.Column>
              <Grid.Column width={1}>
                {location.parentId.get() !== null && itemIndex === 0
                  && (<Popup content='Exit' trigger={(<Button size='mini' icon={(<Icon flipped='horizontally' name='sign-out' />)}
                    onClick={() => { onExitLocation(location); }} />)} />)}
                {itemIndex !== 0 && mouseHovering.get()
                  && (<Popup content='Enter' trigger={(<Button size='mini' icon={(<Icon name='sign-in' />)}
                    onClick={() => { onEnterLocation(location); }} />)} />)}
              </Grid.Column>
            </Grid>
          </List.Content>}
        </div>
      </Ref>
    </List.Item>)
  );
}


export function LocationTree(props: LocationTreeProps) {
  const {
    locations: _locations,
    draggingLocation,
    onActivateLocation,
    onEnterLocation,
    onExitLocation,
    onEditLocation,
    onCanDropData,
    onDropData
  } = props;

  const locations = useState(_locations);

  return (<Segment basic>
    <Dimmer active={locations.promised} >
      <Loader>Loading</Loader>
    </Dimmer>
    <List selection>
      {!locations.promised && !locations.error && locations.keys.map((i) => (
        <LocationTreeItem key={locations[i].id.get()}
          location={locations[i]}
          draggingLocation={draggingLocation}
          itemIndex={i}
          onActivateLocation={onActivateLocation}
          onEnterLocation={onEnterLocation}
          onExitLocation={onExitLocation}
          onEditLocation={onEditLocation}
          onCanDropData={onCanDropData}
          onDropData={onDropData} />
      ))}
    </List>
  </Segment>
  );
}
