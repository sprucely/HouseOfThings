import React, { SyntheticEvent, useEffect } from 'react';
import { Button, Dimmer, Divider, Grid, Icon, List, ListDescription, ListHeader, Loader, Popup, Segment } from 'semantic-ui-react';
import { createState, State, useState } from '@hookstate/core'
import { LocationFilterModel, LocationModel } from '../types';
import { EditLocationModal } from './EditLocationModal';
import { getLocationTypeIconClasses } from '../services/data';
import { createLocation } from '../services/data';

type LocationTreeProps = {
  locations: State<LocationModel[]>;
  locationFilter: State<LocationFilterModel>;
};


type LocationTreeItemProps = {
  location: State<LocationModel>;
  rootIndex?: number;
  locationFilter: State<LocationFilterModel>;
  activeLocationId: State<number | null>;
}

const iconClassesGlobal = createState(getLocationTypeIconClasses());

function LocationTreeItem(props: LocationTreeItemProps) {
  const { location: _location,
    rootIndex,
    locationFilter: _locationFilter,
    activeLocationId: _activeLocationId
  } = props;

  const locationIdFilter = useState(_locationFilter.locationId);
  const location = useState(_location);
  const iconClasses = useState(iconClassesGlobal);
  const activeLocationId = useState(_activeLocationId);
  const isActive = useState(false);

  useEffect(() => {
    if (isActive.get() !== (activeLocationId.get() === location.id.get()))
      isActive.set(!isActive.get())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, activeLocationId])

  async function handleAddLocationResult(editedLocation: LocationModel | null) {
    // if (editedLocation !== null) {
    //   editedLocation.parentId = location.id.get();
    //   // doing equivalent of [].push using hookState's merge
    //   children.merge(c => {
    //     const merge: { [index: number]: LocationModel } = {};
    //     c.map((child: LocationModel,  i: number) => merge[i + 1] = child);
    //     merge[0] = editedLocation;
    //     return merge;
    //   });
    //   const createdLocation = await createLocation(editedLocation);
    //   // replace editedLocation with createdLocation
    //   children.merge({ 0: createdLocation });
    // }
  }

  return (
    <List.Item
      active={isActive.get()}
      onClick={(e: SyntheticEvent) => {
        console.log("Item clicked")
        activeLocationId.set(JSON.parse(JSON.stringify(location.id.get())))
        e.preventDefault();
      }}
    >
      <List.Content>
        <Grid>
          {location.depth.get() > 0 && <Grid.Column width={location.depth.get() as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15} />}
          <Grid.Column width={1}>
            <Icon className={(!iconClasses.promised && !iconClasses.error && iconClasses.get()[location.locationType.get()]) || 'folder icon'} />
          </Grid.Column>
          <Grid.Column width={14 - location.depth.get() as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14}
            textAlign='left'>
            <ListHeader>{location.name.get()}</ListHeader>
            <ListDescription>{location.description.get()}</ListDescription>

            {/* {location.id.get() !== locationIdFilter.get() && rootIndex !== 0
                  && (<Popup content='Enter' trigger={(<Button icon='sign-in'
                    onClick={() => { locationIdFilter.set(location.id.get()); }} />)} />)}
                {location.parentId.get() !== null && rootIndex === 0
                  && (<Popup content='Exit' trigger={(<Button icon={(<Icon flipped='horizontally' name='sign-out' />)}
                    onClick={() => { locationIdFilter.set(location.parentId?.get() || undefined); }} />)} />)}
                <EditLocationModal action='Add' onClose={handleAddLocationResult} />
                <Popup content='Add Thing' trigger={(<Button icon='add' onClick={() => { }} />)} /> */}
          </Grid.Column>
        </Grid>
      </List.Content>
    </List.Item>);
}


export function LocationTree(props: LocationTreeProps) {
  const { locations: _locations, locationFilter: _locationFilter } = props;

  const locationFilter = _locationFilter;//useState(_locationFilter);
  const locations = useState(_locations);

  const activeLocationId = useState<number | null>(null);

  return (<Segment basic>
    <Dimmer active={locations.promised} >
      <Loader>Loading</Loader>
    </Dimmer>
    <List selection>
      {!locations.promised && !locations.error && locations.keys.map((i) => (
        <LocationTreeItem key={locations[i].id.get()}
          location={locations[i]}
          rootIndex={i}
          locationFilter={locationFilter}
          activeLocationId={activeLocationId} />
      ))}
    </List>
  </Segment>
  );
}
