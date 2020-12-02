
export type TagModel = {
  id: number,
  name: string
}

export type TagFilterModel = {
  tags: TagModel[];
  includeAllTags: boolean;
};

export type LocationFilterModel = {
  tagFilter?: TagFilterModel;
  locationId?: number; 
  parentId?: number | null;
};

export type LocationModel = {
  id: number;
  parentId: number | null;
  moveable: boolean;
  name?: string;
  description?: string;
  expanded?: boolean;
  locationType: string
  children: LocationModel[];
}

export type LocationTypeModel = {
  id: number;
  name: string;
  iconClass: string;
}