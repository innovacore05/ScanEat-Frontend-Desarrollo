export const DEFAULT_THEME = {
    primaryColor: "#61AD9E",
    secondaryColor: "#2C7667",
    fontFamily: "Lato",
    logoUrl: "/img/LogoS.svg",
} as const;

export const AVAILABLE_FONTS = [
    "Lato",
    "Inter",
    "Poppins",
    "Roboto",
    "Montserrat",
    "Playfair Display",
] as const;

export type RestaurantFont =
    (typeof AVAILABLE_FONTS)[number];

export interface RestaurantTheme {
    businessId: number;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: RestaurantFont;
    logoUrl: string | null;
}

export type ThemeFormValues = Omit<
    RestaurantTheme,
    "businessId"
>;

export function isValidHexColor(value: string) {
    return /^#[0-9A-Fa-f]{6}$/.test(value);
}