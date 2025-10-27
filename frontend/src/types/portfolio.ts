export type FieldType = "text"|"multiline"|"image"|"date"|"url"|"chips";

export interface SchemaField { key: string; type: FieldType; label?: string; }
export interface SchemaSection { key: string; label: string; fields: SchemaField[]; repeatable?: boolean; }
export interface TemplateSchema { sections: SchemaSection[]; }

export interface TemplateDTO {
  key: string;
  name: string;
  description: string;
  schema: TemplateSchema;
  default_theme: Record<string,string>;
  preview_image?: string;
}

export interface PortfolioDraft {
  id: string;                    
  title: string;
  template_key: string;
  data: any;
  theme_overrides: Record<string,string>;
  created_at: string;
  updated_at: string;
  slug?: string;                 
  is_published?: boolean;
}
