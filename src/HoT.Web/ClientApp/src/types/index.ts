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
  //parentId: number | null;
};

export type LocationModel = {
  id: number;
  parentId: number | null;
  rootId: number;
  depth: number;
  path: string;
  moveable: boolean;
  name?: string;
  description?: string;
  expanded?: boolean;
  locationType: string
  isActive: boolean,
  isDefault: boolean;
}

export type LocationTypeModel = {
  id: number;
  name: string;
  iconClass: string;
}

export const DragItemTypes = {
  LOCATION: 'location',
  ITEM: 'item'
}

export type DragData = {
  dragItemType: 'location' | 'item';
  dragItem: State<LocationModel>;
}

export type DragDataItem = {
  type: 'location' | 'item';
  dragData: DragData
}

export type DropData = DragData & {
  dropTarget: State<LocationModel>;
  targetPlacement: 'child' | 'sibling';
}