import React, { useEffect } from 'react';
import { State, useState, none } from '@hookstate/core';
import { Container, Grid, Menu, Ref } from 'semantic-ui-react';
import { useDrop } from 'react-dnd';

import { SearchData, SearchForm } from './SearchForm';
import { DragDataItem, DragItemTypes, DropData, ItemFilterModel, ItemModel, LocationFilterModel, LocationModel } from '../types';
import { LocationTree } from './LocationTree';
import { ItemList } from './ItemList';
import { createItem, createLocation, createPhotos, moveItems, moveLocation, searchItems, searchLocations, updateItem, updateLocation, updatePhotos } from '../services/data';
import { EditLocation, editLocationDefaultsGlobal } from './EditLocation';
import { clone } from '../utilities/state';
import { ConfirmationDialog, useConfirmationDialog } from './ConfirmationDialog';
import { isInPath } from '../utilities/location-path';
import { EditItem, creatingPhotos, updatingPhotos } from './EditItem';

let locationsPromise: Promise<LocationModel[]> | null = null;
let itemsPromise: Promise<ItemModel[]> | null = null;

const defaultLocation: LocationModel = {
  id: 0, parentId: null, rootId: 0, depth: 0, path: "",
  moveable: false, locationType: "Default", isActive: false,
  name: "", description: ""
};

const defaultItem: ItemModel = {
  id: 0, locationId: 0, locationName: "", name: "", description: "",
  photos:[], isSelected: false, isSelecting: false
};

