import React from 'react';
import { Button, Dimmer, Divider, Grid, Icon, List, ListDescription, ListHeader, Loader, Popup, Segment } from 'semantic-ui-react';
import { createState, State, useState } from '@hookstate/core'
import { LocationFilterModel, LocationModel } from '../types';
import { EditLocationModal } from './EditLocationModal';
import { getLocationTypeIconClasses } from '../services/data';
import { createLocation }from '../services/data';

type LocationTreeProps = {
  locations: State<LocationModel[]>;
  locationFilter: State<LocationFilterModel>;
};


type LocationTreeItemProps = {
  location: State<LocationModel>;
  rootIndex?: number;
  locationFilter: State<LocationFilterModel>;
}

const iconClassesGlobal = createState(getLocationTypeIconClasses());

function LocationTreeItem(props: LocationTreeItemProps) {
  const { location: _location, rootIndex, locationFilter: _locationFilter } = props;

  const locationIdFilter = useState(_locationFilter.locationId);
  const location = useState(_location);
  const children = useState(_location.children);
  const iconClasses = useState(iconClassesGlobal);

  async function handleAddLocationResult(editedLocation: LocationModel | null) {
    if (editedLocation !== null) {
      editedLocation.parentId = location.id.get();
      // doing equivalent of [].push using hookState's merge
      children.merge(c => {
        const merge: { [index: number]: LocationModel } = {};
        c.map((child: LocationModel,  i: number) => merge[i + 1] = child);
        merge[0] = editedLocation;
        return merge;
      });
      const createdLocation = await createLocation(editedLocation);
      // replace editedLocation with createdLocation
      children.merge({ 0: createdLocation });
    }
  }

  return (<List.Item>
    <List.Icon className={(!iconClasses.promised && !iconClasses.error && iconClasses.get()[location.locationType.get()]) || 'folder icon'} />
    <List.Content>
      <Grid centered columns={2}>
        <Grid.Column textAlign='left'>
          <ListHeader>{location.name.get()}</ListHeader>
          <ListDescription>{location.description.get()}</ListDescription>

        </Grid.Column>
        <Grid.Column textAlign='right'>
          {location.id.get() !== locationIdFilter.get() && rootIndex !== 0
            && (<Popup content='Enter' trigger={(<Button icon='sign-in'
              onClick={() => { locationIdFilter.set(location.id.get()); }} />)} />)}
          {location.parentId.get() !== null && rootIndex === 0
            && (<Popup content='Exit' trigger={(<Button icon={(<Icon flipped='horizontally' name='sign-out' />)}
              onClick={() => { locationIdFilter.set(location.parentId?.get() || undefined); }} />)} />)}
          <EditLocationModal action='Add' onClose={handleAddLocationResult} />
          <Popup content='Add Thing' trigger={(<Button icon='add' onClick={() => { }} />)} />
        </Grid.Column>
      </Grid>
      <Divider fitted />
      {(children.get().length || 0) > 0 && (<List.List>
        {(location.children.keys.map((i) => (<LocationTreeItem key={location.children[i].id.get()} location={location.children[i]} locationFilter={_locationFilter} />)))}
      </List.List>)}
    </List.Content>
  </List.Item>);
}


export function LocationTree(props: LocationTreeProps) {
  const { locations: _locations, locationFilter: _locationFilter } = props;

  const locationFilter = _locationFilter;//useState(_locationFilter);
  const locations = useState(_locations);

  return (<Segment basic>
    <Dimmer active={locations.promised} >
      <Loader>Loading</Loader>
    </Dimmer>
    <List>
      {!locations.promised && !locations.error && locations.keys.map((i) => (<LocationTreeItem key={locations[i].id.get()} location={locations[i]} rootIndex={i} locationFilter={locationFilter} />))}
    </List>
  </Segment>
  );
}
