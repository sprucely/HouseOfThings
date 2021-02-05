import Axios from 'axios';
import {
  EditPhotoModel, ItemFilterModel, ItemModel, LocationFilterModel,
  LocationModel, LocationTypeModel, MoveItemsModel, PhotoModel, TagModel
} from '../types';


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
  try {
    const result = await Axios.post<LocationModel[]>("/api/locations/search", locationFilter);
    return result.data || [];
  }
  catch (error) {
    console.log(error);
    return [];
  }
}

export async function fetchLocationTypes() {
  try {
    const result = await Axios.get<LocationTypeModel[]>("/api/locations/locationtypes");
    return result.data || [];
  }
  catch (error) {
    console.log(error);
    return [];
  }
}

export async function getLocationTypeIconClasses() {
  try {
    const locationTypes = await fetchLocationTypes();
    const mapLocationTypeToIconClass: Record<string, string> = {};
    (locationTypes || []).map((lt) => mapLocationTypeToIconClass[lt.name] = lt.iconClass);
    return mapLocationTypeToIconClass;
  }
  catch (error) {
    console.log(error);
    return {};
  }
}

export async function createLocation(creatingLocation: LocationModel) {
  try {
    const result = await Axios.post<LocationModel>("/api/locations/create", creatingLocation);
    return result.data;
  }
  catch (error) {
    console.log(error);
    return creatingLocation;
  }
}

export async function updateLocation(updatingLocation: LocationModel) {
  try {
    const result = await Axios.post<LocationModel>("/api/locations/update", updatingLocation);
    return result.data;
  }
  catch (error) {
    console.log(error);
    return updatingLocation;
  }
}

export async function moveLocation(requestMoveModel: RequestMoveLocationModel) {
  try {
    const moveModel = { ...requestMoveModel, locationFilter: lastUsedLocationFilter } as MoveLocationModel;
    const result = await Axios.post<LocationModel[]>("/api/locations/move", moveModel);
    return result.data;
  }
  catch (error) {
    console.log(error);
    return [];
  }
}

export async function searchItems(itemFilter: ItemFilterModel) {
  try {
    const result = await Axios.post<ItemModel[]>("/api/items/search", itemFilter);
    return result.data || [];
  }
  catch (error) {
    console.log(error);
    return [];
  }
}

export async function createItem(creatingItem: ItemModel) {
  try {
    const result = await Axios.post<ItemModel>("/api/items/create", creatingItem);
    return result.data;
  }
  catch (error) {
    console.log(error);
    return creatingItem;
  }
}

export async function updateItem(updatingItem: ItemModel) {
  try {
    const result = await Axios.post<ItemModel>("/api/items/update", updatingItem);
    return result.data;
  }
  catch (error) {
    console.log(error);
    return updatingItem;
  }
}

export async function deleteItem(itemId: number) {
  try {
    await Axios.post(`/api/items/delete/${itemId}`);
  }
  catch (error) {
    console.log(error);
  }
}

export async function moveItems(moveItemsModel: MoveItemsModel) {
  try {
    await Axios.post("/api/items/move", moveItemsModel);
  }
  catch (error) {
    console.log(error);
  }
}

export async function searchTagsAsync(query: string) {
  try {
    const result = await Axios.get<TagModel[]>("/api/tags/search?q=" + encodeURIComponent(query));
    return result.data || [];
  }
  catch (error) {
    console.log(error);
    return [];
  }
}

export async function createPhotos(photos: EditPhotoModel[]) {
  try {
    const formData = new FormData();
    photos.forEach((p, i) => formData.append(`names[${i}]`, p.name));
    photos.forEach(p => {
      formData.append("images", p.image)
    });
    photos.forEach(p => formData.append("thumbnails", p.thumbnail));
    const result = await Axios.post<PhotoModel[]>('/api/photos/create',
      formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return result.data || [];
  }
  catch (error) {
    console.log(error);
    return [];
  }
}

export async function updatePhotos(photos: EditPhotoModel[]) {
  try {
    const formData = new FormData();
    photos.forEach((p, i) => formData.append(`names[${i}]`, p.name));
    photos.forEach((p, i) => formData.append(`ids[${i}]`, p.id.toString()));
    photos.forEach(p => formData.append("images", p.image));
    photos.forEach(p => formData.append("thumbnails", p.thumbnail));
    await Axios.post<PhotoModel[]>('/api/photos/update',
      formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
  catch (error) {
    console.log(error);
  }
}