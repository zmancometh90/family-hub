import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GroceryService } from '../../services/grocery.service';
import { FavoriteService } from '../../services/favorite.service';
import { ConfirmationModalComponent } from '../shared/confirmation-modal';
import { 
  GroceryItemDTO, 
  GroceryItemRequest, 
  FavoriteItemDTO, 
  FavoriteItemRequest 
} from '../../models/grocery.model';
import { UserDTO } from '../../models/user.model';

interface RecipeIngredient {
  amount: string;
  ingredient: string;
}

interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  showIngredients?: boolean;
}

@Component({
  selector: 'app-grocery-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationModalComponent],
  templateUrl: './grocery-list.html',
  styleUrl: './grocery-list.css'
})
export class GroceryListComponent implements OnInit {
  currentUser: UserDTO | null = null;
  activeItems: GroceryItemDTO[] = [];
  completedItems: GroceryItemDTO[] = [];
  favoriteItems: FavoriteItemDTO[] = [];
  recipes: Recipe[] = [];
  favoriteItemNames: Set<string> = new Set();
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  searchTerm = '';
  activeTab = 'active';

  // Form visibility toggles
  showAddItemForm = false;
  showAddFavoriteForm = false;
  showAddRecipeForm = false;
  editingRecipeId: string | null = null;

  // Modal state
  showConfirmModal = false;
  confirmModalTitle = '';
  confirmModalMessage = '';
  confirmModalType: 'primary' | 'danger' = 'danger';
  pendingAction: (() => void) | null = null;

  // Selection state
  selectedItems = new Set<string>();
  selectAllActive = false;
  selectAllCompleted = false;

  // Form data
  newGroceryItem: GroceryItemRequest = {
    name: '',
    description: '',
    category: '',
    quantity: 1
  };

  newFavoriteItem: FavoriteItemRequest = {
    name: '',
    description: '',
    category: '',
    defaultQuantity: 1
  };

  newRecipe = {
    name: '',
    ingredients: [{ amount: '', ingredient: '' }]
  };

  // Common grocery categories
  commonCategories = [
    'Produce',
    'Dairy',
    'Meat & Seafood',
    'Bakery',
    'Frozen',
    'Pantry',
    'Beverages',
    'Snacks',
    'Health & Beauty',
    'Household',
    'Other'
  ];

  constructor(
    private authService: AuthService,
    private groceryService: GroceryService,
    private favoriteService: FavoriteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || !this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadData();
    this.loadRecipes();
  }

  loadData(): void {
    this.isLoading = true;
    this.loadActiveItems();
    this.loadCompletedItems();
    this.loadFavoriteItems();
  }

  loadActiveItems(): void {
    this.groceryService.getActiveGroceryItems().subscribe({
      next: (items) => {
        this.activeItems = items;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading active grocery items:', error);
        this.errorMessage = 'Error loading grocery items';
        this.isLoading = false;
      }
    });
  }

  loadCompletedItems(): void {
    this.groceryService.getCompletedGroceryItems().subscribe({
      next: (items) => {
        this.completedItems = items;
      },
      error: (error) => {
        console.error('Error loading completed grocery items:', error);
      }
    });
  }

