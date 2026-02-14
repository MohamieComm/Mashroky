// ============================================================
// Amadeus API — Complete TypeScript Type Definitions
// Generated from OpenAPI specs analysis (29 spec files)
// ============================================================

// ── Global ──────────────────────────────────────────────────

export interface AmadeusConfig {
  clientId: string;
  clientSecret: string;
  baseUrl?: string; // default: https://test.api.amadeus.com
  timeout?: number; // default: 30000ms
}

export interface AmadeusToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  _fetched_at: number; // internal: timestamp when fetched
}

// ── Response Envelope ────────────────────────────────────────

export interface AmadeusResponse<T> {
  data: T;
  meta?: Meta;
  warnings?: Issue[];
  dictionaries?: Record<string, Record<string, string>>;
}

export interface AmadeusCollectionResponse<T> {
  data: T[];
  meta?: CollectionMeta;
  warnings?: Issue[];
  dictionaries?: Record<string, Record<string, string>>;
}

export interface Meta {
  count?: number;
  links?: Links;
}

export interface CollectionMeta extends Meta {
  count?: number;
  links?: Links;
}

export interface Links {
  self?: string;
  next?: string;
  previous?: string;
  first?: string;
  last?: string;
}

export interface Issue {
  status: number;
  code: number;
  title: string;
  detail?: string;
  source?: {
    parameter?: string;
    pointer?: string;
    example?: string;
  };
  documentation?: string;
}

// ── Shared Models ────────────────────────────────────────────

export interface GeoCode {
  latitude: number;
  longitude: number;
}

export interface Address {
  countryCode?: string;
  stateCode?: string;
  postalCode?: string;
  cityName?: string;
  lines?: string[];
}

// ── Flight Models ────────────────────────────────────────────

export interface FlightOffer {
  type: string;
  id: string;
  source: string;
  instantTicketingRequired?: boolean;
  nonHomogeneous?: boolean;
  oneWay?: boolean;
  paymentCardRequired?: boolean;
  lastTicketingDate?: string;
  lastTicketingDateTime?: string;
  numberOfBookableSeats?: number;
  itineraries: Itinerary[];
  price: FlightPrice;
  pricingOptions?: PricingOptions;
  validatingAirlineCodes?: string[];
  travelerPricings?: TravelerPricing[];
}

export interface Itinerary {
  duration?: string;
  segments: FlightSegment[];
}

export interface FlightSegment {
  departure: FlightEndPoint;
  arrival: FlightEndPoint;
  carrierCode: string;
  number: string;
  aircraft?: { code: string };
  operating?: { carrierCode: string };
  duration?: string;
  id: string;
  numberOfStops?: number;
  blacklistedInEU?: boolean;
}

export interface FlightEndPoint {
  iataCode: string;
  terminal?: string;
  at: string; // ISO datetime
}

export interface FlightPrice {
  currency: string;
  total: string;
  base: string;
  fees?: Fee[];
  grandTotal?: string;
  margin?: string;
  billingCurrency?: string;
  additionalServices?: { amount: string; type: string }[];
}

export interface Fee {
  amount: string;
  type: string;
}

export interface PricingOptions {
  fareType?: string[];
  includedCheckedBagsOnly?: boolean;
}

export interface TravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: TravelerType;
  price: FlightPrice;
  fareDetailsBySegment: FareDetailsBySegment[];
}

export interface FareDetailsBySegment {
  segmentId: string;
  cabin?: CabinType;
  fareBasis?: string;
  brandedFare?: string;
  class?: string;
  includedCheckedBags?: { weight?: number; weightUnit?: string; quantity?: number };
  amenities?: Amenity[];
}

export interface Amenity {
  description?: string;
  isChargeable?: boolean;
  amenityType?: string;
}

export type TravelerType = 'ADULT' | 'CHILD' | 'SEATED_INFANT' | 'HELD_INFANT';
export type CabinType = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';

// Flight Offers Price
export interface FlightOfferPricingInput {
  type: string; // "flight-offers-pricing"
  flightOffers: FlightOffer[];
}

export interface FlightOfferPricingParams {
  include?: string; // CSV: credit-card-fees, bags, other-services, detailed-fare-rules
  forceClass?: boolean;
}

