import React, { useEffect } from 'react';
import { useState } from '@hookstate/core'

import { TagLookup } from './TagLookup';
import { LocationFilterModel, LocationModel, TagModel } from '../types';
import { Grid, List } from 'semantic-ui-react';
import { TreeList } from './TreeList';
import Axios from 'axios';

export const Locations = () => {
  const locationFilter = useState<LocationFilterModel>({ parentId: null });

  const searchLocationsAsync = async () => {
    const result = await Axios.post<LocationModel[]>("/api/locations/search", locationFilter.get());
    return result.data || [];
  }

  const locations = useState<LocationModel[]>([]);
  
  const handleTagsChanged = (newTags: TagModel[]) => {
    locationFilter.tagFilter.merge({ tags: newTags, includeAllTags: true });
  };
  

  useEffect(() => {
    locations.set(searchLocationsAsync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[locationFilter]);
  
  return (
    <div>
      <Grid columns={2} divided stackable>
        <Grid.Row>
          <Grid.Column>
            <TagLookup onTagsChanged={handleTagsChanged} />
            <TreeList
              locations={locations}
              locationFilter={locationFilter}
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
    </div>
  );
}
