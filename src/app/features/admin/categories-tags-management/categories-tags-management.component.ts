import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CategoriesStore } from '../../../store/categories.store';
import { TagsStore } from '../../../store/tags.store';
import { ConfirmationDialogComponent } from '../../../shared/components';

@Component({
  selector: 'app-categories-tags-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ConfirmationDialogComponent],
  templateUrl: './categories-tags-management.component.html',
  styleUrl: './categories-tags-management.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoriesTagsManagementComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly categoriesStore = inject(CategoriesStore);
  readonly tagsStore = inject(TagsStore);

  readonly categoryForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    description: ['']
  });

  readonly tagForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]]
  });

  protected editingCategoryId: number | null = null;
  protected editingTagId: number | null = null;

  protected readonly showDeleteCategoryDialog = signal(false);
  protected readonly categoryToDelete = signal<{ id: number; name: string } | null>(null);
  protected readonly categoryDeleteMessage = computed(() => {
    const category = this.categoryToDelete();
    return category
      ? `Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`
      : '';
  });

  protected readonly showDeleteTagDialog = signal(false);
  protected readonly tagToDelete = signal<{ id: number; name: string } | null>(null);
  protected readonly tagDeleteMessage = computed(() => {
    const tag = this.tagToDelete();
    return tag ? `Êtes-vous sûr de vouloir supprimer le tag "${tag.name}" ?` : '';
  });

  // Form validation helpers
  protected readonly categoryNameError = computed(() => {
    const control = this.categoryForm.controls.name;
    if (!control.touched || !control.invalid) {
      return null;
    }
    if (control.errors?.['required']) {
      return 'Le nom est requis';
    }
    if (control.errors?.['minlength']) {
      return 'Minimum 2 caractères';
    }
    return null;
  });

  protected readonly tagNameError = computed(() => {
    const control = this.tagForm.controls.name;
    if (!control.touched || !control.invalid) {
      return null;
    }
    if (control.errors?.['required']) {
      return 'Le nom est requis';
    }
    if (control.errors?.['minlength']) {
      return 'Minimum 2 caractères';
    }
    return null;
  });

  protected categoryNameInputClass(): string {
    const control = this.categoryForm.controls.name;
    return control.touched && control.invalid
      ? 'block w-full px-4 py-3 border border-red-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500'
      : 'block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500';
  }

  protected tagNameInputClass(): string {
    const control = this.tagForm.controls.name;
    return control.touched && control.invalid
      ? 'block w-full px-4 py-3 border border-red-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
      : 'block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
  }

  public ngOnInit(): void {
    this.categoriesStore.loadCategories();
    this.tagsStore.loadTags();
  }

  // Category methods
  protected onSubmitCategory(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const formValue = this.categoryForm.getRawValue();

    if (this.editingCategoryId) {
      this.categoriesStore.updateCategory({
        id: this.editingCategoryId,
        category: formValue
      });
      this.editingCategoryId = null;
    } else {
      this.categoriesStore.createCategory(formValue);
    }

    this.categoryForm.reset();
  }

  protected editCategory(id: number, name: string, description?: string): void {
    this.editingCategoryId = id;
    this.categoryForm.patchValue({ name, description: description || '' });
  }

  protected cancelCategoryEdit(): void {
    this.editingCategoryId = null;
    this.categoryForm.reset();
  }

  protected deleteCategory(id: number, name: string): void {
    this.categoryToDelete.set({ id, name });
    this.showDeleteCategoryDialog.set(true);
  }

  protected onDeleteCategoryConfirmed(): void {
    const category = this.categoryToDelete();
    if (category !== null) {
      this.categoriesStore.deleteCategory(category.id);
    }
    this.showDeleteCategoryDialog.set(false);
    this.categoryToDelete.set(null);
  }

  protected onDeleteCategoryCancelled(): void {
    this.showDeleteCategoryDialog.set(false);
    this.categoryToDelete.set(null);
  }

  // Tag methods
  protected onSubmitTag(): void {
    if (this.tagForm.invalid) {
      this.tagForm.markAllAsTouched();
      return;
    }

    const formValue = this.tagForm.getRawValue();

    if (this.editingTagId) {
      this.tagsStore.updateTag({
        id: this.editingTagId,
        tag: formValue
      });
      this.editingTagId = null;
    } else {
      this.tagsStore.createTag(formValue);
    }

    this.tagForm.reset();
  }

  protected editTag(id: number, name: string): void {
    this.editingTagId = id;
    this.tagForm.patchValue({ name });
  }

  protected cancelTagEdit(): void {
    this.editingTagId = null;
    this.tagForm.reset();
  }

  protected deleteTag(id: number, name: string): void {
    this.tagToDelete.set({ id, name });
    this.showDeleteTagDialog.set(true);
  }

  protected onDeleteTagConfirmed(): void {
    const tag = this.tagToDelete();
    if (tag !== null) {
      this.tagsStore.deleteTag(tag.id);
    }
    this.showDeleteTagDialog.set(false);
    this.tagToDelete.set(null);
  }

  protected onDeleteTagCancelled(): void {
    this.showDeleteTagDialog.set(false);
    this.tagToDelete.set(null);
  }
}