// Flight Availability
export interface FlightAvailabilityQuery {
  originDestinations: OriginDestination[];
  travelers: TravelerInfo[];
  searchCriteria?: SearchCriteria;
  sources?: string[];
}

export interface OriginDestination {
  id: string;
  originLocationCode: string;
  destinationLocationCode: string;
  departureDateTime?: string;
  arrivalDateTime?: string;
  departureDate?: string;
}

export interface TravelerInfo {
  id: string;
  travelerType: TravelerType;
}

export interface SearchCriteria {
  excludeAllotments?: boolean;
  flightFilters?: FlightFilters;
  maxFlightOffers?: number;
}

export interface FlightFilters {
  carrierRestrictions?: {
    blacklistedInEUAllowed?: boolean;
    excludedCarrierCodes?: string[];
    includedCarrierCodes?: string[];
  };
  cabinRestrictions?: {
    cabin: CabinType;
    coverage: string;
    originDestinationIds: string[];
  }[];
  connectionRestriction?: { maxNumberOfConnections?: number };
}

export interface FlightAvailability {
  type: string;
  id: string;
  originDestinationId: string;
  source: string;
  instantTicketingRequired?: boolean;
  paymentCardRequired?: boolean;
  duration?: string;
  segments: ExtendedSegment[];
}

export interface ExtendedSegment extends FlightSegment {
  closedStatus?: string;
  availabilityClasses?: AvailabilityClass[];
}

export interface AvailabilityClass {
  numberOfBookableSeats?: number;
  class: string;
  closedStatus?: string;
  tourAllotment?: { tourName?: string; tourReference?: string };
}

// Flight Order
export interface FlightOrder {
  type: string;
  id: string;
  queuingOfficeId?: string;
  associatedRecords?: AssociatedRecord[];
  flightOffers: FlightOffer[];
  travelers: Traveler[];
  remarks?: { general?: { subType: string; text: string }[] };
  ticketingAgreement?: { option: string; dateTime?: string };
  contacts?: Contact[];
  formOfPayment?: FormOfPayment[];
}

export interface AssociatedRecord {
  reference: string;
  creationDate?: string;
  originSystemCode?: string;
  flightOfferId?: string;
}

export interface Traveler {
  id: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE';
  name: { firstName: string; lastName: string };
  contact?: Contact;
  documents?: TravelDocument[];
}

export interface Contact {
  emailAddress?: string;
  phones?: { deviceType?: string; countryCallingCode?: string; number?: string }[];
  companyName?: string;
  purpose?: string;
}

export interface TravelDocument {
  documentType?: string;
  birthPlace?: string;
  issuanceLocation?: string;
  issuanceDate?: string;
  number?: string;
  expiryDate?: string;
  issuanceCountry?: string;
  validityCountry?: string;
  nationality?: string;
  holder?: boolean;
}

export interface FormOfPayment {
  other?: { method: string; flightOfferIds?: string[] };
  creditCard?: {
    brand?: string;
    binNumber?: string;
    holderName?: string;
    number?: string;
    expiryDate?: string;
    flightOfferIds?: string[];
  };
}

// Flight Date / Inspiration
export interface FlightDate {
  type: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  price: { total: string };
  links?: { flightDestinations?: string; flightOffers?: string };
}

export interface FlightDestination {
  type: string;
  origin: string;
  destination: string;
  departureDate?: string;
  returnDate?: string;
  price: { total: string };
  links?: { flightDates?: string; flightOffers?: string };
}

// Flight Status
export interface DatedFlight {
  type: string;
  scheduledDepartureDate: string;
  flightDesignator: { carrierCode: string; flightNumber: number; operationalSuffix?: string };
  flightPoints?: FlightPoint[];
  segments?: FlightStatusSegment[];
  legs?: FlightLeg[];
}

export interface FlightPoint {
  iataCode: string;
  departure?: FlightTiming;
  arrival?: FlightTiming;
}

export interface FlightTiming {
  terminal?: string;
  gate?: string;
  timings?: { qualifier: string; value: string; delays?: { duration: string }[] }[];
}

