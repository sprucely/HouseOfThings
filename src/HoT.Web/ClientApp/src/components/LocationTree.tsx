import React, { useEffect } from 'react';
import { Button, Dimmer, Divider, Grid, Icon, List, ListDescription, ListHeader, Loader, Popup, Segment } from 'semantic-ui-react';
import { createState, State, useState } from '@hookstate/core'
import { LocationFilterModel, LocationModel, LocationTypeModel } from '../types';
import { AddLocationModal } from './AddLocationModal';
import Axios from 'axios';

type LocationTreeProps = {
  locations: State<LocationModel[]>;
  locationFilter: State<LocationFilterModel>;
};


type LocationTreeItemProps = {
  location: State<LocationModel>;
  rootIndex?: number;
  locationFilter: State<LocationFilterModel>;
}

async function getLocationTypesAsync() {
  const result = await Axios.get<LocationTypeModel[]>("/api/locations/locationtypes");
  const mapLocationTypeToIconClass: Record<string, string> = {};
  (result.data || []).map((lt) => mapLocationTypeToIconClass[lt.name] = lt.iconClass);
  return mapLocationTypeToIconClass;
}

const iconClassesGlobal = createState(getLocationTypesAsync());

function LocationTreeItem(props: LocationTreeItemProps) {
  const { location: _location, rootIndex, locationFilter: _locationFilter } = props;

  const locationIdFilter = useState(_locationFilter.locationId);
  const location = useState(_location);
  const children = useState(_location.children);
  const iconClasses = useState(iconClassesGlobal);

  
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
          <Popup content='Add Storage' trigger={(<AddLocationModal />)} />
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
