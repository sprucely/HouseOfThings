import { State } from "@hookstate/core";

export type TagModel = {
  id: number,
  name: string
}

export type TagSuggestionModel = {
  id: number|string,
  title: string
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
  isSelected: boolean;
  isSelecting: boolean;
}

export type MoveItemsModel = {
  itemIds: number[];
  toLocationId: number;
}

export const DragItemTypes = {
  LOCATION: 'location',
  ITEMS: 'items'
}

export type DragData = {
  dragItemType: 'location' | 'items';
  dragItem: State<LocationModel> | State<ItemModel>[];
}

export type DragDataItem = {
  type: 'location' | 'items';
  dragData: DragData
}

export type DropData = DragData & {
  dropTarget: State<LocationModel>;
  targetPlacement: 'child' | 'sibling';
}