export interface Product {
  id?: string;
  name: string;
  category: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  expiryDate?: string;
  supplierName?: string;
  barcode?: string;
  lowStockThreshold?: number;
  userId: string;
  createdAt: string;
}

export interface Sale {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  totalPrice: number;
  timestamp: string;
  userId: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  role: 'admin';
  shopName?: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
