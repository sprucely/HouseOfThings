import useAxios from 'axios-hooks';
import React, { useEffect, useState } from 'react';

import { TagLookup } from './TagLookup';
import { LocationFilterModel, TagModel } from '../types';
import { Button, Dimmer, Divider, Grid, Icon, List, ListDescription, ListHeader, Loader, Popup, Segment } from 'semantic-ui-react';

type LocationTreeItem = {
  id: number;
  parentId: number | null;
  moveable: boolean;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  expanded?: boolean;
  children?: LocationTreeItem[];
}

export const Locations = () => {
  const [locationFilter, setLocationFilter] = useState<LocationFilterModel>({ parentId: null });

  const [{ data: locations, loading: locationsLoading }
    , searchLocations] = useAxios<LocationTreeItem[]>(
      {
        url: '/api/locations/search',
        method: 'POST'
      },
      { manual: true });

  useEffect(() => {
    searchLocations({ data: locationFilter });
  }, [locationFilter, searchLocations]);

  function handleTagsChanged(newTags: TagModel[]) {
    setLocationFilter({ tagFilter: { tags: newTags, includeAllTags: true } })
  }

  function treeListItem(location: LocationTreeItem, rootIndex?: number) {

    return (<List.Item key={location.id}>
      <List.Icon name='folder' />
      <List.Content>
        <Grid centered columns={2}>
          <Grid.Column textAlign='left'>
            <ListHeader>{location.title}</ListHeader>
            <ListDescription>Description</ListDescription>

          </Grid.Column>
          <Grid.Column textAlign='right'>
            {location.id !== locationFilter?.locationId && rootIndex !== 0
              && (<Popup content='Enter' trigger={(<Button icon='sign-in'
                onClick={() => { setLocationFilter({ locationId: location.id }); }} />)} />)}
            {location.parentId !== null && rootIndex === 0
              && (<Popup content='Exit' trigger={(<Button icon={(<Icon flipped='horizontally' name='sign-out' />)}
                onClick={() => { setLocationFilter({ locationId: location.parentId || 0 }); }} />)} />)}
            <Popup content='Add Storage' trigger={(<Button icon='add square' onClick={() => { }} />)} />
            <Popup content='Add Thing' trigger={(<Button icon='add' onClick={() => { }} />)} />
          </Grid.Column>
        </Grid>
        <Divider fitted />
        {(location.children?.length ?? 0) > 0 && (<List.List>
          {(location.children as LocationTreeItem[]).map((l, _) => treeListItem(l))}
        </List.List>)}
      </List.Content>
    </List.Item>);
  }

  return (
    <div>
      <Grid columns={2} divided>
        <Grid.Row>
          <Grid.Column>
            <TagLookup onTagsChanged={handleTagsChanged} />
            <Segment basic>
              <Dimmer active={locationsLoading} >
                <Loader>Loading</Loader>
              </Dimmer>
              <List>
                {locations?.map((l, i) => treeListItem(l, i))}
              </List>
            </Segment>
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
    </div>
  );
}