export const AllTheThings = () => {
  const locations = useState<LocationModel[]>([]);
  const items = useState<ItemModel[]>([]);
  const hasActiveLocation = useState(false);
  const editLocation = useState<LocationModel>(clone(defaultLocation));
  const editItem = useState<ItemModel>(clone(defaultItem));

  const { getConfirmation } = useConfirmationDialog();

  useEffect(() => {
    requestSearchLocations({ locationId: null, tagFilter: { tags: [], includeAllTags: false } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activateLocation = (activatedLocation: State<LocationModel>) => {
    const locationToDeactivate = !locations.promised && !locations.error
      && locations.find(l => l.isActive.get() && l.id.get() !== activatedLocation.id.get());
    if (locationToDeactivate) {
      locationToDeactivate.isActive.set(false)
    }
    activatedLocation.isActive.set(true);
    hasActiveLocation.set(true);
  };

  const activateFirstLocation = () => {
    const firstLocation = !locations.promised && !locations.error && locations.length && locations[0];
    if (firstLocation) {
      activateLocation(firstLocation);
    }
  };

  const requestSearchLocations = (filter: LocationFilterModel) => {
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
  };

  const requestSearchItems = (filter: ItemFilterModel) => {
    if (itemsPromise === null) {
      itemsPromise = searchItems(filter);
      items.set(itemsPromise);
    } else {
      // must be sure previous promise has resolved before calling set()...
      itemsPromise.then(() => {
        itemsPromise = searchItems(filter)
        items.set(itemsPromise);
      });
    }
  };

  const handleSearchLocationsChanged = (searchData: SearchData) => {
    const { tags, match } = searchData;
    requestSearchLocations({ locationId: null, tagFilter: { tags, includeAllTags: match === 'all' } });
  };

  const handleSearchItemsChanged = (searchData: SearchData) => {
    const { tags, match } = searchData;
    requestSearchItems({ locationId: null, tagFilter: { tags, includeAllTags: match === 'all' } });
  };

  const getActiveLocation = () => {
    return (!locations.promised && !locations.error && locations.find(l => l.isActive.get())) || null;
  };

  const handleAddLocation = async () => {
    const activeLocation = getActiveLocation();
    if (!activeLocation) return;
    editLocation.merge(l => {
      l = clone(defaultLocation);
      l.locationType = editLocationDefaultsGlobal.locationType.get();
      l.parentId = activeLocation.id.get();
      return l;
    });

    if (await getConfirmation({ title: "Add Location", content: () => <EditLocation location={editLocation} /> })) {
      const addedLocation = clone(editLocation.value);
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

  };

  const handleEditLocation = async (location: State<LocationModel>) => {
    editLocation.merge(clone(location.value))

    if (await getConfirmation({ title: "Edit Location", content: () => <EditLocation location={editLocation} /> })) {
      const editedLocation = clone(editLocation.value);
      location.merge(editedLocation);
      const updatedLocation = await updateLocation(editLocation.value);
      location.merge(updatedLocation);
    }

  };

  const handleAddItem = async () => {
    const activeLocation = getActiveLocation();
    if (!activeLocation) return;

    editItem.merge(i => {
      i = clone(defaultItem);
      i.locationId = activeLocation.id.get();
      return i;
    });

    creatingPhotos.length = 0;
    updatingPhotos.length = 0;

    if (await getConfirmation({ title: "Add Item", content: () => <EditItem item={editItem} /> })) {
      const addedItem = clone(editItem.value);

      // this prevents weird bug of form being uneditable on every other add operation...
      editItem.merge(clone(defaultItem));

      if (creatingPhotos.length) {
        const newPhotos = await createPhotos(creatingPhotos);
        addedItem.photos = newPhotos;
      }
      
      items.merge(oldItems => {
        const merge: { [key: number]: ItemModel } = {};
        merge[0] = addedItem;
        oldItems.map((i, index) => merge[index + 1] = i);
        return merge;
      })

      const createdItem = await createItem(addedItem);
      // replace addedItem with createdItem
      items[0].merge(createdItem);
    }

  };

  const handleEditItem = async (item: State<ItemModel>) => {
    editItem.merge(clone(item.value))

    creatingPhotos.length = 0;
    updatingPhotos.length = 0;

    if (await getConfirmation({ title: "Edit Item", content: () => <EditItem item={editItem} /> })) {
      const editedItem = clone(editItem.value);

      if (updatingPhotos.length) {
        await updatePhotos(updatingPhotos);
        editedItem.photos.forEach(p => {
          const photo = updatingPhotos.find(u => u.id === p.id);
          if (!!photo) {
            p.name = photo.name;
          }
        });
      }

      if (creatingPhotos.length) {
        const newPhotos = await createPhotos(creatingPhotos);
        editedItem.photos = editedItem.photos.concat(newPhotos);
      }

      item.merge(editedItem);
      const updatedItem = await updateItem(editedItem);
      item.merge(updatedItem);
    }

  };

  const handleEnterLocation = (location: State<LocationModel>) => {
    requestSearchLocations({ locationId: location.id.get(), tagFilter: null });
    requestSearchItems({ locationId: location.id.get(), tagFilter: null })
  };

  const handleExitLocation = (location: State<LocationModel>) => {
    requestSearchLocations({ locationId: location.parentId.get(), tagFilter: null });
    requestSearchItems({ locationId: location.parentId.get(), tagFilter: null })
  };

  const handleCanDropData = (data: DropData) => {
    const location = data.dragItemType === 'location' && data.dragItem as State<LocationModel>;
    if (location) {
      return !isInPath(location.nested("path").get(), data.dropTarget.nested("path").get());
    }

    return true;
  };

  const handleDropData = async (data: DropData) => {
    const location = (data.dragItemType === 'location' && data.dragItem) as State<LocationModel>;
    if (location && locationsPromise !== null && !isInPath(location.nested("path").get(), data.dropTarget.nested("path").get())) {
      const targetLocation = data.dropTarget;
      const content = data.targetPlacement === 'child'
        ? `Moving ${location.name.get()} into ${targetLocation.name.get()}`
        : `Moving ${location.name.get()} next to ${targetLocation.name.get()}`;

      if (await getConfirmation({ title: "Moving Location", content })) {

        locationsPromise.then(() => {
          locationsPromise = moveLocation({
            moveLocationId: location.id.get(),
            toChildOfLocationId: data.targetPlacement === 'child' ? targetLocation.id.get() : undefined,
            toSiblingOfLocationId: data.targetPlacement === 'sibling' ? targetLocation.id.get() : undefined
          });
          locations.set(locationsPromise);
          locationsPromise.then(() => activateFirstLocation());
        });
        hasActiveLocation.set(false);
      }
    } else {
      const targetLocation = data.dropTarget;
      const itemsToMove = ((data.dragItemType === 'items' && data.dragItem) as State<ItemModel>[])
        .filter(item => item.locationId.get() !== targetLocation.id.get());

      if (itemsToMove.length) {
        const itemNames = itemsToMove.map(item => item.name.get()).join(', ');
        const itemIds = itemsToMove.map(item => item.id.get());
        if (await getConfirmation({ title: "Moving Items", content: `Moving the following item${itemsToMove.length > 1 ? 's' : ''} into ${targetLocation.name.get()}: ${itemNames}` })) {
          await moveItems({
            itemIds,
            toLocationId: targetLocation.id.get()
          });

          const clearItems: { [key: number]: any } = {};

          items.keys.map(k => {
            if (itemIds.includes(items[k].id.get())) {
              clearItems[k] = none;
            }
            return null;
          })

          items.merge(clearItems);
        }
      }
    }
  };

  const [{ draggingLocation }, dropLocation] = useDrop({
    accept: DragItemTypes.LOCATION,
    drop: () => { },
    canDrop: () => false,
    collect: (monitor) => {
      if (!!monitor.isOver()) {
        const { dragData: { dragItemType, dragItem } } = monitor.getItem() as DragDataItem;
        return {
          draggingLocation: dragItemType === 'location' ? dragItem as State<LocationModel> : null
        };
      }
      return {
        draggingLocation: null
      }
    }
  })

  return (
    <Ref innerRef={dropLocation}>
      <div>
        <ConfirmationDialog />
        <Menu icon='labeled' fixed='top' inverted stackable>
          <Container>
            <Menu.Item
              header
            ><h3>House of Things</h3></Menu.Item>
            <Menu.Item icon="add square" name='Add Location' disabled={!hasActiveLocation.get()} onClick={handleAddLocation} />
            <SearchForm onSearchDataChanged={handleSearchLocationsChanged} placeholder='Search Locations' />
            <Menu.Item icon="add" name='Add Thing' disabled={!hasActiveLocation.get()} onClick={handleAddItem} position='right' />
            <SearchForm onSearchDataChanged={handleSearchItemsChanged} placeholder='Search Things' />
          </Container>
        </Menu>
        <Grid columns={2} divided stackable>
          <Grid.Row>
            <Grid.Column>
              <LocationTree
                locations={locations}
                draggingLocation={draggingLocation}
                onActivateLocation={activateLocation}
                onEnterLocation={handleEnterLocation}
                onExitLocation={handleExitLocation}
                onEditLocation={handleEditLocation}
                onCanDropData={handleCanDropData}
                onDropData={handleDropData}
              />
            </Grid.Column>
            <Grid.Column>
              <ItemList
                items={items}
                onEditItem={handleEditItem}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <div>
          Icons generated by <a href="https://www.flaticon.com">flaticon.com</a>. <p>Under <a href="http://creativecommons.org/licenses/by/3.0/">CC</a>: <a data-file="014-stairs" href="http://www.freepik.com">Freepik</a>, <a data-file="005-bin" href="https://www.flaticon.com/authors/smashicons">Smashicons</a>, <a data-file="011-box" href="https://www.flaticon.com/authors/pixel-perfect">Pixel perfect</a></p>
        </div>
      </div>
    </Ref>
  );
}
