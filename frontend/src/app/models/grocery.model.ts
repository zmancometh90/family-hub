import { UserDTO } from './user.model';

export interface GroceryItem {
  id?: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  isCompleted: boolean;
  addedBy: string;
  completedBy?: string;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GroceryItemDTO {
  id?: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  isCompleted: boolean;
  addedBy: UserDTO;
  completedBy?: UserDTO;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GroceryItemRequest {
  name: string;
  description?: string;
  category: string;
  quantity: number;
}

export interface FavoriteItem {
  id?: string;
  name: string;
  description?: string;
  category: string;
  defaultQuantity: number;
  user: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FavoriteItemDTO {
  id?: string;
  name: string;
  description?: string;
  category: string;
  defaultQuantity: number;
  user: UserDTO;
  createdAt?: string;
  updatedAt?: string;
}

export interface FavoriteItemRequest {
  name: string;
  description?: string;
  category: string;
  defaultQuantity: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}