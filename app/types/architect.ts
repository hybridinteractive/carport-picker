export enum HouseStyle {
  MINIMALIST = 'Minimalist',
  BRUTALIST = 'Brutalist',
  SCANDINAVIAN = 'Scandinavian',
  MID_CENTURY_MODERN = 'Mid-Century Modern',
  CONTEMPORARY_LUXURY = 'Contemporary Luxury',
  CUSTOM = 'Custom (Upload Image)',
}

export enum MetalColor {
  SUN_SILVER = 'Sun Silver (SLC)',
  URBAN_GRAY = 'Urban Gray (UC)',
  DARK_BRONZE = 'Dark Bronze (BD)',
  BLACK = 'Black (KC)',
  WHITE = 'White (WH)',
  BRONZE = 'Bronze (BR)',
  EARTH_BROWN = 'Earth Brown (BNC)',
}

export enum RoofPanelType {
  ALUMINUM = 'Aluminum',
  POLYCARBONATE = 'Polycarbonate (Lexan)',
}

export enum AluminumPanelColor {
  URBAN_GRAY = 'Urban Gray Aluminum',
  DEEP_BROWN = 'Deep Brown Aluminum',
}

export enum PolycarbonatePanelType {
  BROWN = 'Brown Panel',
  BLUE = 'Blue Panel',
  FROSTED = 'Frosted Panel',
  AO_HEAT_CUT = 'AO Heat-cut',
  FROSTED_HEAT_CUT = 'Frosted Heat-cut',
  INFRARED_HC_FROSTED = 'Infra-red HC Frosted',
}

export interface GenerationConfig {
  style: HouseStyle
  placement: string
  carportReferenceImage: string | null
  houseReferenceImage: string | null
  metalColor: MetalColor
  roofPanelType: RoofPanelType
  aluminumPanelColor: AluminumPanelColor | null
  polycarbonatePanelType: PolycarbonatePanelType | null
}

export interface GenerationState {
  isGenerating: boolean
  resultUrl: string | null
  error: string | null
}

export interface CarportOption {
  id: string
  name: string
  imageUrl: string
  aboutSystem?: string
  specifications?: string
}
