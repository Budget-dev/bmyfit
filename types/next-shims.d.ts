declare module "next" {
  export type Metadata = {
    metadataBase?: URL;
    title?: string | { default: string; template?: string };
    description?: string;
    robots?: {
      index?: boolean;
      follow?: boolean;
    };
    openGraph?: Record<string, unknown>;
  };

  export type NextConfig = {
    reactStrictMode?: boolean;
    env?: Record<string, string>;
    headers?: () => Promise<Array<{ source: string; headers: Array<{ key: string; value: string }> }>>;
    images?: Record<string, unknown>;
    webpack?: (config: any, options: any) => any;
    [key: string]: any;
  };

  export namespace MetadataRoute {
    export type Robots = {
      rules: {
        userAgent: string | string[];
        allow?: string | string[];
        disallow?: string | string[];
      } | Array<{
        userAgent: string | string[];
        allow?: string | string[];
        disallow?: string | string[];
      }>;
      sitemap?: string | string[];
      host?: string;
    };

    export type Sitemap = Array<{
      url: string;
      lastModified?: string | Date;
      changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
      priority?: number;
    }>;
  }
}

declare module "next/link" {
  import type { AnchorHTMLAttributes, ReactNode, ComponentType } from "react";
  export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    children?: ReactNode;
    prefetch?: boolean;
    replace?: boolean;
    className?: string;
  }
  const Link: ComponentType<LinkProps>;
  export default Link;
}

declare module "next/image" {
  import type { ImgHTMLAttributes, ComponentType } from "react";
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height"> {
    src: string | any;
    alt: string;
    width?: number | `${number}`;
    height?: number | `${number}`;
    fill?: boolean;
    quality?: number | `${number}`;
    priority?: boolean;
    loading?: "eager" | "lazy";
    placeholder?: "blur" | "empty";
    blurDataURL?: string;
    unoptimized?: boolean;
    sizes?: string;
  }
  const Image: ComponentType<ImageProps>;
  export default Image;
}


declare module "next/navigation" {
  export function useRouter(): {
    push(url: string): void;
    replace(url: string): void;
    refresh(): void;
    back(): void;
    forward(): void;
    prefetch(url: string): void;
  };
  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
  export function useParams<T = Record<string, string | string[]>>(): T;
  export function notFound(): never;
  export function redirect(url: string): never;
}

declare module "next/script" {
  import type { ScriptHTMLAttributes, ComponentType } from "react";
  export interface ScriptProps extends ScriptHTMLAttributes<HTMLScriptElement> {
    strategy?: "beforeInteractive" | "afterInteractive" | "lazyOnload" | "worker";
    onLoad?: () => void;
    onError?: (e: any) => void;
  }
  const Script: ComponentType<ScriptProps>;
  export default Script;
}

declare module "next/headers" {
  export function headers(): Promise<Headers>;
  export function cookies(): Promise<any>;
}

declare module "next/server" {
  export class NextRequest extends Request {
    nextUrl: URL;
    cookies: any;
  }
  export class NextResponse<Body = any> extends Response {
    static json<JsonBody>(data: JsonBody, init?: ResponseInit): NextResponse<JsonBody>;
    static redirect(url: string | URL, init?: number | ResponseInit): NextResponse;
    static next(init?: ResponseInit): NextResponse;
  }
}

declare module "next/server.js" {
  export * from "next/server";
}

declare module "next/dist/lib/metadata/types/metadata-interface.js" {
  export type Metadata = any;
  export type ResolvingMetadata = any;
  export type ResolvingViewport = any;
}

declare module "next/types.js" {
  export type Metadata = any;
  export type ResolvingMetadata = any;
  export type ResolvingViewport = any;
}

declare module "next/font/google" {
  export type FontOptions = {
    subsets?: string[];
    weight?: string | string[];
    style?: string | string[];
    display?: "auto" | "block" | "swap" | "fallback" | "optional";
    variable?: string;
    preload?: boolean;
    fallback?: string[];
    adjustFontFallback?: boolean;
  };

  export type NextFontWithVariable = {
    className: string;
    variable: string;
    style: { fontFamily: string; fontWeight?: number; fontStyle?: string };
  };

  export function Inter(options?: FontOptions): NextFontWithVariable;
  export function Oswald(options?: FontOptions): NextFontWithVariable;
  export function Caveat(options?: FontOptions): NextFontWithVariable;
}



