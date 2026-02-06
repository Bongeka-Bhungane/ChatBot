export interface Document {
  id?: string;
  name: string;
  fileType: string;
  url: string;
  content: string;
  storagePath: string;
  createdAt?: Date;
  updatedAt?: Date;
}
