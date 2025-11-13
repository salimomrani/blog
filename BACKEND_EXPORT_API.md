# Backend API - Export d'articles en PDF

Ce document décrit l'endpoint à implémenter côté **Spring Boot** pour l'export d'articles en PDF.

## 📋 Table des matières

1. [Endpoint requis](#endpoint-requis)
2. [Technologies recommandées](#technologies-recommandées)
3. [Exemple d'implémentation Spring Boot](#exemple-dimplémentation-spring-boot)
4. [Exemple avec iText PDF](#exemple-avec-itext-pdf)
5. [Gestion des erreurs](#gestion-des-erreurs)
6. [Tests](#tests)

---

## Endpoint requis

### `GET /api/v1/articles/{id}/export/pdf`

**Description**: Génère et retourne un PDF de l'article spécifié.

**Paramètres**:
- `id` (path): ID de l'article à exporter

**Headers de réponse**:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="article-{id}-{title}.pdf"
```

**Codes de réponse**:
- `200 OK`: PDF généré avec succès
- `404 NOT_FOUND`: Article introuvable
- `500 INTERNAL_SERVER_ERROR`: Erreur lors de la génération du PDF

---

## Technologies recommandées

### Option 1: **iText PDF** (Recommandé) ⭐
- Librairie Java mature et robuste
- Excellent support du HTML/CSS
- Gestion avancée des polices et images
- Version Community disponible (AGPL)

```xml
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itext7-core</artifactId>
    <version>7.2.5</version>
</dependency>
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>html2pdf</artifactId>
    <version>4.0.5</version>
</dependency>
```

### Option 2: **Apache PDFBox**
- Complètement open source (Apache License)
- Plus léger qu'iText
- Moins de fonctionnalités avancées

```xml
<dependency>
    <groupId>org.apache.pdfbox</groupId>
    <artifactId>pdfbox</artifactId>
    <version>2.0.29</version>
</dependency>
```

### Option 3: **Flying Saucer + iText**
- Excellent rendu HTML/CSS vers PDF
- Utilise iText en arrière-plan

```xml
<dependency>
    <groupId>org.xhtmlrenderer</groupId>
    <artifactId>flying-saucer-pdf-itext5</artifactId>
    <version>9.1.22</version>
</dependency>
```

---

## Exemple d'implémentation Spring Boot

### Controller

```java
package com.blog.controller;

import com.blog.service.ArticleExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/articles")
@RequiredArgsConstructor
public class ArticleExportController {

    private final ArticleExportService exportService;

    @GetMapping("/{id}/export/pdf")
    public ResponseEntity<Resource> exportArticleToPdf(@PathVariable Long id) {
        try {
            // Generate PDF
            byte[] pdfBytes = exportService.generateArticlePdf(id);

            // Get article title for filename
            String filename = exportService.generateFilename(id);

            ByteArrayResource resource = new ByteArrayResource(pdfBytes);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .contentLength(pdfBytes.length)
                    .body(resource);

        } catch (ArticleNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
```

### Service

```java
package com.blog.service;

import com.blog.entity.Article;
import com.blog.exception.ArticleNotFoundException;
import com.blog.repository.ArticleRepository;
import com.itextpdf.html2pdf.HtmlConverter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class ArticleExportService {

    private final ArticleRepository articleRepository;

    public byte[] generateArticlePdf(Long articleId) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new ArticleNotFoundException("Article not found with id: " + articleId));

        String html = buildHtmlForArticle(article);

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            HtmlConverter.convertToPdf(html, outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    public String generateFilename(Long articleId) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new ArticleNotFoundException("Article not found"));

        String sanitizedTitle = article.getTitle()
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .substring(0, Math.min(50, article.getTitle().length()));

        return String.format("article-%d-%s.pdf", articleId, sanitizedTitle);
    }

    private String buildHtmlForArticle(Article article) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMMM yyyy");

        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body {
                            font-family: 'Arial', sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 800px;
                            margin: 0 auto;
                            padding: 40px;
                        }
                        h1 {
                            color: #7c3aed;
                            font-size: 32px;
                            margin-bottom: 20px;
                            border-bottom: 3px solid #7c3aed;
                            padding-bottom: 10px;
                        }
                        .meta {
                            color: #666;
                            font-size: 14px;
                            margin-bottom: 30px;
                        }
                        .meta span {
                            margin-right: 20px;
                        }
                        .content {
                            font-size: 14px;
                            text-align: justify;
                        }
                        .content p {
                            margin-bottom: 15px;
                        }
                        .category, .tag {
                            display: inline-block;
                            padding: 4px 12px;
                            margin: 4px;
                            border-radius: 12px;
                            font-size: 12px;
                        }
                        .category {
                            background-color: #7c3aed;
                            color: white;
                        }
                        .tag {
                            background-color: #60a5fa;
                            color: white;
                        }
                        .tags-section {
                            margin-bottom: 20px;
                        }
                        .footer {
                            margin-top: 40px;
                            padding-top: 20px;
                            border-top: 1px solid #ddd;
                            font-size: 12px;
                            color: #999;
                            text-align: center;
                        }
                    </style>
                </head>
                <body>
                    <h1>%s</h1>

                    <div class="tags-section">
                        %s
                    </div>

                    <div class="meta">
                        <span>📝 Auteur: %s</span>
                        <span>📅 Publié le: %s</span>
                        <span>👁 %d vues</span>
                    </div>

                    <div class="content">
                        %s
                    </div>

                    <div class="footer">
                        Document généré le %s depuis ThinkLab Blog
                    </div>
                </body>
                </html>
                """.formatted(
                        article.getTitle(),
                        buildCategoriesAndTagsHtml(article),
                        article.getAuthor().getFullName(),
                        article.getCreatedAt().format(formatter),
                        article.getViewsCount(),
                        article.getContent(),
                        java.time.LocalDateTime.now().format(formatter)
                );
    }

    private String buildCategoriesAndTagsHtml(Article article) {
        StringBuilder html = new StringBuilder();

        if (article.getCategories() != null && !article.getCategories().isEmpty()) {
            article.getCategories().forEach(category ->
                html.append(String.format("<span class=\"category\">%s</span>", category.getName()))
            );
        }

        if (article.getTags() != null && !article.getTags().isEmpty()) {
            article.getTags().forEach(tag ->
                html.append(String.format("<span class=\"tag\">#%s</span>", tag.getName()))
            );
        }

        return html.toString();
    }
}
```

---

## Exemple avec iText PDF

### Version simplifiée (sans HTML)

```java
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Text;
import com.itextpdf.layout.property.TextAlignment;

public byte[] generateSimplePdf(Long articleId) {
    Article article = articleRepository.findById(articleId)
            .orElseThrow(() -> new ArticleNotFoundException("Article not found"));

    try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Title
        Paragraph title = new Paragraph(article.getTitle())
                .setFontSize(24)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER);
        document.add(title);

        // Meta info
        String meta = String.format("Par %s - Publié le %s",
                article.getAuthor().getFullName(),
                article.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        document.add(new Paragraph(meta).setFontSize(10).setItalic());

        // Content
        document.add(new Paragraph(article.getContent()).setFontSize(12));

        document.close();
        return baos.toByteArray();
    } catch (Exception e) {
        throw new RuntimeException("Error generating PDF", e);
    }
}
```

---

## Gestion des erreurs

### Exception personnalisée

```java
package com.blog.exception;

public class ArticleNotFoundException extends RuntimeException {
    public ArticleNotFoundException(String message) {
        super(message);
    }
}

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ArticleExportException extends RuntimeException {
    public ArticleExportException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

### Global Exception Handler

```java
package com.blog.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ArticleNotFoundException.class)
    public ResponseEntity<String> handleArticleNotFound(ArticleNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ex.getMessage());
    }

    @ExceptionHandler(ArticleExportException.class)
    public ResponseEntity<String> handleExportError(ArticleExportException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error generating PDF: " + ex.getMessage());
    }
}
```

---

## Tests

### Test unitaire du service

```java
package com.blog.service;

import com.blog.entity.Article;
import com.blog.entity.User;
import com.blog.repository.ArticleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ArticleExportServiceTest {

    @Mock
    private ArticleRepository articleRepository;

    @InjectMocks
    private ArticleExportService exportService;

    @Test
    void generateArticlePdf_ShouldReturnPdfBytes_WhenArticleExists() {
        // Arrange
        Long articleId = 1L;
        User author = new User();
        author.setFullName("John Doe");

        Article article = new Article();
        article.setId(articleId);
        article.setTitle("Test Article");
        article.setContent("This is test content");
        article.setAuthor(author);
        article.setCreatedAt(LocalDateTime.now());
        article.setViewsCount(100);

        when(articleRepository.findById(articleId)).thenReturn(Optional.of(article));

        // Act
        byte[] pdfBytes = exportService.generateArticlePdf(articleId);

        // Assert
        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
        verify(articleRepository).findById(articleId);
    }

    @Test
    void generateArticlePdf_ShouldThrowException_WhenArticleNotFound() {
        // Arrange
        Long articleId = 999L;
        when(articleRepository.findById(articleId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ArticleNotFoundException.class,
                () -> exportService.generateArticlePdf(articleId));
    }

    @Test
    void generateFilename_ShouldSanitizeTitle() {
        // Arrange
        Long articleId = 1L;
        Article article = new Article();
        article.setId(articleId);
        article.setTitle("Test Article with Special Chars !@#$%");

        when(articleRepository.findById(articleId)).thenReturn(Optional.of(article));

        // Act
        String filename = exportService.generateFilename(articleId);

        // Assert
        assertTrue(filename.startsWith("article-1-"));
        assertFalse(filename.contains("!"));
        assertFalse(filename.contains("@"));
        assertTrue(filename.endsWith(".pdf"));
    }
}
```

### Test d'intégration du controller

```java
package com.blog.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ArticleExportControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void exportArticleToPdf_ShouldReturnPdf_WhenArticleExists() throws Exception {
        // Assuming article with ID 1 exists in test database
        mockMvc.perform(get("/api/v1/articles/1/export/pdf"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().exists("Content-Disposition"))
                .andExpect(header().string("Content-Disposition",
                        org.hamcrest.Matchers.containsString("attachment")));
    }

    @Test
    void exportArticleToPdf_ShouldReturn404_WhenArticleNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/articles/999999/export/pdf"))
                .andExpect(status().isNotFound());
    }
}
```

---

## Améliorations possibles

### 1. **Mise en cache des PDFs**

```java
@Cacheable(value = "article-pdfs", key = "#articleId")
public byte[] generateArticlePdf(Long articleId) {
    // ... génération PDF
}

// Invalider le cache lors de la mise à jour d'un article
@CacheEvict(value = "article-pdfs", key = "#article.id")
public void updateArticle(Article article) {
    // ... mise à jour
}
```

### 2. **Génération asynchrone**

```java
@Async
public CompletableFuture<byte[]> generateArticlePdfAsync(Long articleId) {
    byte[] pdf = generateArticlePdf(articleId);
    return CompletableFuture.completedFuture(pdf);
}
```

### 3. **Watermark/Logo**

```java
// Ajouter un logo ou watermark au PDF
private void addWatermark(PdfDocument pdf) {
    // Code pour ajouter watermark/logo
}
```

### 4. **Support de plusieurs langues**

```java
public byte[] generateArticlePdf(Long articleId, Locale locale) {
    // Utiliser MessageSource pour les labels
}
```

---

## Resources

- [iText 7 Documentation](https://itextpdf.com/en/resources/books/itext-7-jump-start-tutorial-java/chapter-1-introducing-basic-building-blocks)
- [Apache PDFBox](https://pdfbox.apache.org/)
- [Flying Saucer](https://github.com/flyingsaucerproject/flyingsaucer)
- [Spring Boot File Download](https://www.baeldung.com/spring-controller-return-image-file)

---

## Frontend (Angular) - Déjà implémenté ✅

Le frontend Angular est déjà prêt avec:
- `ExportService` pour appeler l'endpoint
- Bouton "Exporter en PDF" dans `article-detail.component`
- Gestion du téléchargement automatique du fichier
- Indicateur de chargement pendant l'export
- Tracking Google Analytics de l'événement `article_export_pdf`

**Il ne reste qu'à implémenter l'endpoint backend!**
