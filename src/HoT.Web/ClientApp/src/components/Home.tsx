import useAxios from 'axios-hooks';
import React, { useEffect, useState } from 'react';
import SortableTree, { ExtendedNodeData, TreeIndex, TreeItem, TreeNode } from 'react-sortable-tree';

import { TagLookup } from './TagLookup';
import { LocationFilterModel, TagModel } from '../types';
import { Button } from 'semantic-ui-react';

interface LocationTreeItem extends TreeItem {
  id: number;
  moveable: boolean;
}

export const Home = () => {
  const [locationFilter, setLocationFilter] = useState<LocationFilterModel>();

  const [{ data: locations, loading: locationsLoading, error: locationsError }
    , searchLocations] = useAxios<LocationTreeItem[]>(
      {
        url: '/api/locations/search',
        method: 'POST'
      },
      { manual: true });

  useEffect(() => {
    locationFilter && searchLocations({ data: locationFilter });
  }, [locationFilter, searchLocations]);

  function handleTagsChanged(newTags: TagModel[]) {
    setLocationFilter({ tagFilter: { tags: newTags, includeAllTags: true } })
  }

  function handleTreeChange(treeData: TreeItem | LocationTreeItem) {
    console.log(treeData);
  }

  function getNodeKey(treeNode: TreeNode & TreeIndex) {
    const locationNode = treeNode.node as LocationTreeItem;
    return locationNode.id;
  }

  function generateNodeProps(data: ExtendedNodeData) {
    const location = data.node as LocationTreeItem;
    return {
      buttons: [(
        <Button onClick={() => {
          console.log(JSON.stringify(location));
          setLocationFilter({ locationId: location.id });
        }}>Select</Button>
      )]
    };
  }

  return (
    <div>
      <TagLookup onTagsChanged={handleTagsChanged} />
      <SortableTree
        treeData={locations}
        onChange={handleTreeChange}
        getNodeKey={getNodeKey}
        isVirtualized={false}
        generateNodeProps={generateNodeProps}
      />
    </div>
  );
}
