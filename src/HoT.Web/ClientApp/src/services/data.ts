import Axios from 'axios';
import { State } from '@hookstate/core'

import { LocationFilterModel, LocationModel, LocationTypeModel } from '../types';

export async function searchLocations(locationFilter: State<LocationFilterModel>) {
  const result = await Axios.post<LocationModel[]>("/api/locations/search", locationFilter.get());
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