export interface FlightStatusSegment {
  boardPointIataCode: string;
  offPointIataCode: string;
  scheduledSegmentDuration?: string;
  partnership?: { operatingFlight?: { carrierCode: string; flightNumber: number } };
}

export interface FlightLeg {
  boardPointIataCode: string;
  offPointIataCode: string;
  aircraftEquipment?: { aircraftType?: string };
  scheduledLegDuration?: string;
}

// Check-in Links
export interface CheckinLink {
  type: string;
  id: string;
  href: string;
  channel: 'Mobile' | 'Web' | 'All';
  parameters?: Record<string, string>;
}

// Seat Map
export interface SeatMap {
  type: string;
  id?: string;
  departure?: FlightEndPoint;
  arrival?: FlightEndPoint;
  carrierCode?: string;
  number?: string;
  aircraft?: { code: string };
  decks?: Deck[];
}

export interface Deck {
  deckType: string;
  deckConfiguration?: { width: number; length: number; startSeatRow?: number; endSeatRow?: number };
  seats?: Seat[];
  facilities?: Facility[];
}

export interface Seat {
  cabin?: string;
  number: string;
  characteristicsCodes?: string[];
  travelerPricing?: { travelerId: string; seatAvailabilityStatus: string; price?: FlightPrice }[];
}

export interface Facility {
  code: string;
  column?: string;
  row?: string;
  position?: string;
}

// ── Reference Data Models ────────────────────────────────────

export interface Location {
  id?: string;
  type: string;
  subType?: string;
  name: string;
  detailedName?: string;
  timeZoneOffset?: string;
  iataCode?: string;
  geoCode?: GeoCode;
  address?: Address;
  distance?: { value: number; unit: string };
  analytics?: { travelers?: { score: number } };
  relevance?: number;
  category?: string;
  tags?: string[];
  rank?: string;
  relationships?: { id: string; type: string; href: string }[];
}

export interface Airline {
  type: string;
  iataCode?: string;
  icaoCode?: string;
  businessName?: string;
  commonName?: string;
}

export interface RecommendedLocation {
  type: string;
  subtype?: string;
  name: string;
  iataCode: string;
  geoCode?: GeoCode;
  relevance?: number;
}

// ── Hotel Models ─────────────────────────────────────────────

export interface Hotel {
  chainCode?: string;
  iataCode?: string;
  dupeId?: number;
  name?: string;
  hotelId: string;
  geoCode?: GeoCode;
  address?: { countryCode?: string };
  distance?: { value: number; unit: string };
  lastUpdate?: string;
}

export interface HotelOffers {
  type: string;
  hotel: HotelInfo;
  available: boolean;
  offers?: HotelOffer[];
  self?: string;
}

export interface HotelInfo {
  hotelId: string;
  chainCode?: string;
  brandCode?: string;
  dupeId?: string;
  name?: string;
  cityCode?: string;
}

export interface HotelOffer {
  id: string;
  checkInDate?: string;
  checkOutDate?: string;
  rateCode: string;
  rateFamilyEstimated?: { code?: string; type?: string };
  category?: string;
  description?: { text?: string; lang?: string };
  commission?: { percentage?: string; amount?: string };
  boardType?: BoardType;
  room: HotelRoom;
  guests?: { adults?: number; childAges?: number[] };
  price: HotelPrice;
  policies?: HotelPolicies;
  self?: string;
}

export interface HotelRoom {
  type?: string;
  typeEstimated?: { category?: string; beds?: number; bedType?: string };
  description?: { text?: string; lang?: string };
}

export interface HotelPrice {
  currency?: string;
  sellingTotal?: string;
  total?: string;
  base?: string;
  taxes?: { code?: string; amount?: string; currency?: string; included?: boolean; description?: string; pricingFrequency?: string; pricingMode?: string }[];
  markups?: { amount?: string }[];
  variations?: { average?: { base?: string; total?: string }; changes?: { startDate: string; endDate: string; base?: string; total?: string }[] };
}

export interface HotelPolicies {
  paymentType?: PaymentType;
  guarantee?: HotelPaymentPolicy;
  deposit?: HotelPaymentPolicy;
  prepay?: HotelPaymentPolicy;
  holdTime?: { deadline?: string };
  cancellations?: CancellationPolicy[];
}

