import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { UsersComponent } from './users.component';
import { UsersStore, User } from '../../store';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let mockStore: jest.Mocked<
    Pick<
      InstanceType<typeof UsersStore>,
      | 'loadUsers'
      | 'updateUser'
      | 'createUser'
      | 'clearSelection'
      | 'deleteUser'
      | 'searchUsers'
      | 'getUsersByRole'
      | 'users'
      | 'isLoading'
      | 'error'
    >
  >;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'ADMIN',
    createdAt: '2025-01-01T00:00:00.000Z',
  };

  const mockUser2: User = {
    id: 2,
    username: 'johndoe',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'USER',
    createdAt: '2025-01-02T00:00:00.000Z',
  };

  beforeEach(async () => {
    // Create mock store with all required methods and signals
    mockStore = {
      loadUsers: jest.fn(),
      updateUser: jest.fn(),
      createUser: jest.fn(),
      clearSelection: jest.fn(),
      deleteUser: jest.fn(),
      searchUsers: jest.fn(() => []),
      getUsersByRole: jest.fn(() => []),
      users: jest.fn(() => [mockUser, mockUser2]),
      isLoading: jest.fn(() => false),
      error: jest.fn(() => null),
    };

    await TestBed.configureTestingModule({
      imports: [UsersComponent],
      providers: [
        { provide: UsersStore, useValue: mockStore },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject UsersStore', () => {
      expect(component['store']).toBeDefined();
      expect(component['store']).toBe(mockStore);
    });

    it('should initialize with default signal values', () => {
      expect(component['showForm']()).toBe(false);
      expect(component['editingUser']()).toBeNull();
      expect(component['filteredUsers']()).toEqual([]);
    });

    it('should initialize with empty searchQuery and roleFilter', () => {
      expect(component['searchQuery']).toBe('');
      expect(component['roleFilter']).toBe('');
    });
  });

  describe('ngOnInit', () => {
    it('should call store.loadUsers on initialization', () => {
      // Arrange & Act
      component.ngOnInit();

      // Assert
      expect(mockStore.loadUsers).toHaveBeenCalledTimes(1);
    });
  });

  describe('onShowCreateForm', () => {
    it('should reset editingUser to null when showing create form', () => {
      // Arrange
      component['editingUser'].set(mockUser);

      // Act
      component.onShowCreateForm();

      // Assert
      expect(component['editingUser']()).toBeNull();
    });

    it('should set showForm to true when showing create form', () => {
      // Arrange
      component['showForm'].set(false);

      // Act
      component.onShowCreateForm();

      // Assert
      expect(component['showForm']()).toBe(true);
    });

    it('should reset editingUser and show form in correct order', () => {
      // Arrange
      component['editingUser'].set(mockUser);
      component['showForm'].set(false);

      // Act
      component.onShowCreateForm();

      // Assert
      expect(component['editingUser']()).toBeNull();
      expect(component['showForm']()).toBe(true);
    });
  });

  describe('onEditUser', () => {
    it('should set editingUser when editing a user', () => {
      // Arrange
      const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation();

      // Act
      component.onEditUser(mockUser);

      // Assert
      expect(component['editingUser']()).toEqual(mockUser);
      scrollToSpy.mockRestore();
    });

    it('should set showForm to true when editing a user', () => {
      // Arrange
      const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation();
      component['showForm'].set(false);

      // Act
      component.onEditUser(mockUser);

      // Assert
      expect(component['showForm']()).toBe(true);
      scrollToSpy.mockRestore();
    });

    it('should scroll to top with smooth behavior when editing a user', () => {
      // Arrange
      const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation();

      // Act
      component.onEditUser(mockUser);

      // Assert
      expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
      scrollToSpy.mockRestore();
    });

    it('should update editingUser, show form, and scroll in correct order', () => {
      // Arrange
      const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation();
      component['editingUser'].set(null);
      component['showForm'].set(false);

      // Act
      component.onEditUser(mockUser2);

      // Assert
      expect(component['editingUser']()).toEqual(mockUser2);
      expect(component['showForm']()).toBe(true);
      expect(scrollToSpy).toHaveBeenCalled();
      scrollToSpy.mockRestore();
    });
  });

  describe('onSubmitUser', () => {
    it('should call store.updateUser when editingUser is set (update mode)', () => {
      // Arrange
      component['editingUser'].set(mockUser);
      const updatedData: Partial<User> = {
        id: 1,
        username: 'updateduser',
        email: 'updated@example.com',
        firstName: 'Updated',
        lastName: 'User',
        role: 'USER',
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      // Act
      component.onSubmitUser(updatedData);

      // Assert
      expect(mockStore.updateUser).toHaveBeenCalledTimes(1);
      expect(mockStore.updateUser).toHaveBeenCalledWith(updatedData);
      expect(mockStore.createUser).not.toHaveBeenCalled();
    });

    it('should call store.createUser when editingUser is null (create mode)', () => {
      // Arrange
      component['editingUser'].set(null);
      const newUserData: Omit<User, 'id' | 'createdAt'> = {
        username: 'newuser',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        role: 'USER',
      };

      // Act
      component.onSubmitUser(newUserData);

      // Assert
      expect(mockStore.createUser).toHaveBeenCalledTimes(1);
      expect(mockStore.createUser).toHaveBeenCalledWith(newUserData);
      expect(mockStore.updateUser).not.toHaveBeenCalled();
    });

    it('should hide form after submission', () => {
      // Arrange
      component['editingUser'].set(null);
      component['showForm'].set(true);
      const userData: Partial<User> = { username: 'test' };

      // Act
      component.onSubmitUser(userData);

      // Assert
      expect(component['showForm']()).toBe(false);
    });

    it('should reset editingUser to null after submission', () => {
      // Arrange
      component['editingUser'].set(mockUser);
      const userData: Partial<User> = { id: 1, username: 'updated' };

      // Act
      component.onSubmitUser(userData);

      // Assert
      expect(component['editingUser']()).toBeNull();
    });

    it('should call store.clearSelection after submission', () => {
      // Arrange
      component['editingUser'].set(null);
      const userData: Partial<User> = { username: 'test' };

      // Act
      component.onSubmitUser(userData);

      // Assert
      expect(mockStore.clearSelection).toHaveBeenCalledTimes(1);
    });

    it('should perform all cleanup steps after update', () => {
      // Arrange
      component['editingUser'].set(mockUser);
      component['showForm'].set(true);
      const userData: Partial<User> = { id: 1, username: 'updated' };

      // Act
      component.onSubmitUser(userData);

      // Assert
      expect(mockStore.updateUser).toHaveBeenCalledWith(userData);
      expect(component['showForm']()).toBe(false);
      expect(component['editingUser']()).toBeNull();
      expect(mockStore.clearSelection).toHaveBeenCalled();
    });

    it('should perform all cleanup steps after create', () => {
      // Arrange
      component['editingUser'].set(null);
      component['showForm'].set(true);
      const userData: Omit<User, 'id' | 'createdAt'> = {
        username: 'newuser',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        role: 'USER',
      };

      // Act
      component.onSubmitUser(userData);

      // Assert
      expect(mockStore.createUser).toHaveBeenCalledWith(userData);
      expect(component['showForm']()).toBe(false);
      expect(component['editingUser']()).toBeNull();
      expect(mockStore.clearSelection).toHaveBeenCalled();
    });
  });

  describe('onCancelEdit', () => {
    it('should hide form when canceling edit', () => {
      // Arrange
      component['showForm'].set(true);

      // Act
      component.onCancelEdit();

      // Assert
      expect(component['showForm']()).toBe(false);
    });

    it('should reset editingUser to null when canceling edit', () => {
      // Arrange
      component['editingUser'].set(mockUser);

      // Act
      component.onCancelEdit();

      // Assert
      expect(component['editingUser']()).toBeNull();
    });

    it('should call store.clearSelection when canceling edit', () => {
      // Act
      component.onCancelEdit();

      // Assert
      expect(mockStore.clearSelection).toHaveBeenCalledTimes(1);
    });

    it('should perform all cleanup steps when canceling', () => {
      // Arrange
      component['showForm'].set(true);
      component['editingUser'].set(mockUser);

      // Act
      component.onCancelEdit();

      // Assert
      expect(component['showForm']()).toBe(false);
      expect(component['editingUser']()).toBeNull();
      expect(mockStore.clearSelection).toHaveBeenCalled();
    });
  });

  describe('onDeleteUser', () => {
    it('should call store.deleteUser with the correct user ID', () => {
      // Act
      component.onDeleteUser(1);

      // Assert
      expect(mockStore.deleteUser).toHaveBeenCalledTimes(1);
      expect(mockStore.deleteUser).toHaveBeenCalledWith(1);
    });

    it('should close form when deleting the currently edited user', () => {
      // Arrange
      component['editingUser'].set(mockUser);
      component['showForm'].set(true);
      const cancelSpy = jest.spyOn(component, 'onCancelEdit');

      // Act
      component.onDeleteUser(1);

      // Assert
      expect(cancelSpy).toHaveBeenCalledTimes(1);
      cancelSpy.mockRestore();
    });

    it('should not close form when deleting a different user', () => {
      // Arrange
      component['editingUser'].set(mockUser);
      component['showForm'].set(true);
      const cancelSpy = jest.spyOn(component, 'onCancelEdit');

      // Act
      component.onDeleteUser(2); // Different ID

      // Assert
      expect(cancelSpy).not.toHaveBeenCalled();
      expect(component['showForm']()).toBe(true);
      cancelSpy.mockRestore();
    });

    it('should not close form when editingUser is null', () => {
      // Arrange
      component['editingUser'].set(null);
      component['showForm'].set(true);
      const cancelSpy = jest.spyOn(component, 'onCancelEdit');

      // Act
      component.onDeleteUser(1);

      // Assert
      expect(cancelSpy).not.toHaveBeenCalled();
      expect(component['showForm']()).toBe(true);
      cancelSpy.mockRestore();
    });

    it('should delete user and close form when IDs match', () => {
      // Arrange
      component['editingUser'].set(mockUser);
      component['showForm'].set(true);

      // Act
      component.onDeleteUser(1);

      // Assert
      expect(mockStore.deleteUser).toHaveBeenCalledWith(1);
      expect(component['showForm']()).toBe(false);
      expect(component['editingUser']()).toBeNull();
      expect(mockStore.clearSelection).toHaveBeenCalled();
    });
  });

  describe('onSearch', () => {
    it('should call store.searchUsers when searchQuery has value', () => {
      // Arrange
      component['searchQuery'] = 'test';
      const mockResults = [mockUser];
      mockStore.searchUsers.mockReturnValue(mockResults);

      // Act
      component.onSearch();

      // Assert
      expect(mockStore.searchUsers).toHaveBeenCalledTimes(1);
      expect(mockStore.searchUsers).toHaveBeenCalledWith('test');
      expect(component['filteredUsers']()).toEqual(mockResults);
    });

    it('should trim searchQuery before searching', () => {
      // Arrange
      component['searchQuery'] = '  test  ';
      const mockResults = [mockUser];
      mockStore.searchUsers.mockReturnValue(mockResults);

      // Act
      component.onSearch();

      // Assert
      expect(mockStore.searchUsers).toHaveBeenCalledWith('  test  ');
      expect(component['filteredUsers']()).toEqual(mockResults);
    });

    it('should call store.getUsersByRole when searchQuery is empty but roleFilter has value', () => {
      // Arrange
      component['searchQuery'] = '';
      component['roleFilter'] = 'ADMIN';
      const mockResults = [mockUser];
      mockStore.getUsersByRole.mockReturnValue(mockResults);

      // Act
      component.onSearch();

      // Assert
      expect(mockStore.getUsersByRole).toHaveBeenCalledTimes(1);
      expect(mockStore.getUsersByRole).toHaveBeenCalledWith('ADMIN');
      expect(component['filteredUsers']()).toEqual(mockResults);
      expect(mockStore.searchUsers).not.toHaveBeenCalled();
    });

    it('should clear filteredUsers when both searchQuery and roleFilter are empty', () => {
      // Arrange
      component['searchQuery'] = '';
      component['roleFilter'] = '';
      component['filteredUsers'].set([mockUser, mockUser2]);

      // Act
      component.onSearch();

      // Assert
      expect(component['filteredUsers']()).toEqual([]);
      expect(mockStore.searchUsers).not.toHaveBeenCalled();
      expect(mockStore.getUsersByRole).not.toHaveBeenCalled();
    });

    it('should not search when searchQuery contains only whitespace', () => {
      // Arrange
      component['searchQuery'] = '   ';
      component['roleFilter'] = '';

      // Act
      component.onSearch();

      // Assert
      expect(mockStore.searchUsers).not.toHaveBeenCalled();
      expect(component['filteredUsers']()).toEqual([]);
    });

    it('should prefer searchQuery over roleFilter when both are present', () => {
      // Arrange
      component['searchQuery'] = 'test';
      component['roleFilter'] = 'ADMIN';
      const mockResults = [mockUser];
      mockStore.searchUsers.mockReturnValue(mockResults);

      // Act
      component.onSearch();

      // Assert
      expect(mockStore.searchUsers).toHaveBeenCalledWith('test');
      expect(mockStore.getUsersByRole).not.toHaveBeenCalled();
      expect(component['filteredUsers']()).toEqual(mockResults);
    });

    it('should update filteredUsers with search results', () => {
      // Arrange
      component['searchQuery'] = 'john';
      const mockResults = [mockUser2];
      mockStore.searchUsers.mockReturnValue(mockResults);

      // Act
      component.onSearch();

      // Assert
      expect(component['filteredUsers']()).toEqual(mockResults);
    });

    it('should handle empty search results', () => {
      // Arrange
      component['searchQuery'] = 'nonexistent';
      mockStore.searchUsers.mockReturnValue([]);

      // Act
      component.onSearch();

      // Assert
      expect(component['filteredUsers']()).toEqual([]);
    });
  });

  describe('onFilterByRole', () => {
    it('should call store.getUsersByRole when roleFilter has value', () => {
      // Arrange
      component['roleFilter'] = 'ADMIN';
      const mockResults = [mockUser];
      mockStore.getUsersByRole.mockReturnValue(mockResults);

      // Act
      component.onFilterByRole();

      // Assert
      expect(mockStore.getUsersByRole).toHaveBeenCalledTimes(1);
      expect(mockStore.getUsersByRole).toHaveBeenCalledWith('ADMIN');
      expect(component['filteredUsers']()).toEqual(mockResults);
    });

    it('should call onSearch when roleFilter is empty but searchQuery has value', () => {
      // Arrange
      component['roleFilter'] = '';
      component['searchQuery'] = 'test';
      const searchSpy = jest.spyOn(component, 'onSearch');

      // Act
      component.onFilterByRole();

      // Assert
      expect(searchSpy).toHaveBeenCalledTimes(1);
      searchSpy.mockRestore();
    });

    it('should clear filteredUsers when both roleFilter and searchQuery are empty', () => {
      // Arrange
      component['roleFilter'] = '';
      component['searchQuery'] = '';
      component['filteredUsers'].set([mockUser, mockUser2]);

      // Act
      component.onFilterByRole();

      // Assert
      expect(component['filteredUsers']()).toEqual([]);
      expect(mockStore.getUsersByRole).not.toHaveBeenCalled();
    });

    it('should prefer roleFilter over searchQuery when both are present', () => {
      // Arrange
      component['roleFilter'] = 'USER';
      component['searchQuery'] = 'test';
      const mockResults = [mockUser2];
      mockStore.getUsersByRole.mockReturnValue(mockResults);
      const searchSpy = jest.spyOn(component, 'onSearch');

      // Act
      component.onFilterByRole();

      // Assert
      expect(mockStore.getUsersByRole).toHaveBeenCalledWith('USER');
      expect(searchSpy).not.toHaveBeenCalled();
      expect(component['filteredUsers']()).toEqual(mockResults);
      searchSpy.mockRestore();
    });

    it('should update filteredUsers with role filter results', () => {
      // Arrange
      component['roleFilter'] = 'USER';
      const mockResults = [mockUser2];
      mockStore.getUsersByRole.mockReturnValue(mockResults);

      // Act
      component.onFilterByRole();

      // Assert
      expect(component['filteredUsers']()).toEqual(mockResults);
    });

    it('should handle empty filter results', () => {
      // Arrange
      component['roleFilter'] = 'NONEXISTENT_ROLE';
      mockStore.getUsersByRole.mockReturnValue([]);

      // Act
      component.onFilterByRole();

      // Assert
      expect(component['filteredUsers']()).toEqual([]);
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should maintain state consistency when switching between create and edit modes', () => {
      // Arrange
      const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation();

      // Start with create form
      component.onShowCreateForm();
      expect(component['editingUser']()).toBeNull();
      expect(component['showForm']()).toBe(true);

      // Switch to edit
      component.onEditUser(mockUser);
      expect(component['editingUser']()).toEqual(mockUser);
      expect(component['showForm']()).toBe(true);

      // Back to create
      component.onShowCreateForm();
      expect(component['editingUser']()).toBeNull();
      expect(component['showForm']()).toBe(true);

      scrollToSpy.mockRestore();
    });

    it('should handle multiple consecutive searches', () => {
      // Arrange
      mockStore.searchUsers.mockReturnValueOnce([mockUser]).mockReturnValueOnce([mockUser2]);

      // First search
      component['searchQuery'] = 'test';
      component.onSearch();
      expect(component['filteredUsers']()).toEqual([mockUser]);

      // Second search
      component['searchQuery'] = 'john';
      component.onSearch();
      expect(component['filteredUsers']()).toEqual([mockUser2]);
    });

    it('should handle switching between search and role filter', () => {
      // Search first
      component['searchQuery'] = 'test';
      mockStore.searchUsers.mockReturnValue([mockUser]);
      component.onSearch();
      expect(component['filteredUsers']()).toEqual([mockUser]);

      // Then filter by role
      component['searchQuery'] = '';
      component['roleFilter'] = 'USER';
      mockStore.getUsersByRole.mockReturnValue([mockUser2]);
      component.onFilterByRole();
      expect(component['filteredUsers']()).toEqual([mockUser2]);
    });

    it('should handle form submission after deleting a user', () => {
      // Setup edit mode
      component['editingUser'].set(mockUser);
      component['showForm'].set(true);

      // Delete the user being edited
      component.onDeleteUser(1);
      expect(component['showForm']()).toBe(false);
      expect(component['editingUser']()).toBeNull();

      // Try to show create form after deletion
      component.onShowCreateForm();
      expect(component['showForm']()).toBe(true);
      expect(component['editingUser']()).toBeNull();
    });

    it('should not throw error when deleting non-existent user ID', () => {
      // Arrange
      component['editingUser'].set(null);

      // Act & Assert - should not throw
      expect(() => component.onDeleteUser(999)).not.toThrow();
      expect(mockStore.deleteUser).toHaveBeenCalledWith(999);
    });

    it('should handle rapid form open/close operations', () => {
      // Multiple rapid operations
      component.onShowCreateForm();
      expect(component['showForm']()).toBe(true);

      component.onCancelEdit();
      expect(component['showForm']()).toBe(false);

      component.onShowCreateForm();
      expect(component['showForm']()).toBe(true);

      component.onCancelEdit();
      expect(component['showForm']()).toBe(false);
    });
  });
});
