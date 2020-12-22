import Axios from 'axios';
import { LocationFilterModel, LocationModel, LocationTypeModel } from '../types';

export async function searchLocations(locationFilter: LocationFilterModel) {
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