export interface HotelPaymentPolicy {
  acceptedPayments?: {
    creditCards?: string[];
    methods?: string[];
  };
  amount?: string;
  deadline?: string;
  description?: { text?: string; lang?: string };
}

export interface CancellationPolicy {
  type?: string;
  amount?: string;
  numberOfNights?: number;
  percentage?: string;
  deadline?: string;
  description?: { text?: string; lang?: string };
}

export type PaymentType = 'GUARANTEE' | 'DEPOSIT' | 'PREPAY' | 'HOLDTIME';
export type BoardType =
  | 'ROOM_ONLY' | 'BREAKFAST' | 'HALF_BOARD' | 'FULL_BOARD' | 'ALL_INCLUSIVE'
  | 'BUFFET_BREAKFAST' | 'CONTINENTAL_BREAKFAST' | 'ENGLISH_BREAKFAST'
  | 'FULL_BREAKFAST' | 'DINNER_BED_AND_BREAKFAST' | 'LUNCH' | 'DINNER'
  | 'FAMILY_PLAN' | 'AS_BROCHURED' | 'SELF_CATERING' | 'BERMUDA'
  | 'AMERICAN' | 'FAMILY_AMERICAN' | 'MODIFIED';

// Hotel Booking
export interface HotelBookingInput {
  data: {
    type: 'hotel-order';
    guests: HotelGuest[];
    travelAgent?: {
      contact: { email: string; fax?: string; phone?: string };
      travelAgentId?: string;
    };
    roomAssociations: RoomAssociation[];
    payment: HotelPaymentInput;
    arrivalInformation?: { arrivalFlightDetails?: { number?: string; dateTime?: string } };
  };
}

export interface HotelGuest {
  tid?: number;
  id?: number;
  title?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  childAge?: number;
}

export interface RoomAssociation {
  guestReferences: { guestReference: string; hotelLoyaltyId?: string }[];
  hotelOfferId: string;
  specialRequest?: string;
}

export interface HotelPaymentInput {
  method: 'CREDIT_CARD';
  paymentCard: {
    paymentCardInfo: {
      vendorCode: string;
      holderName: string;
      cardNumber: string;
      expiryDate: string;
      securityCode?: string;
    };
    address?: Address;
  };
}

export interface HotelOrder {
  type: string;
  id: string;
  hotelBookings?: HotelBooking[];
  guests?: HotelGuest[];
  associatedRecords?: AssociatedRecord[];
  self?: string;
}

export interface HotelBooking {
  type: string;
  id: string;
  bookingStatus: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'ON_HOLD';
  roomAssociations?: RoomAssociation[];
  hotelOffer?: HotelOffer;
  hotel?: HotelInfo;
  payment?: HotelPaymentInput;
}

// Hotel Autocomplete
export interface HotelAutocomplete {
  id?: string;
  type: string;
  name: string;
  iataCode?: string;
  hotelIds?: string[];
  subType?: string;
  address?: Address;
  geoCode?: GeoCode;
  relevance?: number;
}

// Hotel Sentiments
export interface HotelSentiment {
  hotelId: string;
  type: string;
  overallRating?: number;
  numberOfRatings?: number;
  numberOfReviews?: number;
  sentiments?: {
    sleepQuality?: number;
    service?: number;
    facilities?: number;
    roomComforts?: number;
    valueForMoney?: number;
    catering?: number;
    swimmingPool?: number;
    location?: number;
    internet?: number;
    pointsOfInterest?: number;
    staff?: number;
  };
}

// ── Transfer Models ──────────────────────────────────────────

export interface TransferSearchInput {
  startDateTime: string;
  startLocationCode: string;
  endLocationCode?: string;
  endAddressLine?: string;
  endCityName?: string;
  endZipCode?: string;
  endCountryCode?: string;
  endGeoCode?: string;
  endName?: string;
  endGooglePlaceId?: string;
  transferType?: TransferType;
  passengers?: number;
  duration?: string;
  language?: string;
  currency?: string;
  startAddressLine?: string;
  startCityName?: string;
  startCountryCode?: string;
  startGeoCode?: string;
  startName?: string;
  startGooglePlaceId?: string;
  stopOvers?: StopOverRequest[];
  passengerCharacteristics?: PassengerCharacteristic[];
}

