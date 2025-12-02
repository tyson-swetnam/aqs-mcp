/**
 * TypeScript interfaces for EPA AQS API responses
 */

/**
 * Standard AQS API response header
 */
export interface AqsHeader {
  status: string;
  request_time: string;
  url: string;
  rows?: number;
}

/**
 * Standard AQS API response wrapper
 */
export interface AqsResponse<T = unknown> {
  Header: AqsHeader[];
  Data: T[];
}

/**
 * State reference data
 */
export interface State {
  code: string;
  value_represented: string;
}

/**
 * County reference data
 */
export interface County {
  code: string;
  value_represented: string;
}

/**
 * Site reference data
 */
export interface Site {
  code: string;
  value_represented: string;
}

/**
 * Core Based Statistical Area (CBSA)
 */
export interface Cbsa {
  code: string;
  value_represented: string;
}

/**
 * Parameter class (e.g., "CRITERIA", "AIR TOXICS")
 */
export interface ParameterClass {
  code: string;
  value_represented: string;
}

/**
 * Parameter (pollutant) information
 */
export interface Parameter {
  code: string;
  value_represented: string;
}

/**
 * Monitor information
 */
export interface Monitor {
  state_code: string;
  county_code: string;
  site_number: string;
  parameter_code: string;
  parameter_name: string;
  poc: number;
  latitude: number;
  longitude: number;
  datum: string;
  first_year_of_data: number;
  last_sample_date: string;
  sample_collection_method?: string;
  sample_collection_method_code?: string;
  sample_collection_method_name?: string;
  measurement_scale?: string;
  measurement_scale_definition?: string;
  networks?: string;
  monitoring_objective?: string;
  last_method_code?: string;
  last_method_name?: string;
  naaqs_primary_monitor?: string;
  local_site_name?: string;
  address?: string;
  city_name?: string;
  cbsa_code?: string;
  cbsa_name?: string;
  tribe_code?: string;
  tribe_name?: string;
  urban_rural_classification?: string;
  land_use?: string;
  location_setting?: string;
  site_established_date?: string;
  site_closed_date?: string;
}

/**
 * Sample data record
 */
export interface SampleData {
  state_code: string;
  county_code: string;
  site_number: string;
  parameter_code: string;
  poc: number;
  latitude: number;
  longitude: number;
  datum: string;
  parameter_name: string;
  date_local: string;
  time_local: string;
  date_gmt: string;
  time_gmt: string;
  sample_measurement: number;
  units_of_measure: string;
  units_of_measure_code: string;
  sample_duration: string;
  sample_duration_code: string;
  sample_frequency?: string;
  detection_limit?: number;
  uncertainty?: number;
  qualifier?: string;
  method_type?: string;
  method_code?: string;
  method_name?: string;
  state_name?: string;
  county_name?: string;
  date_of_last_change?: string;
  cbsa_code?: string;
}

/**
 * Daily summary data record
 */
export interface DailySummary {
  state_code: string;
  county_code: string;
  site_number: string;
  parameter_code: string;
  poc: number;
  latitude: number;
  longitude: number;
  datum: string;
  parameter_name: string;
  date_local: string;
  units_of_measure: string;
  units_of_measure_code: string;
  sample_duration: string;
  sample_duration_code: string;
  sample_frequency?: string;
  observation_count: number;
  observation_percent: number;
  arithmetic_mean: number;
  first_max_value: number;
  first_max_hour: number;
  aqi?: number;
  method_code?: string;
  method_name?: string;
  local_site_name?: string;
  site_address?: string;
  state_name?: string;
  county_name?: string;
  city_name?: string;
  cbsa_code?: string;
  cbsa_name?: string;
  date_of_last_change?: string;
}

/**
 * Quarterly summary data record
 */
export interface QuarterlySummary {
  state_code: string;
  county_code: string;
  site_number: string;
  parameter_code: string;
  poc: number;
  latitude: number;
  longitude: number;
  datum: string;
  parameter_name: string;
  year: number;
  quarter: number;
  units_of_measure: string;
  sample_duration: string;
  observation_count: number;
  observation_percent: number;
  arithmetic_mean: number;
  first_max_value: number;
  second_max_value?: number;
  third_max_value?: number;
  fourth_max_value?: number;
  first_max_datetime?: string;
  second_max_datetime?: string;
  third_max_datetime?: string;
  fourth_max_datetime?: string;
  method_code?: string;
  method_name?: string;
  local_site_name?: string;
  state_name?: string;
  county_name?: string;
  city_name?: string;
  cbsa_code?: string;
  cbsa_name?: string;
}

/**
 * Annual summary data record
 */
export interface AnnualSummary {
  state_code: string;
  county_code: string;
  site_number: string;
  parameter_code: string;
  poc: number;
  latitude: number;
  longitude: number;
  datum: string;
  parameter_name: string;
  year: number;
  units_of_measure: string;
  sample_duration: string;
  pollutant_standard?: string;
  metric_used?: string;
  method_code?: string;
  method_name?: string;
  observation_count: number;
  observation_percent: number;
  valid_day_count?: number;
  required_day_count?: number;
  exceptional_data_count?: number;
  null_data_count?: number;
  primary_exceedance_count?: number;
  secondary_exceedance_count?: number;
  arithmetic_mean: number;
  arithmetic_standard_dev?: number;
  first_max_value: number;
  first_max_datetime?: string;
  second_max_value?: number;
  second_max_datetime?: string;
  third_max_value?: number;
  third_max_datetime?: string;
  fourth_max_value?: number;
  fourth_max_datetime?: string;
  first_no_max_value?: number;
  first_no_max_datetime?: string;
  second_no_max_value?: number;
  second_no_max_datetime?: string;
  ninety_ninth_percentile?: number;
  ninety_eighth_percentile?: number;
  ninety_fifth_percentile?: number;
  ninetieth_percentile?: number;
  seventy_fifth_percentile?: number;
  fiftieth_percentile?: number;
  tenth_percentile?: number;
  local_site_name?: string;
  site_address?: string;
  state_name?: string;
  county_name?: string;
  city_name?: string;
  cbsa_code?: string;
  cbsa_name?: string;
  date_of_last_change?: string;
  certification_indicator?: string;
}

/**
 * Common parameters for most API requests
 */
export interface BaseParams {
  email: string;
  key: string;
}

/**
 * Parameters for data queries with date range
 */
export interface DateRangeParams extends BaseParams {
  bdate: string;
  edate: string;
  param: string;
}

/**
 * Parameters for site-level queries
 */
export interface SiteParams extends DateRangeParams {
  state: string;
  county: string;
  site: string;
}

/**
 * Parameters for county-level queries
 */
export interface CountyParams extends DateRangeParams {
  state: string;
  county: string;
}

/**
 * Parameters for state-level queries
 */
export interface StateParams extends DateRangeParams {
  state: string;
}

/**
 * Parameters for bounding box queries
 */
export interface BoxParams extends DateRangeParams {
  minlat: string;
  maxlat: string;
  minlon: string;
  maxlon: string;
}

/**
 * Parameters for CBSA queries
 */
export interface CbsaParams extends DateRangeParams {
  cbsa: string;
}
