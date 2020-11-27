import React from 'react';
import { Button, Dimmer, Divider, Grid, Icon, List, ListDescription, ListHeader, Loader, Popup, Segment } from 'semantic-ui-react';
import { State, useState } from '@hookstate/core'
import { LocationFilterModel, LocationModel } from '../types';

type TreeListProps = {
  locations: State<LocationModel[]>;
  locationFilter: State<LocationFilterModel>;
};


type TreeListItemProps = {
  location: State<LocationModel>;
  rootIndex?: number;
  locationFilter: State<LocationFilterModel>;
}

function TreeListItem(props: TreeListItemProps) {
  const { location: _location, rootIndex, locationFilter: _locationFilter } = props;

  const locationIdFilter = useState(_locationFilter.locationId);
  const location = useState(_location);
  const children = useState(_location.children);


  return (<List.Item>
    <List.Icon name='folder' />
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
          <Popup content='Add Storage' trigger={(<Button icon='add square' onClick={() => { }} />)} />
          <Popup content='Add Thing' trigger={(<Button icon='add' onClick={() => { }} />)} />
        </Grid.Column>
      </Grid>
      <Divider fitted />
      {(children.get().length || 0) > 0 && (<List.List>
        {(location.children.keys.map((i) => (<TreeListItem key={location.children[i].id.get()} location={location.children[i]} locationFilter={_locationFilter} />)))}
      </List.List>)}
    </List.Content>
  </List.Item>);
}


export function TreeList(props: TreeListProps) {
  const { locations: _locations, locationFilter: _locationFilter } = props;

  const locationFilter = _locationFilter;//useState(_locationFilter);
  const locations = useState(_locations);

  return (<Segment basic>
    <Dimmer active={locations.promised} >
      <Loader>Loading</Loader>
    </Dimmer>
    <List>
      {!locations.promised && !locations.error && locations.keys.map((i) => (<TreeListItem key={locations[i].id.get()} location={locations[i]} rootIndex={i} locationFilter={locationFilter} />))}
    </List>
  </Segment>
  );
}
