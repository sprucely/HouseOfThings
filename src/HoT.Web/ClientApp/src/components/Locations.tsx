import React, { useCallback, useEffect } from 'react';
import { State, useState } from '@hookstate/core';
import { Grid, List, Menu } from 'semantic-ui-react';

import { TagLookup } from './TagLookup';
import { LocationFilterModel, LocationModel, TagModel } from '../types';
import { LocationTree } from './LocationTree';
import { createLocation, searchLocations, updateLocation } from '../services/data';
import { EditLocationModal } from './EditLocationModal';
import { clone } from '../utilities/state';

let locationsPromise: Promise<LocationModel[]> | null = null;

export const Locations = () => {
  const locations = useState<LocationModel[]>([]);
  const hasActiveLocation = useState(false);

  useEffect(() => {
    requestSearchLocations({ locationId: null, tagFilter: { tags: [], includeAllTags: false } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleActivateLocation = useCallback((activatedLocation: State<LocationModel>) => {

    const activeLocationId = activatedLocation.id.get();

    const locationToDeactivate = !locations.promised && !locations.error
      && locations.find(l => l.isActive.get() && l.id.get() !== activeLocationId);

    if (locationToDeactivate) {
      locationToDeactivate.isActive.set(false)
    }

    activatedLocation.isActive.set(true);
    hasActiveLocation.set(true);
  }, [hasActiveLocation, locations]);

  const activateFirstLocation = useCallback(() =>{
    const firstLocation = !locations.promised && !locations.error && locations.length && locations[0];
    if (firstLocation) {
      handleActivateLocation(firstLocation);
    }
  },[handleActivateLocation, locations]);

  const requestSearchLocations = useCallback((filter: LocationFilterModel) => {
    if (locationsPromise === null) {
      locationsPromise = searchLocations(filter);
      locations.set(locationsPromise);
      locationsPromise.then(() => activateFirstLocation());
    } else {
      // must be sure previous promise has resolved before calling set()...
      locationsPromise.then(() => {
        locationsPromise = searchLocations(filter)
        locations.set(locationsPromise);
        locationsPromise.then(() => activateFirstLocation());
      });
    }
    hasActiveLocation.set(false);
  }, [activateFirstLocation, hasActiveLocation, locations]);

  const handleTagsChanged = useCallback((newTags: TagModel[]) => {
    requestSearchLocations({ locationId: null, tagFilter: { tags: newTags, includeAllTags: false } });
  }, [requestSearchLocations]);

  const getActiveLocation = useCallback(() => {
    return (!locations.promised && !locations.error && locations.find(l => l.isActive.get())) || null;
  }, [locations]);

  const handleAddLocationResult = useCallback(async (addedLocation: LocationModel | null) => {
    const activeLocation = getActiveLocation();

    if (addedLocation && activeLocation && !locations.promised && !locations.error) {
      addedLocation = clone(addedLocation);
      addedLocation.parentId = activeLocation.id.get();
      let parentIndex: number | null = null;

      // doing equivalent of [].splice(parentIndex, 0, addedLocation) using hookState's merge
      locations.merge(oldLocations => {
        const newLocations: { [index: number]: LocationModel } = {};
        oldLocations.map((loc: LocationModel, i: number) => {
          if (loc.id === addedLocation?.parentId) {
            parentIndex = i;
            addedLocation.depth = loc.depth + 1;
          }
          newLocations[i + (parentIndex ? 1 : 0)] = loc;
          return loc;
        })
        addedLocation && (newLocations[(parentIndex || -1) + 1] = addedLocation);
        return newLocations;
      });

      const createdLocation = await createLocation(addedLocation);
      createdLocation.depth = addedLocation.depth;
      createdLocation.isActive = true;

      activeLocation.isActive.set(false);
      // replace editedLocation with createdLocation
      locations[(parentIndex || -1) + 1].merge(createdLocation);
    }
  }, [getActiveLocation, locations]);

  const handleEditLocationResult = useCallback(async (editedLocation: LocationModel | null) => {
    if (editedLocation) {
      editedLocation = clone(editedLocation);

      const activeLocation = getActiveLocation();

      if (activeLocation) {
        //locations.merge({ editedLocationIndex: editedLocation } as Record<number, LocationModel>);
        activeLocation.set(editedLocation);

        editedLocation = await updateLocation(editedLocation);
        editedLocation.isActive = true;

        // locations.merge({ editedLocationIndex: editedLocation } as Record<number, LocationModel>);
        activeLocation.set(editedLocation);
      }

    }
  }, [getActiveLocation]);

  const handleEnterLocation = useCallback((location: State<LocationModel>) => {
    requestSearchLocations({ locationId: location.id.get(), tagFilter: { tags: [], includeAllTags: false } });
  }, [requestSearchLocations]);

  const handleExitLocation = useCallback((location: State<LocationModel>) => {
    requestSearchLocations({ locationId: location.parentId.get(), tagFilter: { tags: [], includeAllTags: false } });
  }, [requestSearchLocations]);

  return (
    <div>
      <Grid columns={2} divided stackable>
        <Grid.Row>
          <Grid.Column>
            <TagLookup onTagsChanged={handleTagsChanged} />
            <Menu icon='labeled'>
              <EditLocationModal
                action='Add'
                onClose={handleAddLocationResult}
                trigger={
                  <Menu.Item icon="add square" name='Add Location' position='right' disabled={!hasActiveLocation.get()} />} />
              <EditLocationModal
                action='Edit'
                onOpen={() => getActiveLocation()}
                onClose={handleEditLocationResult}
                trigger={
                  <Menu.Item icon="edit" name='Edit Location' disabled={!hasActiveLocation.get()} />} />
              <Menu.Item icon="add" name='Add Thing' onClick={() => { }} disabled={!hasActiveLocation.get()} />


            </Menu>
            <LocationTree
              locations={locations}
              onActivateLocation={handleActivateLocation}
              onEnterLocation={handleEnterLocation}
              onExitLocation={handleExitLocation}
            />
          </Grid.Column>
          <Grid.Column>
            <List divided relaxed>
              <List.Item>
                <List.Icon name='github' size='large' verticalAlign='middle' />
                <List.Content>
                  <List.Header as='a'>Semantic-Org/Semantic-UI</List.Header>
                  <List.Description as='a'>Updated 10 mins ago</List.Description>
                </List.Content>
              </List.Item>
              <List.Item>
                <List.Icon name='github' size='large' verticalAlign='middle' />
                <List.Content>
                  <List.Header as='a'>Semantic-Org/Semantic-UI-Docs</List.Header>
                  <List.Description as='a'>Updated 22 mins ago</List.Description>
                </List.Content>
              </List.Item>
              <List.Item>
                <List.Icon name='github' size='large' verticalAlign='middle' />
                <List.Content>
                  <List.Header as='a'>Semantic-Org/Semantic-UI-Meteor</List.Header>
                  <List.Description as='a'>Updated 34 mins ago</List.Description>
                </List.Content>
              </List.Item>
            </List>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <div>
        Icons generated by <a href="https://www.flaticon.com">flaticon.com</a>. <p>Under <a href="http://creativecommons.org/licenses/by/3.0/">CC</a>: <a data-file="014-stairs" href="http://www.freepik.com">Freepik</a>, <a data-file="005-bin" href="https://www.flaticon.com/authors/smashicons">Smashicons</a>, <a data-file="011-box" href="https://www.flaticon.com/authors/pixel-perfect">Pixel perfect</a></p>
      </div>
    </div>
  );
}