  loadFavoriteItems(): void {
    this.favoriteService.getUserFavoriteItems().subscribe({
      next: (items) => {
        this.favoriteItems = items;
        this.favoriteItemNames = new Set(items.map(item => item.name.toLowerCase()));
      },
      error: (error) => {
        console.error('Error loading favorite items:', error);
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.clearMessages();
  }

  toggleAddItemForm(): void {
    this.showAddItemForm = !this.showAddItemForm;
    if (this.showAddItemForm) {
      this.resetNewGroceryItemForm();
    }
  }

  toggleAddFavoriteForm(): void {
    this.showAddFavoriteForm = !this.showAddFavoriteForm;
    if (this.showAddFavoriteForm) {
      this.resetNewFavoriteItemForm();
    }
  }

  resetNewGroceryItemForm(): void {
    this.newGroceryItem = {
      name: '',
      description: '',
      category: '',
      quantity: 1
    };
    this.clearMessages();
  }

  resetNewFavoriteItemForm(): void {
    this.newFavoriteItem = {
      name: '',
      description: '',
      category: '',
      defaultQuantity: 1
    };
    this.clearMessages();
  }

  createGroceryItem(): void {
    if (!this.validateGroceryItemForm()) {
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    this.groceryService.createGroceryItem(this.newGroceryItem).subscribe({
      next: (item) => {
        this.successMessage = `"${item.name}" added to grocery list`;
        this.loadActiveItems();
        this.showAddItemForm = false;
        this.resetNewGroceryItemForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating grocery item:', error);
        this.errorMessage = 'Error adding item to grocery list';
        this.isLoading = false;
      }
    });
  }

  createFavoriteItem(): void {
    if (!this.validateFavoriteItemForm()) {
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    this.favoriteService.createFavoriteItem(this.newFavoriteItem).subscribe({
      next: (item) => {
        this.successMessage = `"${item.name}" added to favorites`;
        this.loadFavoriteItems();
        this.showAddFavoriteForm = false;
        this.resetNewFavoriteItemForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating favorite item:', error);
        this.errorMessage = error.error?.message || 'Error adding item to favorites';
        this.isLoading = false;
      }
    });
  }

  addFavoriteToGroceryList(favorite: FavoriteItemDTO): void {
    const groceryRequest: GroceryItemRequest = {
      name: favorite.name,
      description: favorite.description,
      category: favorite.category,
      quantity: favorite.defaultQuantity
    };

    this.groceryService.createGroceryItem(groceryRequest).subscribe({
      next: (item) => {
        this.successMessage = `"${item.name}" added to grocery list from favorites`;
        this.loadActiveItems();
      },
      error: (error) => {
        console.error('Error adding favorite to grocery list:', error);
        this.errorMessage = 'Error adding favorite to grocery list';
      }
    });
  }

  toggleItemCompletion(item: GroceryItemDTO): void {
    if (!item.id) return;

    if (item.isCompleted) {
      this.groceryService.uncompleteGroceryItem(item.id).subscribe({
        next: () => {
          this.successMessage = `"${item.name}" marked as active`;
          this.loadActiveItems();
          this.loadCompletedItems();
        },
        error: (error) => {
          console.error('Error uncompleting item:', error);
          this.errorMessage = 'Error updating item status';
        }
      });
    } else {
      this.groceryService.completeGroceryItem(item.id).subscribe({
        next: () => {
          this.successMessage = `"${item.name}" marked as completed`;
          this.loadActiveItems();
          this.loadCompletedItems();
        },
        error: (error) => {
          console.error('Error completing item:', error);
          this.errorMessage = 'Error updating item status';
        }
      });
    }
  }

  addToFavorites(item: GroceryItemDTO): void {
    const favoriteRequest: FavoriteItemRequest = {
      name: item.name,
      description: item.description,
      category: item.category,
      defaultQuantity: item.quantity
    };

    this.favoriteService.createFavoriteItem(favoriteRequest).subscribe({
      next: (favoriteItem) => {
        this.successMessage = `"${favoriteItem.name}" added to favorites`;
        this.favoriteItemNames.add(favoriteItem.name.toLowerCase());
        this.loadFavoriteItems();
      },
      error: (error) => {
        console.error('Error adding to favorites:', error);
        if (error.error?.message && error.error.message.includes('already exists')) {
          this.errorMessage = `"${item.name}" is already in your favorites`;
        } else {
          this.errorMessage = 'Error adding item to favorites';
        }
      }
    });
  }

  editGroceryItem(item: GroceryItemDTO): void {
    // TODO: Implement edit functionality
    console.log('Edit item:', item);
  }

  deleteGroceryItem(item: GroceryItemDTO): void {
    if (!item.id) return;
    
    this.showConfirmDialog(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      () => {
        this.groceryService.deleteGroceryItem(item.id!).subscribe({
          next: () => {
            this.successMessage = `"${item.name}" deleted successfully`;
            this.loadActiveItems();
            this.loadCompletedItems();
          },
          error: (error) => {
            console.error('Error deleting grocery item:', error);
            this.errorMessage = 'Error deleting item';
          }
        });
      }
    );
  }

  deleteFavoriteItem(item: FavoriteItemDTO): void {
    if (!item.id) return;
    
    this.showConfirmDialog(
      'Remove Favorite',
      `Are you sure you want to remove "${item.name}" from favorites?`,
      () => {
        this.favoriteService.deleteFavoriteItem(item.id!).subscribe({
          next: () => {
            this.successMessage = `"${item.name}" removed from favorites`;
            this.favoriteItemNames.delete(item.name.toLowerCase());
            this.loadFavoriteItems();
          },
          error: (error) => {
            console.error('Error deleting favorite item:', error);
            this.errorMessage = 'Error removing favorite';
          }
        });
      }
    );
  }

  validateGroceryItemForm(): boolean {
    if (!this.newGroceryItem.name.trim()) {
      this.errorMessage = 'Item name is required';
      return false;
    }
    if (!this.newGroceryItem.category.trim()) {
      this.errorMessage = 'Category is required';
      return false;
    }
    if (this.newGroceryItem.quantity < 1) {
      this.errorMessage = 'Quantity must be at least 1';
      return false;
    }
    return true;
  }

  validateFavoriteItemForm(): boolean {
    if (!this.newFavoriteItem.name.trim()) {
      this.errorMessage = 'Item name is required';
      return false;
    }
    if (!this.newFavoriteItem.category.trim()) {
      this.errorMessage = 'Category is required';
      return false;
    }
    if (this.newFavoriteItem.defaultQuantity < 1) {
      this.errorMessage = 'Default quantity must be at least 1';
      return false;
    }
    return true;
  }

  onSearchChange(): void {
    // Filter items based on search term
    // Implementation already handled in getFilteredItems()
  }

  getFilteredItems(items: GroceryItemDTO[]): GroceryItemDTO[] {
    if (!this.searchTerm.trim()) {
      return items;
    }

    const search = this.searchTerm.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(search) ||
      item.category.toLowerCase().includes(search) ||
      (item.description && item.description.toLowerCase().includes(search))
    );
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  // Recipe functionality
  loadRecipes(): void {
    const storedRecipes = localStorage.getItem('familyHub_recipes');
    if (storedRecipes) {
      this.recipes = JSON.parse(storedRecipes);
    }
  }

  saveRecipes(): void {
    localStorage.setItem('familyHub_recipes', JSON.stringify(this.recipes));
  }

  toggleAddRecipeForm(): void {
    this.showAddRecipeForm = !this.showAddRecipeForm;
    if (this.showAddRecipeForm) {
      this.resetNewRecipeForm();
    }
  }

  resetNewRecipeForm(): void {
    this.newRecipe = {
      name: '',
      ingredients: [{ amount: '', ingredient: '' }]
    };
    this.clearMessages();
  }

  createRecipe(): void {
    if (!this.validateRecipeForm()) {
      return;
    }

    const validIngredients = this.newRecipe.ingredients
      .filter(ing => ing.amount.trim() && ing.ingredient.trim())
      .map(ing => ({
        amount: ing.amount.trim(),
        ingredient: ing.ingredient.trim()
      }));

    const recipe: Recipe = {
      id: Date.now().toString(),
      name: this.newRecipe.name,
      ingredients: validIngredients,
      showIngredients: false
    };

    this.recipes.push(recipe);
    this.saveRecipes();
    this.successMessage = `Recipe "${recipe.name}" created successfully`;
    this.showAddRecipeForm = false;
    this.resetNewRecipeForm();
  }

  validateRecipeForm(): boolean {
    if (!this.newRecipe.name.trim()) {
      this.errorMessage = 'Recipe name is required';
      return false;
    }
    const validIngredients = this.newRecipe.ingredients.filter(ing => ing.amount.trim() && ing.ingredient.trim());
    if (validIngredients.length === 0) {
      this.errorMessage = 'At least one ingredient with amount is required';
      return false;
    }
    return true;
  }

  toggleRecipeIngredients(recipe: Recipe): void {
    recipe.showIngredients = !recipe.showIngredients;
  }

  addRecipeToGroceryList(recipe: Recipe): void {
    let addedCount = 0;
    let errorCount = 0;

    recipe.ingredients.forEach(ingredient => {
      // Include the full amount in the item name instead of parsing it as quantity
      const groceryRequest: GroceryItemRequest = {
        name: `${ingredient.amount} ${ingredient.ingredient}`,
        description: `From recipe: ${recipe.name}`,
        category: 'Recipe Ingredient',
        quantity: 1
      };

      this.groceryService.createGroceryItem(groceryRequest).subscribe({
        next: () => {
          addedCount++;
          if (addedCount + errorCount === recipe.ingredients.length) {
            this.finishAddingRecipe(recipe.name, addedCount, errorCount);
          }
        },
        error: (error) => {
          console.error('Error adding ingredient:', error);
          errorCount++;
          if (addedCount + errorCount === recipe.ingredients.length) {
            this.finishAddingRecipe(recipe.name, addedCount, errorCount);
          }
        }
      });
    });
  }

  finishAddingRecipe(recipeName: string, addedCount: number, errorCount: number): void {
    if (addedCount > 0) {
      this.successMessage = `Added ${addedCount} ingredients from "${recipeName}" to grocery list`;
      this.loadActiveItems();
    }
    if (errorCount > 0) {
      this.errorMessage = `Failed to add ${errorCount} ingredients from "${recipeName}"`;
    }
  }

  deleteRecipe(recipe: Recipe): void {
    this.showConfirmDialog(
      'Delete Recipe',
      `Are you sure you want to delete the recipe "${recipe.name}"?`,
      () => {
        this.recipes = this.recipes.filter(r => r.id !== recipe.id);
        this.saveRecipes();
        this.successMessage = `Recipe "${recipe.name}" deleted successfully`;
      }
    );
  }

  isItemFavorited(item: GroceryItemDTO): boolean {
    return this.favoriteItemNames.has(item.name.toLowerCase());
  }

  addIngredientRow(): void {
    this.newRecipe.ingredients.push({ amount: '', ingredient: '' });
  }

  removeIngredientRow(index: number): void {
    if (this.newRecipe.ingredients.length > 1) {
      this.newRecipe.ingredients.splice(index, 1);
    }
  }

  editRecipe(recipe: Recipe): void {
    this.editingRecipeId = recipe.id;
    this.newRecipe = {
      name: recipe.name,
      ingredients: [...recipe.ingredients.map(ing => ({...ing}))]
    };
    this.showAddRecipeForm = true;
  }

  updateRecipe(): void {
    if (!this.validateRecipeForm() || !this.editingRecipeId) {
      return;
    }

    const validIngredients = this.newRecipe.ingredients
      .filter(ing => ing.amount.trim() && ing.ingredient.trim())
      .map(ing => ({
        amount: ing.amount.trim(),
        ingredient: ing.ingredient.trim()
      }));

    const recipeIndex = this.recipes.findIndex(r => r.id === this.editingRecipeId);
    if (recipeIndex > -1) {
      this.recipes[recipeIndex] = {
        ...this.recipes[recipeIndex],
        name: this.newRecipe.name,
        ingredients: validIngredients
      };
      
      this.saveRecipes();
      this.successMessage = `Recipe "${this.newRecipe.name}" updated successfully`;
      this.showAddRecipeForm = false;
      this.editingRecipeId = null;
      this.resetNewRecipeForm();
    }
  }

  cancelEditRecipe(): void {
    this.editingRecipeId = null;
    this.showAddRecipeForm = false;
    this.resetNewRecipeForm();
  }

  isEditingRecipe(): boolean {
    return this.editingRecipeId !== null;
  }

  // Modal methods
  showConfirmDialog(title: string, message: string, action: () => void, type: 'primary' | 'danger' = 'danger'): void {
    this.confirmModalTitle = title;
    this.confirmModalMessage = message;
    this.confirmModalType = type;
    this.pendingAction = action;
    this.showConfirmModal = true;
  }

  onModalConfirm(): void {
    if (this.pendingAction) {
      this.pendingAction();
      this.pendingAction = null;
    }
    this.showConfirmModal = false;
  }

  onModalCancel(): void {
    this.pendingAction = null;
    this.showConfirmModal = false;
  }

  // Selection methods
  toggleSelectAll(tab: 'active' | 'completed'): void {
    if (tab === 'active') {
      this.selectAllActive = !this.selectAllActive;
      if (this.selectAllActive) {
        this.activeItems.forEach(item => {
          if (item.id) this.selectedItems.add(item.id);
        });
      } else {
        this.activeItems.forEach(item => {
          if (item.id) this.selectedItems.delete(item.id);
        });
      }
    } else {
      this.selectAllCompleted = !this.selectAllCompleted;
      if (this.selectAllCompleted) {
        this.completedItems.forEach(item => {
          if (item.id) this.selectedItems.add(item.id);
        });
      } else {
        this.completedItems.forEach(item => {
          if (item.id) this.selectedItems.delete(item.id);
        });
      }
    }
  }

  toggleItemSelection(itemId: string): void {
    if (this.selectedItems.has(itemId)) {
      this.selectedItems.delete(itemId);
    } else {
      this.selectedItems.add(itemId);
    }
    this.updateSelectAllState();
  }

  updateSelectAllState(): void {
    const activeSelected = this.activeItems.filter(item => item.id && this.selectedItems.has(item.id)).length;
    const completedSelected = this.completedItems.filter(item => item.id && this.selectedItems.has(item.id)).length;
    
    this.selectAllActive = activeSelected === this.activeItems.length && this.activeItems.length > 0;
    this.selectAllCompleted = completedSelected === this.completedItems.length && this.completedItems.length > 0;
  }

  bulkMarkCompleted(): void {
    const selectedActiveItems = this.activeItems.filter(item => item.id && this.selectedItems.has(item.id));
    if (selectedActiveItems.length === 0) return;

    this.showConfirmDialog(
      'Mark Items as Completed',
      `Are you sure you want to mark ${selectedActiveItems.length} item(s) as completed?`,
      () => {
        let completedCount = 0;
        selectedActiveItems.forEach(item => {
          this.groceryService.completeGroceryItem(item.id!).subscribe({
            next: () => {
              completedCount++;
              if (completedCount === selectedActiveItems.length) {
                this.selectedItems.clear();
                this.selectAllActive = false;
                this.successMessage = `${selectedActiveItems.length} item(s) marked as completed`;
                this.loadActiveItems();
                this.loadCompletedItems();
              }
            },
            error: (error) => {
              console.error('Error updating item:', error);
              this.errorMessage = 'Error updating some items';
            }
          });
        });
      }
    );
  }

  bulkDelete(): void {
    const selectedItemsArray = Array.from(this.selectedItems);
    if (selectedItemsArray.length === 0) return;

    const itemsToDelete = [...this.activeItems, ...this.completedItems].filter(item => 
      item.id && this.selectedItems.has(item.id)
    );

    this.showConfirmDialog(
      'Delete Items',
      `Are you sure you want to delete ${itemsToDelete.length} item(s)? This action cannot be undone.`,
      () => {
        let deletedCount = 0;
        itemsToDelete.forEach(item => {
          this.groceryService.deleteGroceryItem(item.id!).subscribe({
            next: () => {
              deletedCount++;
              if (deletedCount === itemsToDelete.length) {
                this.selectedItems.clear();
                this.selectAllActive = false;
                this.selectAllCompleted = false;
                this.successMessage = `${itemsToDelete.length} item(s) deleted`;
                this.loadActiveItems();
                this.loadCompletedItems();
              }
            },
            error: (error) => {
              console.error('Error deleting item:', error);
              this.errorMessage = 'Error deleting some items';
            }
          });
        });
      }
    );
  }

  clearSelection(): void {
    this.selectedItems.clear();
    this.selectAllActive = false;
    this.selectAllCompleted = false;
  }

  getSelectedCount(): number {
    return this.selectedItems.size;
  }
}