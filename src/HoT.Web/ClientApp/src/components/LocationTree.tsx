import React, { SyntheticEvent, useCallback } from 'react';
import { Button, Dimmer, Grid, Icon, List, ListDescription, ListHeader, Loader, Popup, Segment } from 'semantic-ui-react';
import { createState, State, useState } from '@hookstate/core';
import { LocationModel } from '../types';
import { getLocationTypeIconClasses } from '../services/data';

type LocationTreeProps = {
  locations: State<LocationModel[]>;
  onActivateLocation: (activatedLocation: State<LocationModel>) => void;
  onEnterLocation: (enteredLocation: State<LocationModel>) => void;
  onExitLocation: (exitedLocation: State<LocationModel>) => void;
};


type LocationTreeItemProps = {
  location: State<LocationModel>;
  rootIndex?: number;
  onActivateLocation: (activatedLocation: State<LocationModel>) => void;
  onEnterLocation: (enteredLocation: State<LocationModel>) => void;
  onExitLocation: (exitedLocation: State<LocationModel>) => void;
}

const iconClassesGlobal = createState(getLocationTypeIconClasses());

function LocationTreeItem(props: LocationTreeItemProps) {
  const { location: _location,
    rootIndex,
    onActivateLocation,
    onEnterLocation,
    onExitLocation
  } = props;

  const location = useState(_location);
  const iconClasses = useState(iconClassesGlobal);

  const handleItemClick = useCallback((e: SyntheticEvent) => {
    if (!location.isActive.get()) {
      onActivateLocation(location);
    }
    e.preventDefault();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, onActivateLocation]);
  
  const handleItemDoubleClick = useCallback((e: SyntheticEvent) => {
    onEnterLocation(location);
    e.preventDefault();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, onEnterLocation]);

  return (
    (!location.promised && !location.error && <List.Item
      active={location.isActive.get()}
      onClick={handleItemClick}
      onDoubleClick={handleItemDoubleClick}
    >
      <List.Content>
        <Grid>
          {location.depth.get() > 0 && <Grid.Column width={location.depth.get() as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15} />}
          <Grid.Column width={1}>
            <Icon className={(!iconClasses.promised && !iconClasses.error && iconClasses.get()[location.locationType.get()]) || 'folder icon'} />
          </Grid.Column>
          <Grid.Column width={13 - location.depth.get() as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14}
            textAlign='left'>
            <ListHeader>{location.name.get()}</ListHeader>
            <ListDescription>{location.description.get()}</ListDescription>

            {/* 
                <EditLocationModal action='Add' onClose={handleAddLocationResult} />
                <Popup content='Add Thing' trigger={(<Button icon='add' onClick={() => { }} />)} /> */}
          </Grid.Column>
          <Grid.Column width={1}>
            {location.parentId.get() !== null && rootIndex === 0
              && (<Popup content='Exit' trigger={(<Button size='mini' icon={(<Icon flipped='horizontally' name='sign-out' />)}
                onClick={() => { onExitLocation(location); }} />)} />)}
          </Grid.Column>
        </Grid>
      </List.Content>
    </List.Item>) || <></>);
}


export function LocationTree(props: LocationTreeProps) {
  const { locations: _locations, onActivateLocation, onEnterLocation, onExitLocation } = props;

  const locations = useState(_locations);
  
  return (<Segment basic>
    <Dimmer active={locations.promised} >
      <Loader>Loading</Loader>
    </Dimmer>
    <List selection>
      {!locations.promised && !locations.error && locations.keys.map((i) => (
        <LocationTreeItem key={locations[i].id.get()}
          location={locations[i]}
          rootIndex={i}
          onActivateLocation={onActivateLocation}
          onEnterLocation={onEnterLocation}
          onExitLocation={onExitLocation} />
      ))}
    </List>
  </Segment>
  );
}