export type TransferType = 'PRIVATE' | 'SHARED' | 'TAXI' | 'HOURLY' | 'AIRPORT_EXPRESS' | 'AIRPORT_BUS';

export interface StopOverRequest {
  duration?: string;
  addressLine?: string;
  countryCode?: string;
  cityName?: string;
  zipCode?: string;
  geoCode?: string;
  name?: string;
  googlePlaceId?: string;
  uicCode?: string;
}

export interface PassengerCharacteristic {
  passengerTypeCode: string;
  age?: number;
}

export interface TransferOffer {
  type: string;
  id: string;
  transferType: TransferType;
  start: TransferLocation;
  end?: TransferLocation;
  stopOvers?: TransferLocation[];
  duration?: string;
  vehicle?: Vehicle;
  serviceProvider?: ServiceProvider;
  quotation: Quotation;
  converted?: Quotation;
  extraServices?: ExtraService[];
  equipment?: Equipment[];
  cancellationRules?: TransferCancellationRule[];
  methodsOfPaymentAccepted?: string[];
  distance?: { value: number; unit: string };
}

export interface TransferLocation {
  dateTime?: string;
  locationCode?: string;
  address?: {
    line?: string;
    zip?: string;
    countryCode?: string;
    cityName?: string;
    stateCode?: string;
    latitude?: number;
    longitude?: number;
  };
  name?: string;
  googlePlaceId?: string;
}

export interface Vehicle {
  code?: string;
  category?: string;
  description?: string;
  seats?: { count?: number }[];
  baggages?: { count?: number; size?: string }[];
  imageURL?: string;
}

export interface ServiceProvider {
  code?: string;
  name?: string;
  logoUrl?: string;
  termsUrl?: string;
  isPreferred?: boolean;
  contacts?: { email?: string; phone?: string }[];
  settings?: string[];
}

export interface Quotation {
  monetaryAmount?: string;
  currencyCode?: string;
  isEstimated?: boolean;
  base?: { monetaryAmount?: string };
  discount?: { monetaryAmount?: string };
  fees?: { indicator?: string; monetaryAmount?: string; currencyCode?: string; description?: string }[];
  totalTaxes?: { monetaryAmount?: string };
  totalTransferAmount?: { monetaryAmount?: string };
}

export interface ExtraService {
  code?: string;
  itemId?: string;
  description?: string;
  quotation?: Quotation;
  isBookable?: boolean;
  taxIncluded?: boolean;
  includedInTotal?: boolean;
}

export interface Equipment {
  code?: string;
  description?: string;
  quotation?: Quotation;
  isBookable?: boolean;
  taxIncluded?: boolean;
  includedInTotal?: boolean;
}

export interface TransferCancellationRule {
  ruleDescription?: string;
  feeType?: 'PERCENTAGE' | 'VALUE';
  feeValue?: string;
  currencyCode?: string;
  metricType?: 'MINUTES' | 'HOURS' | 'DAYS' | 'YEARS';
  metricMin?: string;
  metricMax?: string;
}

// Transfer Booking
export interface TransferBookingInput {
  data: {
    note?: string;
    flightNumber?: string;
    passengers: TransferPassenger[];
    agency?: { name?: string; email?: string };
    payment: TransferPayment;
    equipment?: { code: string }[];
    extraServices?: { code: string }[];
  };
}

export interface TransferPassenger {
  firstName: string;
  lastName: string;
  title?: string;
  contacts?: { phoneNumber?: string; email?: string };
  billingAddress?: Address;
}

export interface TransferPayment {
  methodOfPayment: 'CREDIT_CARD' | 'INVOICE' | 'TRAVEL_ACCOUNT' | 'PAYMENT_SERVICE_PROVIDER';
  creditCard?: {
    number: string;
    holderName: string;
    vendorCode: string;
    expiryDate: string;
    cvv?: string;
  };
}

export interface TransferOrder {
  type: string;
  id: string;
  reference?: string;
  transfers?: TransferReservation[];
  passengers?: TransferPassenger[];
  agency?: { name?: string; email?: string };
}

