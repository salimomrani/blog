import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CategoriesStore } from '../../store/categories.store';
import { TagsStore } from '../../store/tags.store';

@Component({
  selector: 'app-categories-tags-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
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
    if (confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${name}" ?`)) {
      this.categoriesStore.deleteCategory(id);
    }
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
    if (confirm(`Êtes-vous sûr de vouloir supprimer le tag "${name}" ?`)) {
      this.tagsStore.deleteTag(id);
    }
  }
}
