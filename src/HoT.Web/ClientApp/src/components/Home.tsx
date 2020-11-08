import useAxios from 'axios-hooks';
import React, { useState } from 'react';
import { TagLookup, TagModel } from './TagLookup';


export type TagFilterModel = {
  tags: TagModel[];
  includeAllTags: boolean;
};

export type LocationModel = {
    id: number;
    name: string;
    description: string;
    moveable: boolean;
};

export const Home = () => {

  //const [tagFilter, setTagFilter] = useState({ tags: [] } as TagFilterModel);

  const [, searchLocations] = useAxios<LocationModel[]>(
    { 
      url: '/api/locations/search',
      method: 'POST'
    },
    { manual: true });

  async function handleTagsChanged(newTags: TagModel[])
  {
    const filter = { tags: newTags, includeAllTags: true }
    //setTagFilter(filter);
    const { data: locations } = await searchLocations({ data: filter });
    console.log(locations);
  }



  return (
    <div>
      <TagLookup onTagsChanged={handleTagsChanged} />
    </div>
  );
}