export interface TransferReservation extends TransferOffer {
  confirmNbr?: string;
  status?: 'CONFIRMED' | 'CANCELLED';
  note?: string;
  methodOfPayment?: string;
  offerId?: string;
}

export interface TransferCancellation {
  confirmNbr: string;
  reservationStatus: 'CANCELLED' | 'CONFIRMED';
}

// ── Activity Models ──────────────────────────────────────────

export interface Activity {
  type: string;
  id: string;
  self?: string;
  name: string;
  shortDescription?: string;
  description?: string;
  geoCode?: GeoCode;
  rating?: string;
  price?: { amount?: string; currencyCode?: string };
  pictures?: string[];
  bookingLink?: string;
  minimumDuration?: string;
}

// ── Market Insights Models ───────────────────────────────────

export interface AirTraffic {
  type: string;
  subType?: string;
  destination?: string;
  period?: string;
  analytics?: {
    flights?: { score: number };
    travelers?: { score: number };
  };
}

// ── Search Params ────────────────────────────────────────────

export interface FlightSearchParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: CabinType;
  nonStop?: boolean;
  currencyCode?: string;
  maxPrice?: number;
  max?: number;
}

export interface FlightCheapestDateParams {
  origin: string;
  destination: string;
  departureDate?: string;
  oneWay?: boolean;
  duration?: string;
  nonStop?: boolean;
  maxPrice?: number;
  viewBy?: 'DATE' | 'DURATION' | 'WEEK';
}

export interface FlightInspirationParams {
  origin: string;
  departureDate?: string;
  oneWay?: boolean;
  duration?: string;
  nonStop?: boolean;
  maxPrice?: number;
  viewBy?: 'COUNTRY' | 'DATE' | 'DESTINATION' | 'DURATION' | 'WEEK';
}

export interface FlightStatusParams {
  carrierCode: string;
  flightNumber: number;
  scheduledDepartureDate: string;
  operationalSuffix?: string;
}

export interface HotelListByCityParams {
  cityCode: string;
  radius?: number;
  radiusUnit?: 'KM' | 'MILE';
  chainCodes?: string[];
  amenities?: string[];
  ratings?: number[];
  hotelSource?: 'BEDBANK' | 'DIRECTCHAIN' | 'ALL';
}

export interface HotelListByGeoParams {
  latitude: number;
  longitude: number;
  radius?: number;
  radiusUnit?: 'KM' | 'MILE';
  chainCodes?: string[];
  amenities?: string[];
  ratings?: number[];
  hotelSource?: 'BEDBANK' | 'DIRECTCHAIN' | 'ALL';
}

export interface HotelSearchParams {
  hotelIds: string[];
  adults?: number;
  checkInDate?: string;
  checkOutDate?: string;
  countryOfResidence?: string;
  roomQuantity?: number;
  priceRange?: string;
  currency?: string;
  paymentPolicy?: 'GUARANTEE' | 'DEPOSIT' | 'NONE';
  boardType?: BoardType;
  includeClosed?: boolean;
  bestRateOnly?: boolean;
  lang?: string;
}

export interface HotelAutocompleteParams {
  keyword: string;
  subType: ('HOTEL_LEISURE' | 'HOTEL_GDS')[];
  countryCode?: string;
  lang?: string;
  max?: number;
}

export interface LocationSearchParams {
  subType: ('AIRPORT' | 'CITY')[];
  keyword: string;
  countryCode?: string;
  'page[limit]'?: number;
  'page[offset]'?: number;
  sort?: string;
  view?: 'LIGHT' | 'FULL';
}

export interface CitySearchParams {
  keyword: string;
  countryCode?: string;
  max?: number;
  include?: string[];
}

export interface ActivitySearchParams {
  latitude: number;
  longitude: number;
  radius?: number;
}

export interface ActivityBySquareParams {
  north: number;
  west: number;
  south: number;
  east: number;
}

export interface AirTrafficParams {
  originCityCode?: string;
  cityCode?: string;
  period: string;
  direction?: 'ARRIVING' | 'DEPARTING';
  max?: number;
  sort?: string;
}
