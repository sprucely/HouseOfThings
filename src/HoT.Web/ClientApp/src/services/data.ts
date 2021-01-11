import Axios from 'axios';
import { ItemFilterModel, ItemModel, LocationFilterModel, LocationModel, LocationTypeModel, MoveItemsModel, TagModel } from '../types';


type RequestMoveLocationModel = {
  moveLocationId: number;
  toChildOfLocationId?: number;
  toSiblingOfLocationId?: number;
};

type MoveLocationModel = RequestMoveLocationModel & {
  // locationFilter is used for requerying, since moves can significantly change Loction.Path properties
  locationFilter: LocationFilterModel;
};

let lastUsedLocationFilter: LocationFilterModel | null = null;

export async function searchLocations(locationFilter: LocationFilterModel) {
  lastUsedLocationFilter = locationFilter;
  const result = await Axios.post<LocationModel[]>("/api/locations/search", locationFilter);
  return result.data || [];
}

export async function fetchLocationTypes() {
  const result = await Axios.get<LocationTypeModel[]>("/api/locations/locationtypes");
  return result.data || [];
}

export async function getLocationTypeIconClasses() {
  const locationTypes = await fetchLocationTypes();
  const mapLocationTypeToIconClass: Record<string, string> = {};
  (locationTypes || []).map((lt) => mapLocationTypeToIconClass[lt.name] = lt.iconClass);
  return mapLocationTypeToIconClass;
}

export async function createLocation(creatingLocation: LocationModel) {
  const result = await Axios.post<LocationModel>("/api/locations/create", creatingLocation);
  return result.data;
}

export async function updateLocation(updatingLocation: LocationModel) {
  const result = await Axios.post<LocationModel>("/api/locations/update", updatingLocation);
  return result.data;
}

export async function moveLocation(requestMoveModel: RequestMoveLocationModel) {
  const moveModel = { ...requestMoveModel, locationFilter: lastUsedLocationFilter } as MoveLocationModel;
  const result = await Axios.post<LocationModel[]>("/api/locations/move", moveModel);
  return result.data;
}

export async function searchItems(itemFilter: ItemFilterModel) {
  const result = await Axios.post<ItemModel[]>("/api/items/search", itemFilter);
  return result.data || [];
}

export async function createItem(creatingItem: ItemModel) {
  const result = await Axios.post<ItemModel>("/api/items/create", creatingItem);
  return result.data;
}

export async function updateItem(updatingItem: ItemModel) {
  const result = await Axios.post<ItemModel>("/api/items/update", updatingItem);
  return result.data;
}

export async function moveItems(moveItemsModel: MoveItemsModel) {
  await Axios.post("/api/items/move", moveItemsModel);
}

export const searchTagsAsync = async (query: string) => {
  const result = await Axios.get<TagModel[]>("/api/tags/search?q=" + encodeURIComponent(query));
  return result.data || [];
}
