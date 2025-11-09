import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommentListComponent } from './comment-list.component';
import { CommentsStore } from '../../store/comments.store';
import { AuthStore } from '../../store/auth.store';
import { signal } from '@angular/core';
import { CommentDto, AuthorDto } from '../../shared/models/comment.model';

describe('CommentListComponent', () => {
  let component: CommentListComponent;
  let fixture: ComponentFixture<CommentListComponent>;
  let mockCommentsStore: jest.Mocked<CommentsStore>;
  let mockAuthStore: jest.Mocked<AuthStore>;

  const mockAuthor: AuthorDto = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    fullName: 'John Doe'
  };

  const mockComment: CommentDto = {
    id: 1,
    content: 'Test comment',
    articleId: 1,
    author: mockAuthor,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    replies: []
  };

  beforeEach(async () => {
    // Create mock stores with signal properties
    mockCommentsStore = {
      comments: jest.fn(() => [mockComment]),
      nestedComments: jest.fn(() => [mockComment]),
      hasComments: jest.fn(() => true),
      commentsCount: jest.fn(() => 1),
      isLoading: jest.fn(() => false),
      error: jest.fn(() => null),
      loadCommentsByArticleId: jest.fn(),
      deleteComment: jest.fn(),
      createComment: jest.fn(),
      updateComment: jest.fn()
    } as unknown as jest.Mocked<CommentsStore>;

    mockAuthStore = {
      user: jest.fn(() => ({ id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' })),
      isAuthenticated: jest.fn(() => true),
      isLoading: jest.fn(() => false),
      error: jest.fn(() => null)
    } as unknown as jest.Mocked<AuthStore>;

    await TestBed.configureTestingModule({
      imports: [CommentListComponent],
      providers: [
        { provide: CommentsStore, useValue: mockCommentsStore },
        { provide: AuthStore, useValue: mockAuthStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CommentListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('articleId', 1);
  });

  describe('initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load comments on init with articleId', () => {
      fixture.detectChanges();

      expect(mockCommentsStore.loadCommentsByArticleId).toHaveBeenCalledWith(1);
      expect(mockCommentsStore.loadCommentsByArticleId).toHaveBeenCalledTimes(1);
    });

    it('should initialize signals with default values', () => {
      expect(component.replyingTo()).toBeNull();
      expect(component.showRepliesForCommentIds()).toEqual(new Set());
      expect(component['showDeleteDialog']()).toBe(false);
      expect(component['commentToDelete']()).toBeNull();
    });
  });

  describe('delete confirmation dialog', () => {
    it('should open delete dialog when deleteComment is called', () => {
      const commentId = 1;

      component.deleteComment(commentId);

      expect(component['showDeleteDialog']()).toBe(true);
      expect(component['commentToDelete']()).toBe(commentId);
    });

    it('should call store deleteComment and close dialog when deletion is confirmed', () => {
      const commentId = 1;
      component.deleteComment(commentId);

      component['onDeleteConfirmed']();

      expect(mockCommentsStore.deleteComment).toHaveBeenCalledWith(commentId);
      expect(mockCommentsStore.deleteComment).toHaveBeenCalledTimes(1);
      expect(component['showDeleteDialog']()).toBe(false);
      expect(component['commentToDelete']()).toBeNull();
    });

    it('should not call store deleteComment when commentToDelete is null', () => {
      component['commentToDelete'].set(null);
      component['showDeleteDialog'].set(true);

      component['onDeleteConfirmed']();

      expect(mockCommentsStore.deleteComment).not.toHaveBeenCalled();
      expect(component['showDeleteDialog']()).toBe(false);
    });

    it('should close dialog without deleting when deletion is cancelled', () => {
      const commentId = 1;
      component.deleteComment(commentId);

      component['onDeleteCancelled']();

      expect(mockCommentsStore.deleteComment).not.toHaveBeenCalled();
      expect(component['showDeleteDialog']()).toBe(false);
      expect(component['commentToDelete']()).toBeNull();
    });
  });

  describe('comment author verification', () => {
    it('should return true when current user is the comment author', () => {
      const authorId = 1;

      const result = component.isCommentAuthor(authorId);

      expect(result).toBe(true);
    });

    it('should return false when current user is not the comment author', () => {
      const authorId = 2;

      const result = component.isCommentAuthor(authorId);

      expect(result).toBe(false);
    });

    it('should return false when user is not authenticated', () => {
      mockAuthStore.user = jest.fn(() => null);
      const authorId = 1;

      const result = component.isCommentAuthor(authorId);

      expect(result).toBe(false);
    });
  });

  describe('reply functionality', () => {
    it('should set replyingTo when toggleReply is called with new commentId', () => {
      const commentId = 1;

      component.toggleReply(commentId);

      expect(component.replyingTo()).toBe(commentId);
    });

    it('should set replyingTo to null when toggleReply is called with current commentId', () => {
      const commentId = 1;
      component.toggleReply(commentId);
      expect(component.replyingTo()).toBe(commentId);

      component.toggleReply(commentId);

      expect(component.replyingTo()).toBeNull();
    });

    it('should switch replyingTo when toggleReply is called with different commentId', () => {
      const firstCommentId = 1;
      const secondCommentId = 2;

      component.toggleReply(firstCommentId);
      expect(component.replyingTo()).toBe(firstCommentId);

      component.toggleReply(secondCommentId);
      expect(component.replyingTo()).toBe(secondCommentId);
    });

    it('should reset replyingTo when comment is submitted', () => {
      component.replyingTo.set(1);

      component.onCommentSubmitted();

      expect(component.replyingTo()).toBeNull();
    });
  });

  describe('show replies functionality', () => {
    it('should add commentId to showRepliesForCommentIds when toggleShowReplies is called first time', () => {
      const commentId = 1;

      component.toggleShowReplies(commentId);

      expect(component.showRepliesForCommentIds().has(commentId)).toBe(true);
    });

    it('should remove commentId from showRepliesForCommentIds when toggleShowReplies is called second time', () => {
      const commentId = 1;
      component.toggleShowReplies(commentId);
      expect(component.showRepliesForCommentIds().has(commentId)).toBe(true);

      component.toggleShowReplies(commentId);

      expect(component.showRepliesForCommentIds().has(commentId)).toBe(false);
    });

    it('should handle multiple comment IDs independently', () => {
      const commentId1 = 1;
      const commentId2 = 2;

      component.toggleShowReplies(commentId1);
      component.toggleShowReplies(commentId2);

      expect(component.showRepliesForCommentIds().has(commentId1)).toBe(true);
      expect(component.showRepliesForCommentIds().has(commentId2)).toBe(true);
      expect(component.showRepliesForCommentIds().size).toBe(2);
    });

    it('should return true when shouldShowReplies is called for visible comment', () => {
      const commentId = 1;
      component.toggleShowReplies(commentId);

      const result = component.shouldShowReplies(commentId);

      expect(result).toBe(true);
    });

    it('should return false when shouldShowReplies is called for hidden comment', () => {
      const commentId = 1;

      const result = component.shouldShowReplies(commentId);

      expect(result).toBe(false);
    });
  });

  describe('trackBy function', () => {
    it('should return comment id for trackByComment', () => {
      const comment: CommentDto = {
        ...mockComment,
        id: 42
      };

      const result = component.trackByComment(0, comment);

      expect(result).toBe(42);
    });
  });

  describe('store integration', () => {
    it('should access comments from store', () => {
      const comments = component.commentsStore.comments();

      expect(comments).toEqual([mockComment]);
      expect(mockCommentsStore.comments).toHaveBeenCalled();
    });

    it('should access auth user from store', () => {
      const user = component.authStore.user();

      expect(user).toBeDefined();
      expect(user?.id).toBe(1);
      expect(mockAuthStore.user).toHaveBeenCalled();
    });
  });
});
