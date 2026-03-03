export interface Document {
  id: string;
  name: string;
  url: string;
  fileType: string;
  content: string;
  storagePath: string;
  createdAt?: string;
}
