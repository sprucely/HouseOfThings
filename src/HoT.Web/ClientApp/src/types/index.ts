import { State } from "@hookstate/core";

export type TagModel = {
  id: number,
  name: string
}

export type TagFilterModel = {
  tags: TagModel[];
  includeAllTags: boolean;
};

export type LocationFilterModel = {
  tagFilter: TagFilterModel;
  locationId: number | null;
};

export type ItemFilterModel = {
  tagFilter: TagFilterModel | null;
  locationId: number | null;
};

export type LocationModel = {
  id: number;
  parentId: number | null;
  rootId: number;
  depth: number;
  path: string;
  moveable: boolean;
  name: string;
  description: string;
  locationType: string;
  isActive: boolean;
}

export type LocationTypeModel = {
  id: number;
  name: string;
  iconClass: string;
}

export type ItemModel = {
  id: number;
  locationId: number;
  locationName: string;
  name: string;
  description: string;
  isActive: boolean;
}

export type MoveItemsModel = {
  itemIds: number[];
  oLocationId: number;
}

export const DragItemTypes = {
  LOCATION: 'location',
  ITEM: 'item'
}

export type DragData = {
  dragItemType: 'location' | 'item';
  dragItem: State<LocationModel> | State<ItemModel>[];
}

export type DragDataItem = {
  type: 'location' | 'item';
  dragData: DragData
}

export type DropData = DragData & {
  dropTarget: State<LocationModel>;
  targetPlacement: 'child' | 'sibling';
}